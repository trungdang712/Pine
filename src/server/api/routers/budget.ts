import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const platformEnum = z.enum(["google_ads", "facebook", "zalo"]);

export const budgetRouter = createTRPCRouter({
  getByMonth: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const budget = await ctx.prisma.monthlyBudget.findUnique({
        where: { month: input.month },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
          approvedBy: {
            select: { id: true, name: true },
          },
          spends: {
            orderBy: { date: "asc" },
          },
          alerts: {
            orderBy: { triggeredAt: "desc" },
          },
        },
      });

      if (!budget) {
        return null;
      }

      // Calculate totals and status
      const spendByPlatform: Record<string, number> = {
        google_ads: 0,
        facebook: 0,
        zalo: 0,
      };

      const spendByDate: Record<string, number> = {};

      for (const spend of budget.spends) {
        spendByPlatform[spend.platform] = (spendByPlatform[spend.platform] || 0) + spend.amount;
        const dateKey = spend.date.toISOString().split("T")[0];
        spendByDate[dateKey] = (spendByDate[dateKey] || 0) + spend.amount;
      }

      const totalSpent = Object.values(spendByPlatform).reduce((a, b) => a + b, 0);

      // Calculate days elapsed in month
      const [year, month] = input.month.split("-").map(Number);
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      const today = new Date();
      const daysInMonth = endOfMonth.getDate();
      const daysElapsed = Math.min(
        Math.max(Math.floor((today.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1, 0),
        daysInMonth
      );
      const daysRemaining = daysInMonth - daysElapsed;

      // Calculate pace
      const percentSpent = (totalSpent / budget.totalBudget) * 100;
      const percentTimeElapsed = (daysElapsed / daysInMonth) * 100;
      const dailyPace = daysElapsed > 0 ? totalSpent / daysElapsed : 0;
      const suggestedDaily = daysRemaining > 0 ? (budget.totalBudget - totalSpent) / daysRemaining : 0;
      const projectedSpend = dailyPace * daysInMonth;

      // Platform status
      const platformStatus = {
        google_ads: calculatePlatformStatus(
          spendByPlatform.google_ads,
          budget.googleAdsAllocation,
          percentTimeElapsed
        ),
        facebook: calculatePlatformStatus(
          spendByPlatform.facebook,
          budget.facebookAllocation,
          percentTimeElapsed
        ),
        zalo: calculatePlatformStatus(
          spendByPlatform.zalo,
          budget.zaloAllocation,
          percentTimeElapsed
        ),
      };

      return {
        ...budget,
        totalSpent,
        remaining: budget.totalBudget - totalSpent,
        percentSpent,
        percentTimeElapsed,
        daysElapsed,
        daysRemaining,
        daysInMonth,
        dailyPace,
        suggestedDaily,
        projectedSpend,
        spendByPlatform,
        spendByDate: Object.entries(spendByDate).map(([date, amount]) => ({ date, amount })),
        platformStatus,
      };
    }),

  create: adminProcedure
    .input(
      z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/),
        totalBudget: z.number().positive(),
        googleAdsAllocation: z.number().min(0),
        facebookAllocation: z.number().min(0),
        zaloAllocation: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate allocations sum to total
      const totalAllocation = input.googleAdsAllocation + input.facebookAllocation + input.zaloAllocation;
      if (Math.abs(totalAllocation - input.totalBudget) > 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Platform allocations must sum to total budget",
        });
      }

      const budget = await ctx.prisma.monthlyBudget.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
          status: "draft",
        },
      });

      return budget;
    }),

  update: adminProcedure
    .input(
      z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/),
        totalBudget: z.number().positive().optional(),
        googleAdsAllocation: z.number().min(0).optional(),
        facebookAllocation: z.number().min(0).optional(),
        zaloAllocation: z.number().min(0).optional(),
        status: z.enum(["draft", "active", "closed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { month, ...data } = input;

      const budget = await ctx.prisma.monthlyBudget.findUnique({
        where: { month },
      });

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      // If activating, set approver
      const updateData: Record<string, unknown> = { ...data };
      if (data.status === "active" && budget.status !== "active") {
        updateData.approvedById = ctx.session.user.id;
      }

      return ctx.prisma.monthlyBudget.update({
        where: { month },
        data: updateData,
      });
    }),

  recordSpend: adminProcedure
    .input(
      z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/),
        platform: platformEnum,
        date: z.string().datetime(),
        amount: z.number().positive(),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const budget = await ctx.prisma.monthlyBudget.findUnique({
        where: { month: input.month },
      });

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      const spend = await ctx.prisma.budgetSpend.create({
        data: {
          budgetId: budget.id,
          platform: input.platform,
          date: new Date(input.date),
          amount: input.amount,
          campaignId: input.campaignId,
        },
      });

      // Check for alerts
      await checkBudgetAlerts(ctx.prisma, budget.id);

      return spend;
    }),

  getAlerts: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const budget = await ctx.prisma.monthlyBudget.findUnique({
        where: { month: input.month },
      });

      if (!budget) {
        return [];
      }

      return ctx.prisma.budgetAlert.findMany({
        where: { budgetId: budget.id },
        orderBy: { triggeredAt: "desc" },
      });
    }),

  markAlertRead: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.budgetAlert.update({
        where: { id: input.alertId },
        data: { isRead: true },
      });
    }),

  copyFromPreviousMonth: adminProcedure
    .input(z.object({ targetMonth: z.string().regex(/^\d{4}-\d{2}$/) }))
    .mutation(async ({ ctx, input }) => {
      // Calculate previous month
      const [year, month] = input.targetMonth.split("-").map(Number);
      const prevMonth = month === 1
        ? `${year - 1}-12`
        : `${year}-${String(month - 1).padStart(2, "0")}`;

      const previousBudget = await ctx.prisma.monthlyBudget.findUnique({
        where: { month: prevMonth },
      });

      if (!previousBudget) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No budget found for previous month",
        });
      }

      // Check if target month already has a budget
      const existing = await ctx.prisma.monthlyBudget.findUnique({
        where: { month: input.targetMonth },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Budget already exists for this month",
        });
      }

      return ctx.prisma.monthlyBudget.create({
        data: {
          month: input.targetMonth,
          totalBudget: previousBudget.totalBudget,
          googleAdsAllocation: previousBudget.googleAdsAllocation,
          facebookAllocation: previousBudget.facebookAllocation,
          zaloAllocation: previousBudget.zaloAllocation,
          currency: previousBudget.currency,
          createdById: ctx.session.user.id,
          status: "draft",
        },
      });
    }),

  getHistory: protectedProcedure
    .input(
      z.object({
        months: z.number().min(1).max(24).default(6),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const budgets = await ctx.prisma.monthlyBudget.findMany({
        orderBy: { month: "desc" },
        take: input?.months ?? 6,
        include: {
          spends: true,
        },
      });

      return budgets.map((budget) => {
        const totalSpent = budget.spends.reduce((sum, s) => sum + s.amount, 0);
        const utilization = (totalSpent / budget.totalBudget) * 100;

        return {
          month: budget.month,
          totalBudget: budget.totalBudget,
          totalSpent,
          utilization,
          status: budget.status,
        };
      });
    }),
});

