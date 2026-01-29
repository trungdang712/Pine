import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const platformEnum = z.enum(["facebook", "instagram", "zalo", "tiktok", "youtube", "website"]);

export const channelsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.socialChannel.findMany({
      orderBy: [{ platform: "asc" }, { name: "asc" }],
    });
  }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.socialChannel.findMany({
      where: { isActive: true },
      orderBy: [{ platform: "asc" }, { name: "asc" }],
    });
  }),

  getByPlatform: protectedProcedure
    .input(z.object({ platform: platformEnum }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.socialChannel.findMany({
        where: {
          platform: input.platform,
          isActive: true,
        },
        orderBy: { name: "asc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const channel = await ctx.prisma.socialChannel.findUnique({
        where: { id: input.id },
      });

      if (!channel) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Channel not found" });
      }

      return channel;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        platform: platformEnum,
        accountId: z.string().optional(),
        accountUrl: z.string().optional(),
        avatarUrl: z.string().optional(),
        description: z.string().optional(),
        metadata: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin permissions
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (!["super_admin", "admin", "marketing_manager"].includes(user?.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to create channels" });
      }

      return ctx.prisma.socialChannel.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        platform: platformEnum.optional(),
        accountId: z.string().nullable().optional(),
        accountUrl: z.string().nullable().optional(),
        avatarUrl: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        metadata: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check admin permissions
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (!["super_admin", "admin", "marketing_manager"].includes(user?.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to update channels" });
      }

      const { id, ...data } = input;

      return ctx.prisma.socialChannel.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check admin permissions
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (!["super_admin", "admin", "marketing_manager"].includes(user?.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete channels" });
      }

      // Check if channel has any calendar items
      const itemsCount = await ctx.prisma.contentCalendarItem.count({
        where: { channelId: input.id },
      });

      if (itemsCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot delete channel with ${itemsCount} linked calendar items. Deactivate instead.`,
        });
      }

      return ctx.prisma.socialChannel.delete({
        where: { id: input.id },
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const channels = await ctx.prisma.socialChannel.findMany({
      include: {
        _count: {
          select: { calendarItems: true },
        },
      },
    });

    const byPlatform = channels.reduce(
      (acc, channel) => {
        if (!acc[channel.platform]) {
          acc[channel.platform] = { total: 0, active: 0 };
        }
        acc[channel.platform].total++;
        if (channel.isActive) {
          acc[channel.platform].active++;
        }
        return acc;
      },
      {} as Record<string, { total: number; active: number }>
    );

    return {
      total: channels.length,
      active: channels.filter((c) => c.isActive).length,
      byPlatform,
      channels: channels.map((c) => ({
        ...c,
        itemsCount: c._count.calendarItems,
      })),
    };
  }),
});
