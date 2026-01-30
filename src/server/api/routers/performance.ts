import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const performanceRouter = createTRPCRouter({
  // Get my performance metrics
  getMyPerformance: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const dateFilter = {
        date: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
      };

      // Get stored metrics
      const metrics = await ctx.prisma.performanceMetric.findMany({
        where: {
          userId,
          ...dateFilter,
        },
        orderBy: { date: "asc" },
      });

      // Get task stats
      const [tasksCompleted, tasksOnTime, tasksTotal] = await Promise.all([
        ctx.prisma.task.count({
          where: {
            assigneeId: userId,
            status: "done",
            completedAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
        }),
        ctx.prisma.task.count({
          where: {
            assigneeId: userId,
            status: "done",
            completedAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
            dueDate: { not: null },
            // On time = completedAt <= dueDate
          },
        }),
        ctx.prisma.task.count({
          where: {
            assigneeId: userId,
            createdAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
        }),
      ]);

      // Get proposal stats
      const [proposalsSubmitted, proposalsApproved] = await Promise.all([
        ctx.prisma.proposal.count({
          where: {
            creatorId: userId,
            createdAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
        }),
        ctx.prisma.proposal.count({
          where: {
            creatorId: userId,
            status: "approved",
            updatedAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
        }),
      ]);

      // Get cross-team ratings
      const ratings = await ctx.prisma.crossTeamRating.findMany({
        where: {
          marketingUserId: userId,
        },
        orderBy: { receivedAt: "desc" },
        take: 10,
      });

      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length
          : 0;

      // Get points
      const points = await ctx.prisma.userPoints.findUnique({
        where: { userId },
      });

      return {
        metrics,
        taskStats: {
          completed: tasksCompleted,
          onTimeRate: tasksCompleted > 0 ? (tasksOnTime / tasksCompleted) * 100 : 0,
          total: tasksTotal,
        },
        proposalStats: {
          submitted: proposalsSubmitted,
          approved: proposalsApproved,
          approvalRate: proposalsSubmitted > 0 ? (proposalsApproved / proposalsSubmitted) * 100 : 0,
        },
        crossTeamRating: {
          average: avgRating,
          count: ratings.length,
        },
        points: points ?? {
          totalPoints: 0,
          weeklyPoints: 0,
          monthlyPoints: 0,
          level: 1,
        },
      };
    }),

  // Get team performance (manager view)
  getTeamPerformance: adminProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
        },
      });

      const performance = await Promise.all(
        users.map(async (user) => {
          // Get task stats
          const [tasksCompleted, tasksTotal] = await Promise.all([
            ctx.prisma.task.count({
              where: {
                assigneeId: user.id,
                status: "done",
                completedAt: {
                  gte: new Date(input.startDate),
                  lte: new Date(input.endDate),
                },
              },
            }),
            ctx.prisma.task.count({
              where: {
                assigneeId: user.id,
                createdAt: {
                  gte: new Date(input.startDate),
                  lte: new Date(input.endDate),
                },
              },
            }),
          ]);

          // Get ratings
          const ratings = await ctx.prisma.crossTeamRating.findMany({
            where: { marketingUserId: user.id },
            orderBy: { receivedAt: "desc" },
            take: 5,
          });

          const avgRating =
            ratings.length > 0
              ? ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length
              : 0;

          // Get points
          const points = await ctx.prisma.userPoints.findUnique({
            where: { userId: user.id },
          });

          return {
            user,
            tasksCompleted,
            tasksTotal,
            completionRate: tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0,
            avgRating,
            points: points?.totalPoints ?? 0,
          };
        })
      );

      return performance;
    }),

  // Record a performance metric
  recordMetric: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        metricType: z.string(),
        value: z.number(),
        date: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.performanceMetric.create({
        data: {
          userId: input.userId,
          metricType: input.metricType,
          value: input.value,
          date: new Date(input.date),
        },
      });
    }),

  // Set performance goal
  setGoal: protectedProcedure
    .input(
      z.object({
        metricType: z.string(),
        targetValue: z.number(),
        period: z.enum(["weekly", "monthly", "quarterly"]),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.performanceGoal.create({
        data: {
          userId: ctx.session.user.id,
          metricType: input.metricType,
          targetValue: input.targetValue,
          period: input.period,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        },
      });
    }),

  // Get my goals
  getMyGoals: protectedProcedure.query(async ({ ctx }) => {
    const goals = await ctx.prisma.performanceGoal.findMany({
      where: {
        userId: ctx.session.user.id,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
    });

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const metrics = await ctx.prisma.performanceMetric.findMany({
          where: {
            userId: ctx.session.user.id,
            metricType: goal.metricType,
            date: {
              gte: goal.startDate,
              lte: goal.endDate,
            },
          },
        });

        const currentValue =
          metrics.length > 0
            ? metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
            : 0;

        return {
          ...goal,
          currentValue,
          progress: (currentValue / goal.targetValue) * 100,
        };
      })
    );

    return goalsWithProgress;
  }),

  // Rate staff quality (manager only)
  rateQuality: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        score: z.number().min(1).max(5),
        category: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.qualityRating.create({
        data: {
          userId: input.userId,
          raterId: ctx.session.user.id,
          score: input.score,
          category: input.category,
          notes: input.notes,
        },
      });
    }),

  // Get quality ratings for a user
  getQualityRatings: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId ?? ctx.session.user.id;

      // Check if user can view other's ratings
      if (userId !== ctx.session.user.id) {
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { role: true },
        });

        if (!["super_admin", "marketing_manager"].includes(user?.role ?? "")) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot view other users' ratings" });
        }
      }

      const ratings = await ctx.prisma.qualityRating.findMany({
        where: { userId },
        include: {
          rater: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: "desc" },
      });

      const avgScore =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
          : 0;

      return {
        ratings,
        averageScore: avgScore,
      };
    }),

  // Bonus Pool Management
  getBonusPool: adminProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const pool = await ctx.prisma.monthlyBonusPool.findUnique({
        where: { month: input.month },
        include: {
          distributions: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true, role: true },
              },
            },
          },
        },
      });

      return pool;
    }),

  createBonusPool: adminProcedure
    .input(
      z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/),
        totalRevenue: z.number().positive(),
        bonusPercentage: z.number().positive().max(1).default(0.01),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const poolAmount = input.totalRevenue * input.bonusPercentage;

      return ctx.prisma.monthlyBonusPool.create({
        data: {
          month: input.month,
          totalRevenue: input.totalRevenue,
          bonusPercentage: input.bonusPercentage,
          poolAmount,
        },
      });
    }),

  calculateBonusDistribution: adminProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .mutation(async ({ ctx, input }) => {
      const pool = await ctx.prisma.monthlyBonusPool.findUnique({
        where: { month: input.month },
      });

      if (!pool) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bonus pool not found" });
      }

      // Get all active users
      const users = await ctx.prisma.user.findMany({
        where: { isActive: true },
        include: {
          points: true,
          crossTeamRatings: {
            where: { period: input.month },
          },
        },
      });

      // Calculate total points and average ratings
      const totalPoints = users.reduce((sum, u) => sum + (u.points?.monthlyPoints ?? 0), 0);

      // Calculate distribution for each user
      const distributions = users.map((user) => {
        const userPoints = user.points?.monthlyPoints ?? 0;
        const pointsContribution = totalPoints > 0 ? userPoints / totalPoints : 0;

        const avgRating =
          user.crossTeamRatings.length > 0
            ? user.crossTeamRatings.reduce((sum, r) => sum + r.overallScore, 0) /
              user.crossTeamRatings.length
            : 3; // Default to 3 if no ratings

        const ratingContribution = avgRating / 5; // Normalize to 0-1

        // 60% based on points, 40% based on ratings
        const combinedScore = pointsContribution * 0.6 + ratingContribution * 0.4;
        const estimatedAmount = pool.poolAmount * combinedScore;

        return {
          poolId: pool.id,
          userId: user.id,
          pointsContribution,
          ratingContribution,
          managerAllocation: 0,
          finalAmount: estimatedAmount,
        };
      });

      // Delete existing distributions and create new ones
      await ctx.prisma.bonusDistribution.deleteMany({
        where: { poolId: pool.id },
      });

      await ctx.prisma.bonusDistribution.createMany({
        data: distributions,
      });

      return ctx.prisma.monthlyBonusPool.findUnique({
        where: { month: input.month },
        include: {
          distributions: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true, role: true },
              },
            },
          },
        },
      });
    }),

  updateBonusDistribution: adminProcedure
    .input(
      z.object({
        id: z.string(),
        managerAllocation: z.number().min(0),
        finalAmount: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.bonusDistribution.update({
        where: { id: input.id },
        data: {
          managerAllocation: input.managerAllocation,
          finalAmount: input.finalAmount,
        },
      });
    }),

  approveBonusPool: adminProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.monthlyBonusPool.update({
        where: { month: input.month },
        data: { status: "approved" },
      });
    }),

  // Get my estimated bonus
  getMyEstimatedBonus: protectedProcedure
    .input(z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const distribution = await ctx.prisma.bonusDistribution.findFirst({
        where: {
          userId: ctx.session.user.id,
          pool: { month: input.month },
        },
        include: {
          pool: true,
        },
      });

      return distribution;
    }),
});