function calculatePlatformStatus(
  spent: number,
  allocated: number,
  percentTimeElapsed: number
): "on_track" | "over_pace" | "under_pace" {
  if (allocated === 0) return "on_track";

  const percentSpent = (spent / allocated) * 100;
  const threshold = 5;

  if (percentSpent > percentTimeElapsed + threshold) return "over_pace";
  if (percentSpent < percentTimeElapsed - threshold) return "under_pace";
  return "on_track";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkBudgetAlerts(prisma: any, budgetId: string) {
  const budget = await prisma.monthlyBudget.findUnique({
    where: { id: budgetId },
    include: { spends: true, alerts: true },
  });

  if (!budget) return;

  const totalSpent = budget.spends.reduce((sum: number, s: { amount: number }) => sum + s.amount, 0);
  const percentSpent = (totalSpent / budget.totalBudget) * 100;

  // Check 50% threshold
  if (percentSpent >= 50 && !budget.alerts.some((a: { type: string }) => a.type === "50_percent")) {
    await prisma.budgetAlert.create({
      data: {
        budgetId,
        type: "50_percent",
        threshold: 50,
        message: "50% of monthly budget has been spent",
      },
    });
  }

  // Check 80% threshold
  if (percentSpent >= 80 && !budget.alerts.some((a: { type: string }) => a.type === "80_percent")) {
    await prisma.budgetAlert.create({
      data: {
        budgetId,
        type: "80_percent",
        threshold: 80,
        message: "80% of monthly budget has been spent - approaching limit",
      },
    });
  }

  // Check pace
  const [year, month] = budget.month.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const daysElapsed = Math.floor((today.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const percentTimeElapsed = (daysElapsed / daysInMonth) * 100;

  if (percentSpent > percentTimeElapsed + 10 && !budget.alerts.some((a: { type: string }) => a.type === "over_pace")) {
    await prisma.budgetAlert.create({
      data: {
        budgetId,
        type: "over_pace",
        message: `Spending is ${(percentSpent - percentTimeElapsed).toFixed(1)}% ahead of pace`,
      },
    });
  }
}
