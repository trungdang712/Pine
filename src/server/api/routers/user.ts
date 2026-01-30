import { z } from "zod";
import { hash } from "bcryptjs";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const userRouter = createTRPCRouter({
  // Limited user listing available to all authenticated users (e.g., for assignee dropdowns)
  // Only shows marketing team members
  getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { team: "marketing" },
          { team: "admin" }, // Admins have access to everything
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });
  }),

  // Admin user listing - only marketing team members
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { team: "marketing" },
          { team: "admin" },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          createdAt: true,
          points: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),

  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        team: true,
        createdAt: true,
        points: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user;
  }),

  create: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        role: z.enum([
          "marketing_manager",
          "content_creator",
          "digital_marketing",
          "graphic_designer",
          "video_producer",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Create Supabase Auth user first
      const supabaseAdmin = createAdminClient();
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true, // Auto-confirm the email
      });

      if (authError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create auth account: ${authError.message}`,
        });
      }

      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          password: "", // Password is managed by Supabase Auth
          authId: authData.user.id,
          name: input.name,
          role: input.role,
          team: "marketing",
          mustChangePassword: true, // Require password change on first login
          points: {
            create: {
              totalPoints: 0,
              weeklyPoints: 0,
              monthlyPoints: 0,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return user;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        role: z
          .enum([
            "marketing_manager",
            "content_creator",
            "digital_marketing",
            "graphic_designer",
            "video_producer",
          ])
          .optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const user = await ctx.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      return user;
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
        },
      });

      return user;
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, authId: true, password: true, email: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // For Supabase Auth users, change password via Supabase Auth
      if (user.authId) {
        // Verify current password by attempting a sign-in
        const { error: signInError } = await ctx.supabase.auth.signInWithPassword({
          email: user.email,
          password: input.currentPassword,
        });

        if (signInError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Current password is incorrect",
          });
        }

        // Update password in Supabase Auth
        const { error: updateError } = await ctx.supabase.auth.updateUser({
          password: input.newPassword,
        });

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update password",
          });
        }

        // Clear the mustChangePassword flag
        await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { mustChangePassword: false },
        });

        return { success: true };
      }

      // Fallback for legacy users without Supabase Auth
      const { compare } = await import("bcryptjs");
      const isValid = await compare(input.currentPassword, user.password);

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await hash(input.newPassword, 12);

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
        },
      });

      return { success: true };
    }),
});
