import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const assetCategoryEnum = z.enum(["image", "video", "document", "template"]);
const brandAssetCategoryEnum = z.enum(["logo", "guideline", "template", "photo", "video", "icon", "font"]);

export const libraryRouter = createTRPCRouter({
  // Campaign Assets
  getAssets: protectedProcedure
    .input(
      z.object({
        category: assetCategoryEnum.optional(),
        tags: z.string().optional(),
        search: z.string().optional(),
        campaignId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.category) where.category = input.category;
      if (input?.campaignId) where.campaignId = input.campaignId;
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search } },
          { description: { contains: input.search } },
          { tags: { contains: input.search } },
        ];
      }
      if (input?.tags) {
        where.tags = { contains: input.tags };
      }

      const assets = await ctx.prisma.asset.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input?.limit ?? 50,
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        skip: input?.cursor ? 1 : 0,
      });

      return {
        assets,
        nextCursor:
          assets.length === (input?.limit ?? 50)
            ? assets[assets.length - 1]?.id
            : undefined,
      };
    }),

  getAssetById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input.id },
        include: {
          uploadedBy: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      }

      return asset;
    }),

  createAsset: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: assetCategoryEnum,
        fileUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
        tags: z.string().optional(),
        campaignId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.asset.create({
        data: {
          ...input,
          uploadedById: ctx.session.user.id,
        },
      });
    }),

  updateAsset: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        tags: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const asset = await ctx.prisma.asset.findUnique({
        where: { id },
      });

      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      }

      // Check if user can update
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (
        asset.uploadedById !== ctx.session.user.id &&
        !["admin", "marketing_manager"].includes(user?.role ?? "")
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.prisma.asset.update({
        where: { id },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });
    }),

  deleteAsset: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.prisma.asset.findUnique({
        where: { id: input.id },
      });

      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Asset not found" });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (
        asset.uploadedById !== ctx.session.user.id &&
        !["admin", "marketing_manager"].includes(user?.role ?? "")
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.prisma.asset.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Brand Library
  getBrandAssets: protectedProcedure
    .input(
      z.object({
        category: brandAssetCategoryEnum.optional(),
        tags: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.category) where.category = input.category;
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search } },
          { description: { contains: input.search } },
          { tags: { contains: input.search } },
        ];
      }
      if (input?.tags) {
        where.tags = { contains: input.tags };
      }

      return ctx.prisma.brandAsset.findMany({
        where,
        include: {
          uploadedBy: {
            select: { id: true, name: true },
          },
          _count: {
            select: { downloads: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getBrandAssetById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.prisma.brandAsset.findUnique({
        where: { id: input.id },
        include: {
          uploadedBy: {
            select: { id: true, name: true },
          },
          downloads: {
            orderBy: { downloadedAt: "desc" },
            take: 10,
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
          _count: {
            select: { downloads: true },
          },
        },
      });

      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Brand asset not found" });
      }

      return asset;
    }),

  createBrandAsset: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: brandAssetCategoryEnum,
        fileUrl: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
        formats: z.array(z.string()).optional(),
        usageNotes: z.string().optional(),
        tags: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brandAsset.create({
        data: {
          ...input,
          formats: input.formats ? JSON.stringify(input.formats) : null,
          uploadedById: ctx.session.user.id,
        },
      });
    }),

  updateBrandAsset: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        usageNotes: z.string().optional(),
        tags: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      return ctx.prisma.brandAsset.update({
        where: { id },
        data,
      });
    }),

  deleteBrandAsset: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.brandAsset.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  downloadBrandAsset: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Record download
      await ctx.prisma.brandAssetDownload.create({
        data: {
          brandAssetId: input.id,
          userId: ctx.session.user.id,
        },
      });

      const asset = await ctx.prisma.brandAsset.findUnique({
        where: { id: input.id },
        select: { fileUrl: true, name: true },
      });

      return asset;
    }),

  getRecentlyUsedBrandAssets: protectedProcedure.query(async ({ ctx }) => {
    const recentDownloads = await ctx.prisma.brandAssetDownload.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { downloadedAt: "desc" },
      take: 8,
      include: {
        brandAsset: true,
      },
    });

    // Get unique assets
    const seen = new Set<string>();
    return recentDownloads
      .filter((d) => {
        if (seen.has(d.brandAssetId)) return false;
        seen.add(d.brandAssetId);
        return true;
      })
      .map((d) => d.brandAsset);
  }),

  getMostDownloadedBrandAssets: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.brandAsset.findMany({
      include: {
        _count: {
          select: { downloads: true },
        },
      },
      orderBy: {
        downloads: {
          _count: "desc",
        },
      },
      take: 8,
    });
  }),

  // Brand Colors
  getBrandColors: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.brandColor.findMany({
      orderBy: [{ usage: "asc" }, { name: "asc" }],
    });
  }),

  createBrandColor: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        rgbCode: z.string().optional(),
        cmykCode: z.string().optional(),
        usage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brandColor.create({
        data: input,
      });
    }),

  updateBrandColor: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        rgbCode: z.string().optional(),
        cmykCode: z.string().optional(),
        usage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.brandColor.update({
        where: { id },
        data,
      });
    }),

  deleteBrandColor: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.brandColor.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
