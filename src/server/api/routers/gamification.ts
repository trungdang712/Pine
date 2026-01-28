import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const gamificationRouter = createTRPCRouter({
  // Points
  getMyPoints: protectedProcedure.query(async ({ ctx }) => {
    const points = await ctx.prisma.userPoints.findUnique({
      where: { userId: ctx.session.user.id },
    });

    const recentTransactions = await ctx.prisma.pointTransaction.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      points: points ?? {
        totalPoints: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
      recentTransactions,
    };
  }),

  getPointsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.prisma.pointTransaction.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        skip: input?.cursor ? 1 : 0,
      });

      return {
        transactions,
        nextCursor:
          transactions.length === (input?.limit ?? 50)
            ? transactions[transactions.length - 1]?.id
            : undefined,
      };
    }),

  // Leaderboards
  getWeeklyLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userPoints.findMany({
      orderBy: { weeklyPoints: "desc" },
      take: 20,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });
  }),

  getMonthlyLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userPoints.findMany({
      orderBy: { monthlyPoints: "desc" },
      take: 20,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });
  }),

  getAllTimeLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userPoints.findMany({
      orderBy: { totalPoints: "desc" },
      take: 20,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });
  }),

  // Achievements
  getMyAchievements: protectedProcedure.query(async ({ ctx }) => {
    const userAchievements = await ctx.prisma.userAchievement.findMany({
      where: { userId: ctx.session.user.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });

    const allAchievements = await ctx.prisma.achievement.findMany({
      orderBy: { category: "asc" },
    });

    return {
      earned: userAchievements.map((ua) => ({
        ...ua.achievement,
        earnedAt: ua.earnedAt,
      })),
      available: allAchievements.filter(
        (a) => !userAchievements.some((ua) => ua.achievementId === a.id)
      ),
    };
  }),

  getAllAchievements: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.achievement.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }),

  // Innovation Ideas
  submitIdea: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(10),
        category: z.enum([
          "content_format",
          "process_improvement",
          "new_platform",
          "campaign_concept",
          "automation",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const idea = await ctx.prisma.innovationIdea.create({
        data: {
          ...input,
          submitterId: ctx.session.user.id,
        },
      });

      // Award points for submitting an idea
      await ctx.prisma.pointTransaction.create({
        data: {
          userId: ctx.session.user.id,
          action: "innovation_idea",
          points: 30,
          description: `Submitted innovation idea: ${input.title}`,
          referenceId: idea.id,
        },
      });

      await ctx.prisma.userPoints.upsert({
        where: { userId: ctx.session.user.id },
        update: {
          totalPoints: { increment: 30 },
          weeklyPoints: { increment: 30 },
          monthlyPoints: { increment: 30 },
        },
        create: {
          userId: ctx.session.user.id,
          totalPoints: 30,
          weeklyPoints: 30,
          monthlyPoints: 30,
        },
      });

      return idea;
    }),

  getMyIdeas: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.innovationIdea.findMany({
      where: { submitterId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getAllIdeas: adminProcedure
    .input(
      z.object({
        status: z
          .enum(["submitted", "reviewing", "approved", "implemented", "rejected"])
          .optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input?.status) where.status = input.status;

      return ctx.prisma.innovationIdea.findMany({
        where,
        include: {
          submitter: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  updateIdeaStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["reviewing", "approved", "implemented", "rejected"]),
        impactScore: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, status, impactScore } = input;

      const idea = await ctx.prisma.innovationIdea.findUnique({
        where: { id },
      });

      if (!idea) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Idea not found" });
      }

      const updateData: Record<string, unknown> = { status };
      if (impactScore !== undefined) updateData.impactScore = impactScore;
      if (status === "implemented") updateData.implementedAt = new Date();

      const updated = await ctx.prisma.innovationIdea.update({
        where: { id },
        data: updateData,
      });

      // Award bonus points if implemented
      if (status === "implemented" && idea.status !== "implemented") {
        await ctx.prisma.pointTransaction.create({
          data: {
            userId: idea.submitterId,
            action: "innovation_implemented",
            points: 50,
            description: `Innovation idea implemented: ${idea.title}`,
            referenceId: id,
          },
        });

        await ctx.prisma.userPoints.update({
          where: { userId: idea.submitterId },
          data: {
            totalPoints: { increment: 50 },
            weeklyPoints: { increment: 50 },
            monthlyPoints: { increment: 50 },
          },
        });

        // Notify submitter
        await ctx.prisma.userAlert.create({
          data: {
            userId: idea.submitterId,
            type: "innovation_implemented",
            title: "Your Idea Was Implemented!",
            message: `Your innovation idea "${idea.title}" has been implemented. +50 points!`,
            link: `/gamification/ideas`,
          },
        });
      }

      return updated;
    }),

  // Rewards
  getAvailableRewards: protectedProcedure.query(async ({ ctx }) => {
    const [rewards, userPoints] = await Promise.all([
      ctx.prisma.reward.findMany({
        where: { isActive: true },
        orderBy: { pointsCost: "asc" },
      }),
      ctx.prisma.userPoints.findUnique({
        where: { userId: ctx.session.user.id },
        select: { totalPoints: true },
      }),
    ]);

    return {
      rewards,
      currentPoints: userPoints?.totalPoints ?? 0,
    };
  }),

  redeemReward: protectedProcedure
    .input(z.object({ rewardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [reward, userPoints] = await Promise.all([
        ctx.prisma.reward.findUnique({
          where: { id: input.rewardId },
        }),
        ctx.prisma.userPoints.findUnique({
          where: { userId: ctx.session.user.id },
        }),
      ]);

      if (!reward || !reward.isActive) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reward not found or inactive" });
      }

      if (!userPoints || userPoints.totalPoints < reward.pointsCost) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient points" });
      }

      // Create redemption and deduct points
      const [redemption] = await Promise.all([
        ctx.prisma.rewardRedemption.create({
          data: {
            userId: ctx.session.user.id,
            rewardId: input.rewardId,
            status: "pending",
          },
        }),
        ctx.prisma.userPoints.update({
          where: { userId: ctx.session.user.id },
          data: {
            totalPoints: { decrement: reward.pointsCost },
          },
        }),
        ctx.prisma.pointTransaction.create({
          data: {
            userId: ctx.session.user.id,
            action: "reward_redeemed",
            points: -reward.pointsCost,
            description: `Redeemed reward: ${reward.name}`,
          },
        }),
      ]);

      return redemption;
    }),

  getMyRedemptions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.rewardRedemption.findMany({
      where: { userId: ctx.session.user.id },
      include: { reward: true },
      orderBy: { redeemedAt: "desc" },
    });
  }),

  // Admin: Create achievement
  createAchievement: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        iconUrl: z.string().optional(),
        category: z.enum(["performance", "innovation", "collaboration", "content"]),
        criteria: z.string(), // JSON string
        points: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.achievement.create({
        data: input,
      });
    }),

  // Admin: Create reward
  createReward: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        pointsCost: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.reward.create({
        data: input,
      });
    }),

  // Admin: Process redemption
  processRedemption: adminProcedure
    .input(
      z.object({
        redemptionId: z.string(),
        status: z.enum(["approved", "fulfilled", "rejected"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const redemption = await ctx.prisma.rewardRedemption.findUnique({
        where: { id: input.redemptionId },
        include: { reward: true },
      });

      if (!redemption) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Redemption not found" });
      }

      const updateData: Record<string, unknown> = { status: input.status };
      if (input.status === "fulfilled") {
        updateData.fulfilledAt = new Date();
      }

      // If rejected, refund points
      if (input.status === "rejected") {
        await ctx.prisma.userPoints.update({
          where: { userId: redemption.userId },
          data: {
            totalPoints: { increment: redemption.reward.pointsCost },
          },
        });

        await ctx.prisma.pointTransaction.create({
          data: {
            userId: redemption.userId,
            action: "reward_refunded",
            points: redemption.reward.pointsCost,
            description: `Refund for rejected redemption: ${redemption.reward.name}`,
          },
        });
      }

      return ctx.prisma.rewardRedemption.update({
        where: { id: input.redemptionId },
        data: updateData,
      });
    }),

  // Reset weekly points (for cron job)
  resetWeeklyPoints: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.userPoints.updateMany({
      data: { weeklyPoints: 0 },
    });
    return { success: true };
  }),

  // Reset monthly points (for cron job)
  resetMonthlyPoints: adminProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.userPoints.updateMany({
      data: { monthlyPoints: 0 },
    });
    return { success: true };
  }),
});
