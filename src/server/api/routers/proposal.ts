import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const proposalCategoryEnum = z.enum(["content", "design", "video", "campaign", "event", "partnership"]);
const proposalPriorityEnum = z.enum(["urgent", "high", "normal", "low"]);
const proposalStatusEnum = z.enum([
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "in_progress",
  "completed",
]);

export const proposalRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        status: proposalStatusEnum.optional(),
        category: proposalCategoryEnum.optional(),
        creatorId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.status) where.status = input.status;
      if (input?.category) where.category = input.category;
      if (input?.creatorId) where.creatorId = input.creatorId;
      if (input?.search) {
        where.OR = [
          { title: { contains: input.search } },
          { description: { contains: input.search } },
        ];
      }

      const proposals = await ctx.prisma.proposal.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          approvals: {
            include: {
              approver: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { stepNumber: "asc" },
          },
          _count: {
            select: { comments: true, tasks: true, attachments: true },
          },
        },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        skip: input?.cursor ? 1 : 0,
      });

      return {
        proposals,
        nextCursor:
          proposals.length === (input?.limit ?? 50)
            ? proposals[proposals.length - 1]?.id
            : undefined,
      };
    }),

  getMyProposals: protectedProcedure
    .input(
      z.object({
        status: proposalStatusEnum.optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { creatorId: ctx.session.user.id };

      if (input?.status) where.status = input.status;

      return ctx.prisma.proposal.findMany({
        where,
        include: {
          approvals: {
            include: {
              approver: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { stepNumber: "asc" },
          },
          _count: {
            select: { comments: true, tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getPendingApprovals: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.proposal.findMany({
      where: {
        status: { in: ["submitted", "under_review"] },
        approvals: {
          some: {
            approverId: ctx.session.user.id,
            status: "pending",
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { stepNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          approvals: {
            include: {
              approver: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { stepNumber: "asc" },
          },
          comments: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
              assignee: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          calendarItems: {
            select: {
              id: true,
              title: true,
              status: true,
              platform: true,
              scheduledAt: true,
            },
          },
          attachments: true,
        },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      return proposal;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        category: proposalCategoryEnum,
        priority: proposalPriorityEnum.default("normal"),
        dueDate: z.string().datetime().optional(),
        budget: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.create({
        data: {
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          creatorId: ctx.session.user.id,
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Award points for submitting a proposal
      await ctx.prisma.pointTransaction.create({
        data: {
          userId: ctx.session.user.id,
          action: "proposal_submitted",
          points: 15,
          description: `Submitted proposal: ${input.title}`,
          referenceId: proposal.id,
        },
      });

      await ctx.prisma.userPoints.upsert({
        where: { userId: ctx.session.user.id },
        update: {
          totalPoints: { increment: 15 },
          weeklyPoints: { increment: 15 },
          monthlyPoints: { increment: 15 },
        },
        create: {
          userId: ctx.session.user.id,
          totalPoints: 15,
          weeklyPoints: 15,
          monthlyPoints: 15,
        },
      });

      return proposal;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        category: proposalCategoryEnum.optional(),
        priority: proposalPriorityEnum.optional(),
        dueDate: z.string().datetime().nullable().optional(),
        budget: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      // Only creator can update (unless admin)
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (
        proposal.creatorId !== ctx.session.user.id &&
        !["admin", "marketing_manager"].includes(user?.role ?? "")
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to update this proposal" });
      }

      return ctx.prisma.proposal.update({
        where: { id },
        data: {
          ...data,
          dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });
    }),

  submit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.id },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      if (proposal.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only creator can submit" });
      }

      if (proposal.status !== "draft") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Proposal already submitted" });
      }

      // Get managers to create approval steps
      const managers = await ctx.prisma.user.findMany({
        where: { role: "marketing_manager", isActive: true },
        select: { id: true },
      });

      // Create approval steps
      await ctx.prisma.approvalStep.createMany({
        data: managers.map((manager, index) => ({
          proposalId: input.id,
          approverId: manager.id,
          stepNumber: index + 1,
          status: "pending",
        })),
      });

      // Update proposal status
      const updated = await ctx.prisma.proposal.update({
        where: { id: input.id },
        data: { status: "submitted" },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          approvals: {
            include: {
              approver: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      });

      // Notify managers
      await ctx.prisma.userAlert.createMany({
        data: managers.map((manager) => ({
          userId: manager.id,
          type: "approval_needed",
          title: "New Proposal Needs Approval",
          message: `${proposal.title} needs your review`,
          link: `/proposals/${input.id}`,
        })),
      });

      return updated;
    }),

  approve: adminProcedure
    .input(
      z.object({
        proposalId: z.string(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const approval = await ctx.prisma.approvalStep.findFirst({
        where: {
          proposalId: input.proposalId,
          approverId: ctx.session.user.id,
          status: "pending",
        },
      });

      if (!approval) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending approval found for this user",
        });
      }

      // Update approval step
      await ctx.prisma.approvalStep.update({
        where: { id: approval.id },
        data: {
          status: "approved",
          comments: input.comments,
          decidedAt: new Date(),
        },
      });

      // Check if all approvals are done
      const pendingApprovals = await ctx.prisma.approvalStep.count({
        where: {
          proposalId: input.proposalId,
          status: "pending",
        },
      });

      // If all approved, update proposal status
      if (pendingApprovals === 0) {
        await ctx.prisma.proposal.update({
          where: { id: input.proposalId },
          data: { status: "approved" },
        });

        // Get proposal creator and award points
        const proposal = await ctx.prisma.proposal.findUnique({
          where: { id: input.proposalId },
          select: { creatorId: true, title: true },
        });

        if (proposal) {
          await ctx.prisma.pointTransaction.create({
            data: {
              userId: proposal.creatorId,
              action: "proposal_approved",
              points: 25,
              description: `Proposal approved: ${proposal.title}`,
              referenceId: input.proposalId,
            },
          });

          await ctx.prisma.userPoints.update({
            where: { userId: proposal.creatorId },
            data: {
              totalPoints: { increment: 25 },
              weeklyPoints: { increment: 25 },
              monthlyPoints: { increment: 25 },
            },
          });

          // Notify creator
          await ctx.prisma.userAlert.create({
            data: {
              userId: proposal.creatorId,
              type: "proposal_approved",
              title: "Proposal Approved!",
              message: `Your proposal "${proposal.title}" has been approved`,
              link: `/proposals/${input.proposalId}`,
            },
          });
        }
      } else {
        await ctx.prisma.proposal.update({
          where: { id: input.proposalId },
          data: { status: "under_review" },
        });
      }

      return { success: true };
    }),

  reject: adminProcedure
    .input(
      z.object({
        proposalId: z.string(),
        comments: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const approval = await ctx.prisma.approvalStep.findFirst({
        where: {
          proposalId: input.proposalId,
          approverId: ctx.session.user.id,
          status: "pending",
        },
      });

      if (!approval) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending approval found for this user",
        });
      }

      // Update approval step
      await ctx.prisma.approvalStep.update({
        where: { id: approval.id },
        data: {
          status: "rejected",
          comments: input.comments,
          decidedAt: new Date(),
        },
      });

      // Update proposal status
      await ctx.prisma.proposal.update({
        where: { id: input.proposalId },
        data: { status: "rejected" },
      });

      // Notify creator
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        select: { creatorId: true, title: true },
      });

      if (proposal) {
        await ctx.prisma.userAlert.create({
          data: {
            userId: proposal.creatorId,
            type: "proposal_rejected",
            title: "Proposal Needs Revision",
            message: `Your proposal "${proposal.title}" requires changes`,
            link: `/proposals/${input.proposalId}`,
          },
        });
      }

      return { success: true };
    }),

  requestRevision: adminProcedure
    .input(
      z.object({
        proposalId: z.string(),
        comments: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const approval = await ctx.prisma.approvalStep.findFirst({
        where: {
          proposalId: input.proposalId,
          approverId: ctx.session.user.id,
          status: "pending",
        },
      });

      if (!approval) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending approval found for this user",
        });
      }

      // Update approval step
      await ctx.prisma.approvalStep.update({
        where: { id: approval.id },
        data: {
          status: "revision_requested",
          comments: input.comments,
          decidedAt: new Date(),
        },
      });

      // Update proposal status back to draft
      await ctx.prisma.proposal.update({
        where: { id: input.proposalId },
        data: { status: "draft" },
      });

      // Notify creator
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        select: { creatorId: true, title: true },
      });

      if (proposal) {
        await ctx.prisma.userAlert.create({
          data: {
            userId: proposal.creatorId,
            type: "revision_requested",
            title: "Revision Requested",
            message: `Your proposal "${proposal.title}" needs revisions`,
            link: `/proposals/${input.proposalId}`,
          },
        });
      }

      return { success: true };
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        proposalId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.proposalComment.create({
        data: {
          proposalId: input.proposalId,
          userId: ctx.session.user.id,
          content: input.content,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return comment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.id },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      // Only creator can delete draft proposals
      if (proposal.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this proposal" });
      }

      if (proposal.status !== "draft") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only delete draft proposals" });
      }

      await ctx.prisma.proposal.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
