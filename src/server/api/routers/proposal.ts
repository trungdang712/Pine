import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

// Categories with their approval layer requirements
const TWO_LAYER_CATEGORIES = ["budget", "campaign", "event", "partnership"];
const ONE_LAYER_CATEGORIES = ["content", "design", "video"];

// Helper function to determine required approval layers
function getRequiredLayers(category: string): number {
  return TWO_LAYER_CATEGORIES.includes(category) ? 2 : 1;
}

// Helper function to check if user can approve at a specific layer
function canApproveAtLayer(role: string, layer: number): boolean {
  if (layer === 1) {
    return ["super_admin", "admin", "marketing_manager"].includes(role);
  }
  if (layer === 2) {
    return ["super_admin", "admin"].includes(role);
  }
  return false;
}

const proposalCategoryEnum = z.enum(["content", "design", "video", "budget", "campaign", "event", "partnership"]);
const proposalPriorityEnum = z.enum(["urgent", "high", "normal", "low"]);
const proposalStatusEnum = z.enum([
  "draft",
  "submitted",
  "layer1_review",
  "layer2_review",
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
            orderBy: [{ layer: "asc" }, { stepNumber: "asc" }],
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
            orderBy: [{ layer: "asc" }, { stepNumber: "asc" }],
          },
          collaborators: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          _count: {
            select: { comments: true, tasks: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getPendingApprovals: adminProcedure
    .input(
      z.object({
        layerFilter: z.enum(["all", "layer1", "layer2"]).optional().default("all"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Get current user's role to determine which layers they can approve
      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      const userRole = currentUser?.role ?? "";
      const canApproveLayer1 = canApproveAtLayer(userRole, 1);
      const canApproveLayer2 = canApproveAtLayer(userRole, 2);

      // Determine which layers to show based on user role and filter
      const layerFilter = input?.layerFilter ?? "all";
      const layers: number[] = [];

      if (layerFilter === "all") {
        if (canApproveLayer1) layers.push(1);
        if (canApproveLayer2) layers.push(2);
      } else if (layerFilter === "layer1" && canApproveLayer1) {
        layers.push(1);
      } else if (layerFilter === "layer2" && canApproveLayer2) {
        layers.push(2);
      }

      // If user can't approve any layer, return empty
      if (layers.length === 0) {
        return [];
      }

      return ctx.prisma.proposal.findMany({
        where: {
          status: { in: ["layer1_review", "layer2_review"] },
          currentLayer: { in: layers },
          approvals: {
            some: {
              approverId: ctx.session.user.id,
              layer: { in: layers },
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
            orderBy: [{ layer: "asc" }, { stepNumber: "asc" }],
          },
        },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
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
            orderBy: [{ layer: "asc" }, { stepNumber: "asc" }],
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
          collaborators: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
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
        !["super_admin", "admin", "marketing_manager"].includes(user?.role ?? "")
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

      if (proposal.status !== "draft" && proposal.status !== "rejected") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Proposal already submitted" });
      }

      // Calculate required layers based on category
      const totalLayers = getRequiredLayers(proposal.category);

      // Delete any existing approval steps (for resubmission after rejection)
      await ctx.prisma.approvalStep.deleteMany({
        where: { proposalId: input.id },
      });

      // Get Layer 1 approvers (marketing managers)
      const layer1Approvers = await ctx.prisma.user.findMany({
        where: {
          role: "marketing_manager",
          isActive: true
        },
        select: { id: true },
      });

      // If no marketing managers, fallback to admins
      const approvers = layer1Approvers.length > 0
        ? layer1Approvers
        : await ctx.prisma.user.findMany({
            where: {
              role: { in: ["admin", "super_admin"] },
              isActive: true
            },
            select: { id: true },
          });

      // Create Layer 1 approval steps
      await ctx.prisma.approvalStep.createMany({
        data: approvers.map((approver, index) => ({
          proposalId: input.id,
          approverId: approver.id,
          layer: 1,
          stepNumber: index + 1,
          status: "pending",
        })),
      });

      // Update proposal status and layer info
      const updated = await ctx.prisma.proposal.update({
        where: { id: input.id },
        data: {
          status: "layer1_review",
          currentLayer: 1,
          totalLayers: totalLayers,
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
            orderBy: [{ layer: "asc" }, { stepNumber: "asc" }],
          },
        },
      });

      // Notify Layer 1 approvers
      await ctx.prisma.userAlert.createMany({
        data: approvers.map((approver) => ({
          userId: approver.id,
          type: "approval_needed",
          title: "New Proposal Needs Approval",
          message: `${proposal.title} needs your review (Layer 1)`,
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
      // Get current user's role
      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      // Get proposal with current layer info
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        select: {
          id: true,
          title: true,
          creatorId: true,
          currentLayer: true,
          totalLayers: true,
          status: true,
        },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      // Check if user can approve at current layer
      if (!canApproveAtLayer(currentUser?.role ?? "", proposal.currentLayer)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You cannot approve at Layer ${proposal.currentLayer}`,
        });
      }

      const approval = await ctx.prisma.approvalStep.findFirst({
        where: {
          proposalId: input.proposalId,
          approverId: ctx.session.user.id,
          layer: proposal.currentLayer,
          status: "pending",
        },
      });

      if (!approval) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending approval found for this user at current layer",
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

      // Check if all approvals at current layer are done (only need 1 approval per layer)
      const pendingAtCurrentLayer = await ctx.prisma.approvalStep.count({
        where: {
          proposalId: input.proposalId,
          layer: proposal.currentLayer,
          status: "pending",
        },
      });

      // One approval is enough at each layer - mark others as "skipped"
      await ctx.prisma.approvalStep.updateMany({
        where: {
          proposalId: input.proposalId,
          layer: proposal.currentLayer,
          status: "pending",
          id: { not: approval.id },
        },
        data: {
          status: "approved", // Mark as approved (by proxy)
          comments: "Auto-approved: Another approver completed this layer",
          decidedAt: new Date(),
        },
      });

      // Check if we need to progress to Layer 2 or finalize
      if (proposal.currentLayer === 1 && proposal.totalLayers === 2) {
        // Progress to Layer 2 - create Layer 2 approval steps
        const layer2Approvers = await ctx.prisma.user.findMany({
          where: {
            role: { in: ["admin", "super_admin"] },
            isActive: true,
          },
          select: { id: true },
        });

        // Create Layer 2 approval steps
        await ctx.prisma.approvalStep.createMany({
          data: layer2Approvers.map((approver, index) => ({
            proposalId: input.proposalId,
            approverId: approver.id,
            layer: 2,
            stepNumber: index + 1,
            status: "pending",
          })),
        });

        // Update proposal to Layer 2
        await ctx.prisma.proposal.update({
          where: { id: input.proposalId },
          data: {
            status: "layer2_review",
            currentLayer: 2,
          },
        });

        // Notify Layer 2 approvers
        await ctx.prisma.userAlert.createMany({
          data: layer2Approvers.map((approver) => ({
            userId: approver.id,
            type: "approval_needed",
            title: "Proposal Needs Admin Approval",
            message: `${proposal.title} passed Layer 1 and needs admin review (Layer 2)`,
            link: `/proposals/${input.proposalId}`,
          })),
        });

        // Notify creator about progress
        await ctx.prisma.userAlert.create({
          data: {
            userId: proposal.creatorId,
            type: "proposal_progress",
            title: "Proposal Progress",
            message: `Your proposal "${proposal.title}" passed Layer 1 review and is now pending admin approval`,
            link: `/proposals/${input.proposalId}`,
          },
        });
      } else {
        // Final approval - either Layer 1 complete for 1-layer, or Layer 2 complete
        await ctx.prisma.proposal.update({
          where: { id: input.proposalId },
          data: { status: "approved" },
        });

        // Award points to creator
        await ctx.prisma.pointTransaction.create({
          data: {
            userId: proposal.creatorId,
            action: "proposal_approved",
            points: 25,
            description: `Proposal approved: ${proposal.title}`,
            referenceId: input.proposalId,
          },
        });

        await ctx.prisma.userPoints.upsert({
          where: { userId: proposal.creatorId },
          update: {
            totalPoints: { increment: 25 },
            weeklyPoints: { increment: 25 },
            monthlyPoints: { increment: 25 },
          },
          create: {
            userId: proposal.creatorId,
            totalPoints: 25,
            weeklyPoints: 25,
            monthlyPoints: 25,
          },
        });

        // Notify creator
        await ctx.prisma.userAlert.create({
          data: {
            userId: proposal.creatorId,
            type: "proposal_approved",
            title: "Proposal Approved!",
            message: `Your proposal "${proposal.title}" has been fully approved`,
            link: `/proposals/${input.proposalId}`,
          },
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
      // Get current user's role
      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      // Get proposal with current layer info
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        select: {
          id: true,
          title: true,
          creatorId: true,
          currentLayer: true,
          totalLayers: true,
        },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      // Check if user can approve/reject at current layer
      if (!canApproveAtLayer(currentUser?.role ?? "", proposal.currentLayer)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You cannot reject at Layer ${proposal.currentLayer}`,
        });
      }

      const approval = await ctx.prisma.approvalStep.findFirst({
        where: {
          proposalId: input.proposalId,
          approverId: ctx.session.user.id,
          layer: proposal.currentLayer,
          status: "pending",
        },
      });

      if (!approval) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending approval found for this user at current layer",
        });
      }

      // Update approval step as rejected
      await ctx.prisma.approvalStep.update({
        where: { id: approval.id },
        data: {
          status: "rejected",
          comments: input.comments,
          decidedAt: new Date(),
        },
      });

      // Cancel other pending approvals at same layer
      await ctx.prisma.approvalStep.updateMany({
        where: {
          proposalId: input.proposalId,
          layer: proposal.currentLayer,
          status: "pending",
          id: { not: approval.id },
        },
        data: {
          status: "rejected",
          comments: "Auto-rejected: Another approver rejected at this layer",
          decidedAt: new Date(),
        },
      });

      // Update proposal status back to draft for revision
      await ctx.prisma.proposal.update({
        where: { id: input.proposalId },
        data: {
          status: "draft",
          currentLayer: 1,  // Reset to Layer 1
        },
      });

      // Notify creator with rejection reason
      await ctx.prisma.userAlert.create({
        data: {
          userId: proposal.creatorId,
          type: "proposal_rejected",
          title: `Proposal Rejected at Layer ${proposal.currentLayer}`,
          message: `Your proposal "${proposal.title}" was rejected: ${input.comments}`,
          link: `/proposals/${input.proposalId}`,
        },
      });

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
      // Get current user's role
      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      // Get proposal with current layer info
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        select: {
          id: true,
          title: true,
          creatorId: true,
          currentLayer: true,
        },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      // Check if user can approve/request revision at current layer
      if (!canApproveAtLayer(currentUser?.role ?? "", proposal.currentLayer)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You cannot request revision at Layer ${proposal.currentLayer}`,
        });
      }

      const approval = await ctx.prisma.approvalStep.findFirst({
        where: {
          proposalId: input.proposalId,
          approverId: ctx.session.user.id,
          layer: proposal.currentLayer,
          status: "pending",
        },
      });

      if (!approval) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No pending approval found for this user at current layer",
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

      // Cancel other pending approvals at same layer
      await ctx.prisma.approvalStep.updateMany({
        where: {
          proposalId: input.proposalId,
          layer: proposal.currentLayer,
          status: "pending",
          id: { not: approval.id },
        },
        data: {
          status: "revision_requested",
          comments: "Auto-marked: Another approver requested revision",
          decidedAt: new Date(),
        },
      });

      // Update proposal status back to draft
      await ctx.prisma.proposal.update({
        where: { id: input.proposalId },
        data: {
          status: "draft",
          currentLayer: 1,  // Reset to Layer 1
        },
      });

      // Notify creator
      await ctx.prisma.userAlert.create({
        data: {
          userId: proposal.creatorId,
          type: "revision_requested",
          title: `Revision Requested at Layer ${proposal.currentLayer}`,
          message: `Your proposal "${proposal.title}" needs revisions: ${input.comments}`,
          link: `/proposals/${input.proposalId}`,
        },
      });

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

  // ==================== COLLABORATORS ====================

  addCollaborator: protectedProcedure
    .input(
      z.object({
        proposalId: z.string(),
        userId: z.string(),
        role: z.enum(["contributor", "reviewer", "co-owner"]).default("contributor"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      // Only creator or co-owner can add collaborators
      const existingCollab = await ctx.prisma.proposalCollaborator.findFirst({
        where: {
          proposalId: input.proposalId,
          userId: ctx.session.user.id,
          role: "co-owner",
        },
      });

      if (proposal.creatorId !== ctx.session.user.id && !existingCollab) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to add collaborators" });
      }

      // Can't add creator as collaborator
      if (input.userId === proposal.creatorId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Creator is already the owner" });
      }

      // Check if already collaborator
      const existing = await ctx.prisma.proposalCollaborator.findUnique({
        where: {
          proposalId_userId: {
            proposalId: input.proposalId,
            userId: input.userId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is already a collaborator" });
      }

      const collaborator = await ctx.prisma.proposalCollaborator.create({
        data: {
          proposalId: input.proposalId,
          userId: input.userId,
          role: input.role,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Notify the added user
      await ctx.prisma.userAlert.create({
        data: {
          userId: input.userId,
          type: "proposal_collaborator",
          title: "Added as Collaborator",
          message: `You were added as ${input.role} to proposal: ${proposal.title}`,
          link: `/proposals`,
        },
      });

      // Award points for collaboration
      await ctx.prisma.pointTransaction.create({
        data: {
          userId: input.userId,
          action: "proposal_collaboration",
          points: 10,
          description: `Added as collaborator to: ${proposal.title}`,
          referenceId: input.proposalId,
        },
      });

      await ctx.prisma.userPoints.upsert({
        where: { userId: input.userId },
        update: {
          totalPoints: { increment: 10 },
          weeklyPoints: { increment: 10 },
          monthlyPoints: { increment: 10 },
        },
        create: {
          userId: input.userId,
          totalPoints: 10,
          weeklyPoints: 10,
          monthlyPoints: 10,
        },
      });

      return collaborator;
    }),

  removeCollaborator: protectedProcedure
    .input(
      z.object({
        proposalId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      // Only creator can remove collaborators (or user can remove themselves)
      if (proposal.creatorId !== ctx.session.user.id && input.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to remove collaborators" });
      }

      await ctx.prisma.proposalCollaborator.delete({
        where: {
          proposalId_userId: {
            proposalId: input.proposalId,
            userId: input.userId,
          },
        },
      });

      return { success: true };
    }),

  getCollaborators: protectedProcedure
    .input(z.object({ proposalId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.proposalCollaborator.findMany({
        where: { proposalId: input.proposalId },
        include: {
          user: {
            select: { id: true, name: true, avatar: true, role: true },
          },
        },
        orderBy: { addedAt: "asc" },
      });
    }),

  // Get proposals where user is a collaborator
  getCollaborativeProposals: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.proposal.findMany({
      where: {
        collaborators: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: [{ layer: "asc" }, { stepNumber: "asc" }],
        },
        _count: {
          select: { comments: true, tasks: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }),

  // Get available users to add as collaborators
  getAvailableCollaborators: protectedProcedure
    .input(z.object({ proposalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        include: {
          collaborators: {
            select: { userId: true },
          },
        },
      });

      if (!proposal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      }

      const excludeIds = [
        proposal.creatorId,
        ...proposal.collaborators.map((c) => c.userId),
      ];

      return ctx.prisma.user.findMany({
        where: {
          id: { notIn: excludeIds },
          isActive: true,
        },
        select: { id: true, name: true, avatar: true, role: true },
        orderBy: { name: "asc" },
      });
    }),
});
