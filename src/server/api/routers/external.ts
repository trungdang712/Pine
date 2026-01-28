import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// External API Gateway routers for receiving data from other systems

export const externalRouter = createTRPCRouter({
  // Content Opportunities (from Sales/Nurse portal)
  submitContentOpportunity: publicProcedure
    .input(
      z.object({
        submitterName: z.string().min(1),
        submitterEmail: z.string().email(),
        submitterTeam: z.enum(["sales", "nurse"]),
        patientRef: z.string().optional(),
        consentStatus: z.enum(["pending", "obtained", "declined"]).default("pending"),
        type: z.enum(["testimonial", "before_after", "success_story", "educational"]),
        description: z.string().min(10),
        urgency: z.enum(["urgent", "normal", "low"]).default("normal"),
        attachments: z.array(z.string()).optional(),
        externalSystemRef: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const opportunity = await ctx.prisma.contentOpportunity.create({
        data: {
          ...input,
          attachments: input.attachments ? JSON.stringify(input.attachments) : null,
        },
      });

      // Notify marketing managers
      const managers = await ctx.prisma.user.findMany({
        where: { role: "marketing_manager", isActive: true },
        select: { id: true },
      });

      await ctx.prisma.userAlert.createMany({
        data: managers.map((m) => ({
          userId: m.id,
          type: "content_opportunity",
          title: "New Content Opportunity",
          message: `${input.type} submission from ${input.submitterTeam} team`,
          link: `/inbox/opportunities/${opportunity.id}`,
        })),
      });

      return {
        opportunityId: opportunity.id,
        status: "received",
      };
    }),

  getContentOpportunities: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["new", "accepted", "declined", "need_more_info", "in_progress", "published"])
          .optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input?.status) where.status = input.status;

      return ctx.prisma.contentOpportunity.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, avatar: true },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
        orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
      });
    }),

  updateContentOpportunity: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z
          .enum(["accepted", "declined", "need_more_info", "in_progress", "published"])
          .optional(),
        assignedToId: z.string().optional(),
        relatedTaskId: z.string().optional(),
        relatedProposalId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const opportunity = await ctx.prisma.contentOpportunity.update({
        where: { id },
        data,
        include: {
          assignedTo: {
            select: { id: true, name: true },
          },
        },
      });

      // If external system ref exists, we would send a callback here
      // In production, this would be an HTTP call to the external system

      return opportunity;
    }),

  addOpportunityComment: protectedProcedure
    .input(
      z.object({
        opportunityId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.opportunityComment.create({
        data: {
          opportunityId: input.opportunityId,
          userId: ctx.session.user.id,
          content: input.content,
        },
      });
    }),

  // Task Requests (from other teams)
  submitTaskRequest: publicProcedure
    .input(
      z.object({
        requesterTeam: z.enum(["sales", "accounting", "customer_service", "medical"]),
        requesterName: z.string().min(1),
        requesterEmail: z.string().email(),
        requestType: z.enum(["design", "content", "video", "other"]),
        title: z.string().min(1),
        description: z.string().min(10),
        urgency: z.enum(["urgent", "normal", "low"]).default("normal"),
        deadline: z.string().datetime().optional(),
        attachments: z.array(z.string()).optional(),
        externalRef: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.taskRequest.create({
        data: {
          ...input,
          deadline: input.deadline ? new Date(input.deadline) : null,
          attachments: input.attachments ? JSON.stringify(input.attachments) : null,
        },
      });

      // Notify marketing managers
      const managers = await ctx.prisma.user.findMany({
        where: { role: "marketing_manager", isActive: true },
        select: { id: true },
      });

      await ctx.prisma.userAlert.createMany({
        data: managers.map((m) => ({
          userId: m.id,
          type: "task_request",
          title: "New Task Request",
          message: `${input.requestType} request from ${input.requesterTeam}: ${input.title}`,
          link: `/inbox/requests/${request.id}`,
        })),
      });

      return {
        requestId: request.id,
        status: "received",
      };
    }),

  getTaskRequests: protectedProcedure
    .input(
      z.object({
        status: z.enum(["new", "accepted", "declined", "in_progress", "completed"]).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input?.status) where.status = input.status;

      return ctx.prisma.taskRequest.findMany({
        where,
        include: {
          assignedTo: {
            select: { id: true, name: true, avatar: true },
          },
          relatedTask: {
            select: { id: true, title: true, status: true },
          },
        },
        orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
      });
    }),

  acceptTaskRequest: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assigneeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.taskRequest.findUnique({
        where: { id: input.id },
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      }

      // Create a task
      const task = await ctx.prisma.task.create({
        data: {
          title: request.title,
          description: request.description,
          category: request.requestType === "other" ? "admin" : request.requestType,
          priority: request.urgency === "urgent" ? "urgent" : request.urgency === "low" ? "low" : "normal",
          dueDate: request.deadline,
          creatorId: ctx.session.user.id,
          assigneeId: input.assigneeId,
        },
      });

      // Update request
      const updated = await ctx.prisma.taskRequest.update({
        where: { id: input.id },
        data: {
          status: "accepted",
          assignedToId: input.assigneeId,
          relatedTaskId: task.id,
        },
        include: {
          relatedTask: {
            select: { id: true, title: true, status: true },
          },
        },
      });

      // Notify assignee
      if (input.assigneeId !== ctx.session.user.id) {
        await ctx.prisma.userAlert.create({
          data: {
            userId: input.assigneeId,
            type: "task_assigned",
            title: "External Task Request Assigned",
            message: `You've been assigned: ${request.title}`,
            link: `/tasks/${task.id}`,
          },
        });
      }

      return updated;
    }),

  declineTaskRequest: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.taskRequest.update({
        where: { id: input.id },
        data: { status: "declined" },
      });
    }),

  // Cross-Team Ratings (received from other teams)
  submitCrossTeamRatings: publicProcedure
    .input(
      z.object({
        raterTeam: z.enum(["sales", "accounting", "customer_service", "medical"]),
        raterName: z.string().min(1),
        raterEmail: z.string().email(),
        period: z.string().regex(/^\d{4}-\d{2}$/),
        ratings: z.array(
          z.object({
            marketingUserId: z.string(),
            overallScore: z.number().min(1).max(5),
            categoryScores: z
              .object({
                responsiveness: z.number().min(1).max(5).optional(),
                quality: z.number().min(1).max(5).optional(),
                collaboration: z.number().min(1).max(5).optional(),
                communication: z.number().min(1).max(5).optional(),
              })
              .optional(),
            feedback: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.ratings.map(async (rating) => {
          // Check if user exists
          const user = await ctx.prisma.user.findUnique({
            where: { id: rating.marketingUserId },
          });

          if (!user) {
            return { marketingUserId: rating.marketingUserId, status: "user_not_found" };
          }

          // Check if rating already exists for this period
          const existing = await ctx.prisma.crossTeamRating.findFirst({
            where: {
              marketingUserId: rating.marketingUserId,
              period: input.period,
              raterTeam: input.raterTeam,
              raterEmail: input.raterEmail,
            },
          });

          if (existing) {
            // Update existing
            await ctx.prisma.crossTeamRating.update({
              where: { id: existing.id },
              data: {
                overallScore: rating.overallScore,
                categoryScores: rating.categoryScores
                  ? JSON.stringify(rating.categoryScores)
                  : null,
                feedback: rating.feedback,
              },
            });
            return { marketingUserId: rating.marketingUserId, status: "updated" };
          }

          // Create new
          await ctx.prisma.crossTeamRating.create({
            data: {
              marketingUserId: rating.marketingUserId,
              period: input.period,
              raterTeam: input.raterTeam,
              raterName: input.raterName,
              raterEmail: input.raterEmail,
              overallScore: rating.overallScore,
              categoryScores: rating.categoryScores
                ? JSON.stringify(rating.categoryScores)
                : null,
              feedback: rating.feedback,
            },
          });

          return { marketingUserId: rating.marketingUserId, status: "created" };
        })
      );

      return { results };
    }),

  getMyCrossTeamRatings: protectedProcedure
    .input(
      z.object({
        period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { marketingUserId: ctx.session.user.id };
      if (input?.period) where.period = input.period;

      const ratings = await ctx.prisma.crossTeamRating.findMany({
        where,
        orderBy: [{ period: "desc" }, { receivedAt: "desc" }],
      });

      // Calculate average
      const avgScore =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length
          : 0;

      return {
        ratings,
        averageScore: avgScore,
        totalRatings: ratings.length,
      };
    }),

  getTeamCrossTeamRatings: adminProcedure
    .input(
      z.object({
        period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};
      if (input?.period) where.period = input.period;

      const ratings = await ctx.prisma.crossTeamRating.findMany({
        where,
        include: {
          marketingUser: {
            select: { id: true, name: true, avatar: true, role: true },
          },
        },
        orderBy: [{ period: "desc" }, { receivedAt: "desc" }],
      });

      // Group by user
      const byUser: Record<
        string,
        {
          user: { id: string; name: string; avatar: string | null; role: string };
          ratings: typeof ratings;
          avgScore: number;
        }
      > = {};

      for (const rating of ratings) {
        if (!byUser[rating.marketingUserId]) {
          byUser[rating.marketingUserId] = {
            user: rating.marketingUser,
            ratings: [],
            avgScore: 0,
          };
        }
        byUser[rating.marketingUserId].ratings.push(rating);
      }

      // Calculate averages
      for (const userId in byUser) {
        const userRatings = byUser[userId].ratings;
        byUser[userId].avgScore =
          userRatings.reduce((sum, r) => sum + r.overallScore, 0) / userRatings.length;
      }

      return Object.values(byUser);
    }),
});
