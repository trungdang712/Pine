import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const platformEnum = z.enum(["facebook", "instagram", "zalo", "tiktok", "website"]);
const contentStatusEnum = z.enum([
  "planned",
  "in_production",
  "ready_for_review",
  "approved",
  "scheduled",
  "published",
  "needs_revision",
]);
const contentTypeEnum = z.enum([
  "social_post",
  "video",
  "article",
  "graphic",
  "carousel",
  "blog_post",
]);

export const calendarRouter = createTRPCRouter({
  getItems: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        platform: platformEnum.optional(),
        status: contentStatusEnum.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        OR: [
          {
            scheduledAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
          {
            publishedAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
        ],
      };

      if (input.platform) where.platform = input.platform;
      if (input.status) where.status = input.status;

      return ctx.prisma.contentCalendarItem.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          proposal: {
            select: { id: true, title: true },
          },
          channel: {
            select: { id: true, name: true, platform: true, avatarUrl: true },
          },
          _count: {
            select: { comments: true, attachments: true, socialPosts: true },
          },
        },
        orderBy: { scheduledAt: "asc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.contentCalendarItem.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          proposal: {
            select: { id: true, title: true, status: true },
          },
          channel: {
            select: { id: true, name: true, platform: true, avatarUrl: true },
          },
          socialPosts: true,
          comments: {
            orderBy: { createdAt: "desc" },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
          },
          tasks: {
            include: {
              assignee: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { dueDate: "asc" },
          },
        },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Calendar item not found" });
      }

      // Fetch user info for each comment
      const commentUserIds = [...new Set(item.comments.map((c) => c.userId))];
      const users = await ctx.prisma.user.findMany({
        where: { id: { in: commentUserIds } },
        select: { id: true, name: true, avatar: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      const commentsWithUser = item.comments.map((comment) => ({
        ...comment,
        user: userMap.get(comment.userId) || null,
      }));

      return {
        ...item,
        comments: commentsWithUser,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        platform: platformEnum,
        channelId: z.string().optional(),
        contentType: contentTypeEnum.optional(),
        status: contentStatusEnum.default("planned"),
        scheduledAt: z.string().datetime().optional(),
        proposalId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.contentCalendarItem.create({
        data: {
          ...input,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
          creatorId: ctx.session.user.id,
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          channel: {
            select: { id: true, name: true, platform: true, avatarUrl: true },
          },
        },
      });

      return item;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        platform: platformEnum.optional(),
        channelId: z.string().nullable().optional(),
        contentType: contentTypeEnum.nullable().optional(),
        status: contentStatusEnum.optional(),
        scheduledAt: z.string().datetime().nullable().optional(),
        publishedAt: z.string().datetime().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const item = await ctx.prisma.contentCalendarItem.findUnique({
        where: { id },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Calendar item not found" });
      }

      return ctx.prisma.contentCalendarItem.update({
        where: { id },
        data: {
          ...data,
          scheduledAt: data.scheduledAt === null ? null : data.scheduledAt ? new Date(data.scheduledAt) : undefined,
          publishedAt: data.publishedAt === null ? null : data.publishedAt ? new Date(data.publishedAt) : undefined,
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          channel: {
            select: { id: true, name: true, platform: true, avatarUrl: true },
          },
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: contentStatusEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.contentCalendarItem.findUnique({
        where: { id: input.id },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Calendar item not found" });
      }

      const updateData: Record<string, unknown> = { status: input.status };

      // Set publishedAt if status is published
      if (input.status === "published" && !item.publishedAt) {
        updateData.publishedAt = new Date();
      }

      return ctx.prisma.contentCalendarItem.update({
        where: { id: input.id },
        data: updateData,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.contentCalendarItem.findUnique({
        where: { id: input.id },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Calendar item not found" });
      }

      // Check permissions
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (
        item.creatorId !== ctx.session.user.id &&
        !["super_admin", "marketing_manager"].includes(user?.role ?? "")
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this item" });
      }

      await ctx.prisma.contentCalendarItem.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        calendarItemId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.calendarItemComment.create({
        data: {
          calendarItemId: input.calendarItemId,
          userId: ctx.session.user.id,
          content: input.content,
        },
        include: {
          calendarItem: false,
        },
      });

      // Return comment with user info
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, name: true, avatar: true },
      });

      return { ...comment, user };
    }),

  addAttachment: protectedProcedure
    .input(
      z.object({
        calendarItemId: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify item exists
      const item = await ctx.prisma.contentCalendarItem.findUnique({
        where: { id: input.calendarItemId },
      });

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Calendar item not found" });
      }

      return ctx.prisma.calendarItemAttachment.create({
        data: input,
      });
    }),

  getUpcoming: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(30).default(7),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 7;
      const now = new Date();
      const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return ctx.prisma.contentCalendarItem.findMany({
        where: {
          scheduledAt: {
            gte: now,
            lte: endDate,
          },
          status: { not: "published" },
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { scheduledAt: "asc" },
        take: 10,
      });
    }),

  getByMonth: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

      return ctx.prisma.contentCalendarItem.findMany({
        where: {
          OR: [
            {
              scheduledAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              publishedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          ],
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { comments: true, attachments: true },
          },
        },
        orderBy: { scheduledAt: "asc" },
      });
    }),

  getStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        OR: [
          {
            scheduledAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
          {
            publishedAt: {
              gte: new Date(input.startDate),
              lte: new Date(input.endDate),
            },
          },
        ],
      };

      const [total, byStatus, byPlatform] = await Promise.all([
        ctx.prisma.contentCalendarItem.count({ where }),
        ctx.prisma.contentCalendarItem.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),
        ctx.prisma.contentCalendarItem.groupBy({
          by: ["platform"],
          where,
          _count: true,
        }),
      ]);

      return {
        total,
        byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
        byPlatform: Object.fromEntries(byPlatform.map((p) => [p.platform, p._count])),
      };
    }),

  // Task Template endpoints
  getTemplateByContentType: protectedProcedure
    .input(z.object({ contentType: contentTypeEnum }))
    .query(async ({ ctx, input }) => {
      const template = await ctx.prisma.taskTemplate.findFirst({
        where: {
          contentType: input.contentType,
          isActive: true,
        },
      });

      if (!template) {
        return null;
      }

      return {
        ...template,
        tasks: JSON.parse(template.tasks) as Array<{
          title: string;
          description: string;
          category: string;
          priority: string;
          daysBeforeDeadline: number;
        }>,
      };
    }),

  getAllTemplates: protectedProcedure.query(async ({ ctx }) => {
    const templates = await ctx.prisma.taskTemplate.findMany({
      orderBy: { name: "asc" },
    });

    return templates.map((template) => ({
      ...template,
      tasks: JSON.parse(template.tasks) as Array<{
        title: string;
        description: string;
        category: string;
        priority: string;
        daysBeforeDeadline: number;
      }>,
    }));
  }),

  updateTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        tasks: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              category: z.string(),
              priority: z.string(),
              daysBeforeDeadline: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, tasks, ...data } = input;

      // Check admin permissions
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (!["super_admin", "marketing_manager"].includes(user?.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to update templates" });
      }

      return ctx.prisma.taskTemplate.update({
        where: { id },
        data: {
          ...data,
          ...(tasks && { tasks: JSON.stringify(tasks) }),
        },
      });
    }),

  createTasksFromTemplate: protectedProcedure
    .input(
      z.object({
        calendarItemId: z.string(),
        contentType: contentTypeEnum,
        scheduledAt: z.string().datetime(),
        assigneeIds: z.record(z.string(), z.string()).optional(), // Map task index to assignee ID
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the calendar item
      const calendarItem = await ctx.prisma.contentCalendarItem.findUnique({
        where: { id: input.calendarItemId },
      });

      if (!calendarItem) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Calendar item not found" });
      }

      // Get the template
      const template = await ctx.prisma.taskTemplate.findFirst({
        where: {
          contentType: input.contentType,
          isActive: true,
        },
      });

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found for this content type" });
      }

      const templateTasks = JSON.parse(template.tasks) as Array<{
        title: string;
        description: string;
        category: string;
        priority: string;
        daysBeforeDeadline: number;
      }>;

      const scheduledDate = new Date(input.scheduledAt);
      const createdTasks = [];

      for (let i = 0; i < templateTasks.length; i++) {
        const taskDef = templateTasks[i];
        const dueDate = new Date(scheduledDate);
        dueDate.setDate(dueDate.getDate() - taskDef.daysBeforeDeadline);

        const task = await ctx.prisma.task.create({
          data: {
            title: taskDef.title,
            description: taskDef.description,
            category: taskDef.category,
            priority: taskDef.priority,
            status: "todo",
            dueDate,
            creatorId: ctx.session.user.id,
            assigneeId: input.assigneeIds?.[i.toString()] || null,
            calendarItemId: input.calendarItemId,
          },
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

        createdTasks.push(task);
      }

      return createdTasks;
    }),
});
