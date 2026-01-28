import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const alertsRouter = createTRPCRouter({
  getMyAlerts: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { userId: ctx.session.user.id };

      if (input?.unreadOnly) {
        where.isRead = false;
      }

      return ctx.prisma.userAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 20,
      });
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userAlert.count({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
    });
  }),

  markAsRead: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.userAlert.update({
        where: { id: input.alertId },
        data: { isRead: true },
      });
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.userAlert.updateMany({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }),

  deleteAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.userAlert.delete({
        where: { id: input.alertId },
      });

      return { success: true };
    }),

  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.userAlert.deleteMany({
      where: {
        userId: ctx.session.user.id,
        isRead: true,
      },
    });

    return { success: true };
  }),
});
