import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const dashboardRouter = createTRPCRouter({
  // Combined dashboard data - single API call instead of 4
  getData: protectedProcedure
    .input(
      z.object({
        calendarStartDate: z.string(),
        calendarEndDate: z.string(),
        alertsLimit: z.number().default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Run all queries in parallel
      const [taskStats, calendarItems, alerts, points] = await Promise.all([
        // Task stats
        (async () => {
          const [total, completed, inProgress, overdue] = await Promise.all([
            ctx.prisma.task.count(),
            ctx.prisma.task.count({ where: { status: "done" } }),
            ctx.prisma.task.count({ where: { status: "in_progress" } }),
            ctx.prisma.task.count({
              where: {
                status: { not: "done" },
                dueDate: { lt: new Date() },
              },
            }),
          ]);
          return { total, completed, inProgress, overdue };
        })(),

        // Calendar items
        ctx.prisma.contentCalendarItem.findMany({
          where: {
            scheduledAt: {
              gte: new Date(input.calendarStartDate),
              lte: new Date(input.calendarEndDate),
            },
          },
          include: {
            creator: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { scheduledAt: "asc" },
          take: 10,
        }),

        // User alerts
        ctx.prisma.userAlert.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: input.alertsLimit,
        }),

        // User points
        ctx.prisma.userPoints.findUnique({
          where: { userId },
        }),
      ]);

      return {
        taskStats,
        calendarItems,
        alerts,
        points: points ?? { totalPoints: 0, weeklyPoints: 0, monthlyPoints: 0 },
      };
    }),
});
