import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const taskStatusEnum = z.enum(["todo", "in_progress", "review", "done"]);
const taskPriorityEnum = z.enum(["urgent", "high", "normal", "low"]);
const taskCategoryEnum = z.enum(["content", "design", "video", "campaign", "admin"]);

export const taskRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        status: taskStatusEnum.optional(),
        priority: taskPriorityEnum.optional(),
        category: taskCategoryEnum.optional(),
        assigneeId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.status) where.status = input.status;
      if (input?.priority) where.priority = input.priority;
      if (input?.category) where.category = input.category;
      if (input?.assigneeId) where.assigneeId = input.assigneeId;
      if (input?.search) {
        where.OR = [
          { title: { contains: input.search } },
          { description: { contains: input.search } },
        ];
      }

      const tasks = await ctx.prisma.task.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { comments: true, attachments: true, subtasks: true },
          },
        },
        orderBy: [
          { priority: "asc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        skip: input?.cursor ? 1 : 0,
      });

      return {
        tasks,
        nextCursor: tasks.length === (input?.limit ?? 50) ? tasks[tasks.length - 1]?.id : undefined,
      };
    }),

  getMyTasks: protectedProcedure
    .input(
      z.object({
        status: taskStatusEnum.optional(),
        includeCreated: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const where: Record<string, unknown> = input?.includeCreated
        ? { OR: [{ assigneeId: userId }, { creatorId: userId }] }
        : { assigneeId: userId };

      if (input?.status) {
        where.status = input.status;
      }

      return ctx.prisma.task.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { comments: true, attachments: true, subtasks: true },
          },
        },
        orderBy: [
          { priority: "asc" },
          { dueDate: "asc" },
        ],
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
          reviewer: {
            select: { id: true, name: true, avatar: true },
          },
          proposal: {
            select: { id: true, title: true },
          },
          subtasks: {
            include: {
              assignee: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          comments: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          attachments: true,
          taskRequest: true,
          activities: {
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      return task;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: taskStatusEnum.default("todo"),
        priority: taskPriorityEnum.default("normal"),
        category: taskCategoryEnum.default("admin"),
        dueDate: z.string().datetime().optional(),
        assigneeId: z.string().optional(),
        proposalId: z.string().optional(),
        parentTaskId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.create({
        data: {
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          creatorId: ctx.session.user.id,
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Create notification for assignee if assigned
      if (input.assigneeId && input.assigneeId !== ctx.session.user.id) {
        await ctx.prisma.userAlert.create({
          data: {
            userId: input.assigneeId,
            type: "task_assigned",
            title: "New Task Assigned",
            message: `You have been assigned to: ${input.title}`,
            link: `/tasks/${task.id}`,
          },
        });
      }

      return task;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: taskStatusEnum.optional(),
        priority: taskPriorityEnum.optional(),
        category: taskCategoryEnum.optional(),
        dueDate: z.string().datetime().nullable().optional(),
        assigneeId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existingTask = await ctx.prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      // Award points if task is being completed
      if (data.status === "done" && existingTask.status !== "done") {
        const dueDate = existingTask.dueDate;
        const isEarly = dueDate && new Date() < dueDate;
        const points = isEarly ? 15 : 10; // +5 bonus for early completion

        if (existingTask.assigneeId) {
          await ctx.prisma.pointTransaction.create({
            data: {
              userId: existingTask.assigneeId,
              action: isEarly ? "task_completed_early" : "task_completed",
              points,
              description: `Completed task: ${existingTask.title}`,
              referenceId: id,
            },
          });

          await ctx.prisma.userPoints.upsert({
            where: { userId: existingTask.assigneeId },
            update: {
              totalPoints: { increment: points },
              weeklyPoints: { increment: points },
              monthlyPoints: { increment: points },
            },
            create: {
              userId: existingTask.assigneeId,
              totalPoints: points,
              weeklyPoints: points,
              monthlyPoints: points,
            },
          });
        }
      }

      const task = await ctx.prisma.task.update({
        where: { id },
        data: {
          ...data,
          dueDate: data.dueDate === null ? null : data.dueDate ? new Date(data.dueDate) : undefined,
          completedAt: data.status === "done" ? new Date() : undefined,
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return task;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
      });

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      // Only creator or admin can delete
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (task.creatorId !== ctx.session.user.id && !["super_admin", "marketing_manager"].includes(user?.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this task" });
      }

      await ctx.prisma.task.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.taskComment.create({
        data: {
          taskId: input.taskId,
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

  getKanbanBoard: protectedProcedure
    .input(
      z.object({
        assigneeId: z.string().optional(),
        category: taskCategoryEnum.optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.assigneeId) where.assigneeId = input.assigneeId;
      if (input?.category) where.category = input.category;

      const tasks = await ctx.prisma.task.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
        orderBy: [
          { priority: "asc" },
          { dueDate: "asc" },
        ],
      });

      // Group by status
      const board = {
        todo: tasks.filter((t) => t.status === "todo"),
        in_progress: tasks.filter((t) => t.status === "in_progress"),
        review: tasks.filter((t) => t.status === "review"),
        done: tasks.filter((t) => t.status === "done"),
      };

      return board;
    }),

  getOverdueTasks: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.task.findMany({
      where: {
        status: { not: "done" },
        dueDate: { lt: new Date() },
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });
  }),

  getTaskStats: protectedProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.userId ? { assigneeId: input.userId } : {};

      const [total, completed, inProgress, overdue] = await Promise.all([
        ctx.prisma.task.count({ where }),
        ctx.prisma.task.count({ where: { ...where, status: "done" } }),
        ctx.prisma.task.count({ where: { ...where, status: "in_progress" } }),
        ctx.prisma.task.count({
          where: {
            ...where,
            status: { not: "done" },
            dueDate: { lt: new Date() },
          },
        }),
      ]);

      return { total, completed, inProgress, overdue };
    }),

  // Task Workflow Endpoints
  submitForReview: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: { creator: { select: { id: true, name: true } } },
      });

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      // Only assignee can submit for review
      if (task.assigneeId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the assignee can submit for review" });
      }

      if (task.status !== "in_progress") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Task must be in progress to submit for review" });
      }

      // Update task status
      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.id },
        data: { status: "review" },
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Create activity log
      await ctx.prisma.taskActivity.create({
        data: {
          taskId: input.id,
          userId: ctx.session.user.id,
          action: "submitted_for_review",
          fromStatus: "in_progress",
          toStatus: "review",
        },
      });

      // Notify task creator
      if (task.creatorId !== ctx.session.user.id) {
        await ctx.prisma.userAlert.create({
          data: {
            userId: task.creatorId,
            type: "task_submitted_for_review",
            title: "Task Submitted for Review",
            message: `Task "${task.title}" has been submitted for your review`,
            link: `/tasks?id=${task.id}`,
          },
        });
      }

      return updatedTask;
    }),

  approveTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: { assignee: { select: { id: true, name: true } } },
      });

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      // Only creator or manager can approve
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      const isCreator = task.creatorId === ctx.session.user.id;
      const isManager = ["super_admin", "marketing_manager"].includes(user?.role ?? "");

      if (!isCreator && !isManager) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the task creator or manager can approve" });
      }

      if (task.status !== "review") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Task must be in review to approve" });
      }

      // Update task status
      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          status: "done",
          completedAt: new Date(),
          reviewerId: ctx.session.user.id,
          reviewedAt: new Date(),
        },
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Create activity log
      await ctx.prisma.taskActivity.create({
        data: {
          taskId: input.id,
          userId: ctx.session.user.id,
          action: "approved",
          fromStatus: "review",
          toStatus: "done",
        },
      });

      // Award points to assignee
      if (task.assigneeId) {
        const dueDate = task.dueDate;
        const isEarly = dueDate && new Date() < dueDate;
        const points = isEarly ? 15 : 10;

        await ctx.prisma.pointTransaction.create({
          data: {
            userId: task.assigneeId,
            action: isEarly ? "task_approved_early" : "task_approved",
            points,
            description: `Task approved: ${task.title}`,
            referenceId: input.id,
          },
        });

        await ctx.prisma.userPoints.upsert({
          where: { userId: task.assigneeId },
          update: {
            totalPoints: { increment: points },
            weeklyPoints: { increment: points },
            monthlyPoints: { increment: points },
          },
          create: {
            userId: task.assigneeId,
            totalPoints: points,
            weeklyPoints: points,
            monthlyPoints: points,
          },
        });

        // Notify assignee
        await ctx.prisma.userAlert.create({
          data: {
            userId: task.assigneeId,
            type: "task_approved",
            title: "Task Approved",
            message: `Your task "${task.title}" has been approved! +${points} points`,
            link: `/tasks?id=${task.id}`,
          },
        });
      }

      return updatedTask;
    }),

  requestRevision: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        feedback: z.string().min(1, "Feedback is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: { assignee: { select: { id: true, name: true } } },
      });

      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      // Only creator or manager can request revision
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      const isCreator = task.creatorId === ctx.session.user.id;
      const isManager = ["super_admin", "marketing_manager"].includes(user?.role ?? "");

      if (!isCreator && !isManager) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the task creator or manager can request revision" });
      }

      if (task.status !== "review") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Task must be in review to request revision" });
      }

      // Update task status and increment rejection count
      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          status: "in_progress",
          reviewerId: ctx.session.user.id,
          reviewNotes: input.feedback,
          reviewedAt: new Date(),
          rejectionCount: { increment: 1 },
        },
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          assignee: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Create activity log
      await ctx.prisma.taskActivity.create({
        data: {
          taskId: input.id,
          userId: ctx.session.user.id,
          action: "rejected",
          fromStatus: "review",
          toStatus: "in_progress",
          comment: input.feedback,
        },
      });

      // Notify assignee
      if (task.assigneeId) {
        await ctx.prisma.userAlert.create({
          data: {
            userId: task.assigneeId,
            type: "task_revision_requested",
            title: "Revision Requested",
            message: `Your task "${task.title}" needs revision: ${input.feedback}`,
            link: `/tasks?id=${task.id}`,
          },
        });
      }

      return updatedTask;
    }),

  getTaskActivity: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.taskActivity.findMany({
        where: { taskId: input.taskId },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
