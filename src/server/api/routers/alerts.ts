import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// Notifications expire after 10 days
const ALERT_EXPIRY_DAYS = 10;

export const alertsRouter = createTRPCRouter({
  getMyAlerts: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      // Calculate expiry date (10 days ago)
      const alertExpiryDate = new Date();
      alertExpiryDate.setDate(alertExpiryDate.getDate() - ALERT_EXPIRY_DAYS);

      const where: Record<string, unknown> = {
        userId: ctx.session.user.id,
        createdAt: { gte: alertExpiryDate },
      };

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
    // Calculate expiry date (10 days ago)
    const alertExpiryDate = new Date();
    alertExpiryDate.setDate(alertExpiryDate.getDate() - ALERT_EXPIRY_DAYS);

    return ctx.prisma.userAlert.count({
      where: {
        userId: ctx.session.user.id,
        isRead: false,
        createdAt: { gte: alertExpiryDate },
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

  // Cleanup expired alerts (older than 10 days) for the current user
  cleanupExpired: protectedProcedure.mutation(async ({ ctx }) => {
    const alertExpiryDate = new Date();
    alertExpiryDate.setDate(alertExpiryDate.getDate() - ALERT_EXPIRY_DAYS);

    const result = await ctx.prisma.userAlert.deleteMany({
      where: {
        userId: ctx.session.user.id,
        createdAt: { lt: alertExpiryDate },
      },
    });

    return { deletedCount: result.count };
  }),
});
