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
      include: {
        _count: {
          select: { votes: true, comments: true },
        },
        votes: {
          where: { voterId: ctx.session.user.id },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getAllIdeas: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["submitted", "reviewing", "approved", "implemented", "rejected"])
          .optional(),
        sortBy: z.enum(["recent", "top_voted", "most_discussed"]).optional().default("recent"),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input?.status) where.status = input.status;
      if (input?.category) where.category = input.category;

      let orderBy: Record<string, unknown>[] = [{ createdAt: "desc" }];
      if (input?.sortBy === "top_voted") {
        orderBy = [{ voteCount: "desc" }, { createdAt: "desc" }];
      }

      const ideas = await ctx.prisma.innovationIdea.findMany({
        where,
        include: {
          submitter: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { votes: true, comments: true },
          },
          votes: {
            where: { voterId: ctx.session.user.id },
            select: { id: true },
          },
        },
        orderBy,
      });

      // If sorting by most discussed, re-sort after fetching
      if (input?.sortBy === "most_discussed") {
        ideas.sort((a, b) => b._count.comments - a._count.comments);
      }

      return ideas;
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

  // Vote for an idea
  voteForIdea: protectedProcedure
    .input(z.object({ ideaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const idea = await ctx.prisma.innovationIdea.findUnique({
        where: { id: input.ideaId },
      });

      if (!idea) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Idea not found" });
      }

      // Check if user already voted
      const existingVote = await ctx.prisma.ideaVote.findUnique({
        where: {
          ideaId_voterId: {
            ideaId: input.ideaId,
            voterId: ctx.session.user.id,
          },
        },
      });

      if (existingVote) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already voted" });
      }

      // Create vote and update vote count
      await ctx.prisma.$transaction([
        ctx.prisma.ideaVote.create({
          data: {
            ideaId: input.ideaId,
            voterId: ctx.session.user.id,
          },
        }),
        ctx.prisma.innovationIdea.update({
          where: { id: input.ideaId },
          data: { voteCount: { increment: 1 } },
        }),
      ]);

      // Award points to voter
      await ctx.prisma.pointTransaction.create({
        data: {
          userId: ctx.session.user.id,
          action: "vote_idea",
          points: 2,
          description: `Voted for idea: ${idea.title}`,
          referenceId: input.ideaId,
        },
      });

      await ctx.prisma.userPoints.upsert({
        where: { userId: ctx.session.user.id },
        update: {
          totalPoints: { increment: 2 },
          weeklyPoints: { increment: 2 },
          monthlyPoints: { increment: 2 },
        },
        create: {
          userId: ctx.session.user.id,
          totalPoints: 2,
          weeklyPoints: 2,
          monthlyPoints: 2,
        },
      });

      // Check for milestone votes and award bonus points to idea submitter
      const newVoteCount = idea.voteCount + 1;
      if (newVoteCount === 5) {
        await ctx.prisma.pointTransaction.create({
          data: {
            userId: idea.submitterId,
            action: "idea_5_votes",
            points: 10,
            description: `Idea "${idea.title}" reached 5 votes!`,
            referenceId: input.ideaId,
          },
        });
        await ctx.prisma.userPoints.update({
          where: { userId: idea.submitterId },
          data: {
            totalPoints: { increment: 10 },
            weeklyPoints: { increment: 10 },
            monthlyPoints: { increment: 10 },
          },
        });
      } else if (newVoteCount === 10) {
        await ctx.prisma.pointTransaction.create({
          data: {
            userId: idea.submitterId,
            action: "idea_10_votes",
            points: 20,
            description: `Idea "${idea.title}" reached 10 votes!`,
            referenceId: input.ideaId,
          },
        });
        await ctx.prisma.userPoints.update({
          where: { userId: idea.submitterId },
          data: {
            totalPoints: { increment: 20 },
            weeklyPoints: { increment: 20 },
            monthlyPoints: { increment: 20 },
          },
        });
      }

      return { success: true, voteCount: newVoteCount };
    }),

  // Remove vote from an idea
  removeVote: protectedProcedure
    .input(z.object({ ideaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingVote = await ctx.prisma.ideaVote.findUnique({
        where: {
          ideaId_voterId: {
            ideaId: input.ideaId,
            voterId: ctx.session.user.id,
          },
        },
      });

      if (!existingVote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vote not found" });
      }

      // Remove vote and update count
      await ctx.prisma.$transaction([
        ctx.prisma.ideaVote.delete({
          where: { id: existingVote.id },
        }),
        ctx.prisma.innovationIdea.update({
          where: { id: input.ideaId },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);

      return { success: true };
    }),

  // Get comments for an idea
  getIdeaComments: protectedProcedure
    .input(z.object({ ideaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.ideaComment.findMany({
        where: {
          ideaId: input.ideaId,
          parentId: null, // Top-level comments only
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          replies: {
            include: {
              author: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Add comment to an idea
  addIdeaComment: protectedProcedure
    .input(
      z.object({
        ideaId: z.string(),
        content: z.string().min(1),
        parentId: z.string().optional(), // For replies
      })
    )
    .mutation(async ({ ctx, input }) => {
      const idea = await ctx.prisma.innovationIdea.findUnique({
        where: { id: input.ideaId },
      });

      if (!idea) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Idea not found" });
      }

      const comment = await ctx.prisma.ideaComment.create({
        data: {
          ideaId: input.ideaId,
          authorId: ctx.session.user.id,
          content: input.content,
          parentId: input.parentId,
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Award points for commenting
      await ctx.prisma.pointTransaction.create({
        data: {
          userId: ctx.session.user.id,
          action: "comment_idea",
          points: 3,
          description: `Commented on idea: ${idea.title}`,
          referenceId: comment.id,
        },
      });

      await ctx.prisma.userPoints.upsert({
        where: { userId: ctx.session.user.id },
        update: {
          totalPoints: { increment: 3 },
          weeklyPoints: { increment: 3 },
          monthlyPoints: { increment: 3 },
        },
        create: {
          userId: ctx.session.user.id,
          totalPoints: 3,
          weeklyPoints: 3,
          monthlyPoints: 3,
        },
      });

      // Notify idea submitter (if not self-commenting)
      if (idea.submitterId !== ctx.session.user.id) {
        const commenter = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { name: true },
        });

        await ctx.prisma.userAlert.create({
          data: {
            userId: idea.submitterId,
            type: "idea_comment",
            title: "New Comment on Your Idea",
            message: `${commenter?.name ?? "Someone"} commented on "${idea.title}"`,
            link: `/proposals/ideas`,
          },
        });
      }

      return comment;
    }),

  // Delete comment
  deleteIdeaComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.ideaComment.findUnique({
        where: { id: input.commentId },
      });

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }

      // Only author can delete
      if (comment.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await ctx.prisma.ideaComment.delete({
        where: { id: input.commentId },
      });

      return { success: true };
    }),

  // Get idea details with all data
  getIdeaById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const idea = await ctx.prisma.innovationIdea.findUnique({
        where: { id: input.id },
        include: {
          submitter: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { votes: true, comments: true },
          },
          votes: {
            where: { voterId: ctx.session.user.id },
            select: { id: true },
          },
          comments: {
            where: { parentId: null },
            include: {
              author: {
                select: { id: true, name: true, avatar: true },
              },
              replies: {
                include: {
                  author: {
                    select: { id: true, name: true, avatar: true },
                  },
                },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!idea) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Idea not found" });
      }

      return idea;
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

  // ==================== BADGES ====================

  // Badge types
  // first_seed - Submit first idea
  // idea_machine - Submit 10 ideas
  // trending - Get 20+ votes on single idea
  // star_innovator - 3 ideas implemented
  // game_changer - Proposal saved >10M VND or increased KPI >20%
  // collaborator - Co-create 5 proposals
  // innovation_champion - Top innovator of the month

  getMyBadges: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userBadge.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { earnedAt: "desc" },
    });
  }),

  getUserBadges: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.userBadge.findMany({
        where: { userId: input.userId },
        orderBy: { earnedAt: "desc" },
      });
    }),

  // Award badge (admin only, or system triggered)
  awardBadge: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        badgeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if already has badge
      const existing = await ctx.prisma.userBadge.findUnique({
        where: {
          userId_badgeType: {
            userId: input.userId,
            badgeType: input.badgeType,
          },
        },
      });

      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User already has this badge" });
      }

      const badge = await ctx.prisma.userBadge.create({
        data: {
          userId: input.userId,
          badgeType: input.badgeType,
        },
      });

      // Notify user
      await ctx.prisma.userAlert.create({
        data: {
          userId: input.userId,
          type: "badge_earned",
          title: "New Badge Earned!",
          message: `You earned the "${input.badgeType}" badge!`,
          link: `/gamification/achievements`,
        },
      });

      return badge;
    }),

  // Check and award badges automatically
  checkAndAwardBadges: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const awardedBadges: string[] = [];

    // Get user's idea stats
    const ideaStats = await ctx.prisma.innovationIdea.aggregate({
      where: { submitterId: userId },
      _count: { id: true },
    });

    const implementedIdeas = await ctx.prisma.innovationIdea.count({
      where: { submitterId: userId, status: "implemented" },
    });

    const topVotedIdea = await ctx.prisma.innovationIdea.findFirst({
      where: { submitterId: userId },
      orderBy: { voteCount: "desc" },
      select: { voteCount: true },
    });

    const collaborationCount = await ctx.prisma.proposalCollaborator.count({
      where: { userId },
    });

    // Check badges
    const existingBadges = await ctx.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeType: true },
    });
    const hasBadge = (type: string) => existingBadges.some((b) => b.badgeType === type);

    // first_seed - Submit first idea
    if (!hasBadge("first_seed") && (ideaStats._count.id ?? 0) >= 1) {
      await ctx.prisma.userBadge.create({
        data: { userId, badgeType: "first_seed" },
      });
      awardedBadges.push("first_seed");
    }

    // idea_machine - Submit 10 ideas
    if (!hasBadge("idea_machine") && (ideaStats._count.id ?? 0) >= 10) {
      await ctx.prisma.userBadge.create({
        data: { userId, badgeType: "idea_machine" },
      });
      awardedBadges.push("idea_machine");
    }

    // trending - Get 20+ votes on single idea
    if (!hasBadge("trending") && (topVotedIdea?.voteCount ?? 0) >= 20) {
      await ctx.prisma.userBadge.create({
        data: { userId, badgeType: "trending" },
      });
      awardedBadges.push("trending");
    }

    // star_innovator - 3 ideas implemented
    if (!hasBadge("star_innovator") && implementedIdeas >= 3) {
      await ctx.prisma.userBadge.create({
        data: { userId, badgeType: "star_innovator" },
      });
      awardedBadges.push("star_innovator");
    }

    // collaborator - Co-create 5 proposals
    if (!hasBadge("collaborator") && collaborationCount >= 5) {
      await ctx.prisma.userBadge.create({
        data: { userId, badgeType: "collaborator" },
      });
      awardedBadges.push("collaborator");
    }

    // Notify about new badges
    for (const badge of awardedBadges) {
      await ctx.prisma.userAlert.create({
        data: {
          userId,
          type: "badge_earned",
          title: "New Badge Earned!",
          message: `You earned the "${badge}" badge!`,
          link: `/gamification/achievements`,
        },
      });
    }

    return { awardedBadges };
  }),

  // ==================== IDEA OF THE MONTH ====================

  // Get current/past Idea of the Month
  getIdeaOfMonth: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12).optional(),
        year: z.number().min(2020).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? now.getMonth() + 1;
      const year = input?.year ?? now.getFullYear();

      return ctx.prisma.ideaOfMonth.findUnique({
        where: {
          month_year: { month, year },
        },
        include: {
          idea: {
            include: {
              submitter: {
                select: { id: true, name: true, avatar: true },
              },
              _count: {
                select: { votes: true, comments: true },
              },
            },
          },
        },
      });
    }),

  // Get all Ideas of the Month (history)
  getIdeasOfMonthHistory: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.ideaOfMonth.findMany({
      include: {
        idea: {
          include: {
            submitter: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    });
  }),

  // Set Idea of the Month (admin only)
  setIdeaOfMonth: adminProcedure
    .input(
      z.object({
        ideaId: z.string(),
        month: z.number().min(1).max(12),
        year: z.number().min(2020),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const idea = await ctx.prisma.innovationIdea.findUnique({
        where: { id: input.ideaId },
      });

      if (!idea) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Idea not found" });
      }

      // Check if already set for this month
      const existing = await ctx.prisma.ideaOfMonth.findUnique({
        where: {
          month_year: { month: input.month, year: input.year },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Idea of the month already set for this period",
        });
      }

      const ideaOfMonth = await ctx.prisma.ideaOfMonth.create({
        data: {
          ideaId: input.ideaId,
          month: input.month,
          year: input.year,
          selectedBy: ctx.session.user.id,
        },
        include: {
          idea: {
            include: {
              submitter: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      });

      // Award innovation_champion badge to submitter
      const existingBadge = await ctx.prisma.userBadge.findUnique({
        where: {
          userId_badgeType: {
            userId: idea.submitterId,
            badgeType: "innovation_champion",
          },
        },
      });

      if (!existingBadge) {
        await ctx.prisma.userBadge.create({
          data: {
            userId: idea.submitterId,
            badgeType: "innovation_champion",
          },
        });
      }

      // Award bonus points
      await ctx.prisma.pointTransaction.create({
        data: {
          userId: idea.submitterId,
          action: "idea_of_month",
          points: 100,
          description: `Idea of the Month: ${idea.title}`,
          referenceId: input.ideaId,
        },
      });

      await ctx.prisma.userPoints.update({
        where: { userId: idea.submitterId },
        data: {
          totalPoints: { increment: 100 },
          weeklyPoints: { increment: 100 },
          monthlyPoints: { increment: 100 },
        },
      });

      // Notify submitter
      await ctx.prisma.userAlert.create({
        data: {
          userId: idea.submitterId,
          type: "idea_of_month",
          title: "Your Idea is Idea of the Month!",
          message: `Your idea "${idea.title}" was selected as Idea of the Month! +100 points`,
          link: `/proposals/ideas`,
        },
      });

      return ideaOfMonth;
    }),

  // ==================== INNOVATION LEADERBOARD ====================

  getInnovationLeaderboard: protectedProcedure.query(async ({ ctx }) => {
    // Get innovation metrics for all users
    const users = await ctx.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        innovationIdeas: {
          select: {
            id: true,
            status: true,
            voteCount: true,
          },
        },
        proposalCollaborations: {
          select: { id: true },
        },
        badges: {
          select: { badgeType: true },
        },
        points: {
          select: { totalPoints: true, monthlyPoints: true },
        },
      },
    });

    const leaderboard = users.map((user) => {
      const ideasSubmitted = user.innovationIdeas.length;
      const ideasImplemented = user.innovationIdeas.filter(
        (i) => i.status === "implemented"
      ).length;
      const totalVotes = user.innovationIdeas.reduce(
        (sum, i) => sum + i.voteCount,
        0
      );
      const collaborations = user.proposalCollaborations.length;
      const badgeCount = user.badges.length;

      // Calculate innovation score
      const innovationScore =
        ideasSubmitted * 30 +
        ideasImplemented * 50 +
        totalVotes * 2 +
        collaborations * 10 +
        badgeCount * 20;

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        ideasSubmitted,
        ideasImplemented,
        totalVotes,
        collaborations,
        badgeCount,
        innovationScore,
        totalPoints: user.points?.totalPoints ?? 0,
        monthlyPoints: user.points?.monthlyPoints ?? 0,
      };
    });

    // Sort by innovation score
    return leaderboard
      .sort((a, b) => b.innovationScore - a.innovationScore)
      .slice(0, 20);
  }),

  // Get user's innovation metrics
  getMyInnovationMetrics: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [ideas, collaborations, badges, points, rank] = await Promise.all([
      ctx.prisma.innovationIdea.findMany({
        where: { submitterId: userId },
        select: { status: true, voteCount: true },
      }),
      ctx.prisma.proposalCollaborator.count({ where: { userId } }),
      ctx.prisma.userBadge.findMany({ where: { userId } }),
      ctx.prisma.userPoints.findUnique({ where: { userId } }),
      // Calculate rank
      ctx.prisma.userPoints.count({
        where: {
          totalPoints: {
            gt: (
              await ctx.prisma.userPoints.findUnique({
                where: { userId },
                select: { totalPoints: true },
              })
            )?.totalPoints ?? 0,
          },
        },
      }),
    ]);

    const ideasSubmitted = ideas.length;
    const ideasImplemented = ideas.filter((i) => i.status === "implemented").length;
    const totalVotesReceived = ideas.reduce((sum, i) => sum + i.voteCount, 0);
    const avgVotesPerIdea = ideasSubmitted > 0 ? totalVotesReceived / ideasSubmitted : 0;
    const implementationRate = ideasSubmitted > 0 ? (ideasImplemented / ideasSubmitted) * 100 : 0;

    return {
      ideasSubmitted,
      ideasImplemented,
      implementationRate,
      totalVotesReceived,
      avgVotesPerIdea,
      collaborations,
      badges: badges.map((b) => b.badgeType),
      totalPoints: points?.totalPoints ?? 0,
      monthlyPoints: points?.monthlyPoints ?? 0,
      rank: rank + 1,
    };
  }),
});
