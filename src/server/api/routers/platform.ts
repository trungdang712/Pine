import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const platformCategoryEnum = z.enum(["social", "advertising", "analytics", "website"]);

export const platformRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.platform.findMany({
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    });
  }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.platform.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    });
  }),

  getByCategory: protectedProcedure
    .input(z.object({ category: platformCategoryEnum }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.platform.findMany({
        where: { category: input.category, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
      });
    }),

  getByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const platform = await ctx.prisma.platform.findUnique({
        where: { code: input.code },
      });

      if (!platform) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Platform not found" });
      }

      return platform;
    }),

  create: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1).max(50).regex(/^[a-z_]+$/, "Code must be lowercase letters and underscores only"),
        displayName: z.string().min(1).max(100),
        icon: z.string().optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"),
        category: platformCategoryEnum,
        sortOrder: z.number().int().default(0),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (!["super_admin", "admin", "marketing_manager"].includes(user?.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can create platforms" });
      }

      // Check if code already exists
      const existing = await ctx.prisma.platform.findUnique({
        where: { code: input.code },
      });

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A platform with this code already exists" });
      }

      return ctx.prisma.platform.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        displayName: z.string().min(1).max(100).optional(),
        icon: z.string().optional().nullable(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color").optional(),
        category: platformCategoryEnum.optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
        metadata: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (!["super_admin", "admin", "marketing_manager"].includes(user?.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can update platforms" });
      }

      const { id, ...data } = input;

      const platform = await ctx.prisma.platform.findUnique({
        where: { id },
      });

      if (!platform) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Platform not found" });
      }

      return ctx.prisma.platform.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (!["super_admin", "admin"].includes(user?.role ?? "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only super admins can delete platforms" });
      }

      const platform = await ctx.prisma.platform.findUnique({
        where: { id: input.id },
      });

      if (!platform) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Platform not found" });
      }

      // Soft delete by setting isActive to false
      return ctx.prisma.platform.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),

  hardDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is super admin
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (user?.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only super admins can permanently delete platforms" });
      }

      const platform = await ctx.prisma.platform.findUnique({
        where: { id: input.id },
      });

      if (!platform) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Platform not found" });
      }

      await ctx.prisma.platform.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
