/**
 * Reddit Monitoring tRPC Router
 *
 * Handles all Reddit monitoring related procedures including:
 * - Configuration management
 * - Post listing and filtering
 * - Status updates
 * - AI analysis and response generation
 * - Statistics
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { runRedditMonitor, getMonitoringStats, initializeDefaultConfigs } from "@/lib/reddit-monitor";
import { generateResponseSuggestion } from "@/lib/ai-analysis";
import { testNotification, sendDailyDigest } from "@/lib/notifications";
import { DEFAULT_KEYWORDS, DEFAULT_SUBREDDITS } from "@/lib/reddit";

const postStatusEnum = z.enum(["new", "reviewed", "responded", "ignored"]);
const sentimentEnum = z.enum(["positive", "neutral", "negative"]);
const notificationTypeEnum = z.enum(["email", "telegram"]);

export const redditRouter = createTRPCRouter({
  // ==================== CONFIGURATION ====================

  /**
   * Get all monitoring configurations
   */
  getConfigs: protectedProcedure.query(async ({ ctx }) => {
    const configs = await ctx.prisma.redditMonitorConfig.findMany({
      orderBy: { createdAt: "desc" },
    });

    return configs.map((config) => ({
      ...config,
      keywords: JSON.parse(config.keywords) as string[],
    }));
  }),

  /**
   * Create a new monitoring configuration
   */
  createConfig: adminProcedure
    .input(
      z.object({
        subreddit: z.string().min(1).max(50),
        keywords: z.array(z.string()).min(1),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if subreddit already exists
      const existing = await ctx.prisma.redditMonitorConfig.findUnique({
        where: { subreddit: input.subreddit },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Configuration for r/${input.subreddit} already exists`,
        });
      }

      const config = await ctx.prisma.redditMonitorConfig.create({
        data: {
          subreddit: input.subreddit,
          keywords: JSON.stringify(input.keywords),
          isActive: input.isActive,
        },
      });

      return {
        ...config,
        keywords: input.keywords,
      };
    }),

  /**
   * Update a monitoring configuration
   */
  updateConfig: adminProcedure
    .input(
      z.object({
        id: z.string(),
        keywords: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.redditMonitorConfig.update({
        where: { id: input.id },
        data: {
          ...(input.keywords && { keywords: JSON.stringify(input.keywords) }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
      });

      return {
        ...config,
        keywords: JSON.parse(config.keywords) as string[],
      };
    }),

  /**
   * Delete a monitoring configuration
   */
  deleteConfig: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.redditMonitorConfig.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Initialize default configurations
   */
  initializeDefaults: adminProcedure.mutation(async () => {
    await initializeDefaultConfigs();
    return { success: true };
  }),

  /**
   * Get default keywords and subreddits
   */
  getDefaults: protectedProcedure.query(() => ({
    subreddits: DEFAULT_SUBREDDITS,
    keywords: DEFAULT_KEYWORDS,
  })),

  // ==================== POSTS ====================

  /**
   * Get Reddit posts with filtering and pagination
   */
  getPosts: protectedProcedure
    .input(
      z
        .object({
          status: postStatusEnum.optional(),
          subreddit: z.string().optional(),
          minLeadScore: z.number().min(0).max(100).optional(),
          maxLeadScore: z.number().min(0).max(100).optional(),
          sentiment: sentimentEnum.optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.status) where.status = input.status;
      if (input?.subreddit) where.subreddit = input.subreddit;
      if (input?.sentiment) where.sentiment = input.sentiment;

      if (input?.minLeadScore !== undefined || input?.maxLeadScore !== undefined) {
        where.leadScore = {
          ...(input?.minLeadScore !== undefined && { gte: input.minLeadScore }),
          ...(input?.maxLeadScore !== undefined && { lte: input.maxLeadScore }),
        };
      }

      if (input?.search) {
        where.OR = [
          { title: { contains: input.search } },
          { content: { contains: input.search } },
          { author: { contains: input.search } },
        ];
      }

      const posts = await ctx.prisma.redditPost.findMany({
        where,
        orderBy: [{ leadScore: "desc" }, { createdAt: "desc" }],
        take: (input?.limit ?? 20) + 1,
        ...(input?.cursor && { cursor: { id: input.cursor }, skip: 1 }),
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > (input?.limit ?? 20)) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        posts: posts.map((post) => ({
          ...post,
          keySignals: post.keySignals
            ? (JSON.parse(post.keySignals) as string[])
            : [],
        })),
        nextCursor,
      };
    }),

  /**
   * Get a single post by ID
   */
  getPost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.redditPost.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return {
        ...post,
        keySignals: post.keySignals
          ? (JSON.parse(post.keySignals) as string[])
          : [],
      };
    }),

  /**
   * Update post status
   */
  updatePostStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: postStatusEnum,
        responseUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {
        status: input.status,
      };

      if (input.status === "responded") {
        updateData.respondedAt = new Date();
        updateData.respondedBy = ctx.session.user.name;
        updateData.userId = ctx.session.user.id;
        if (input.responseUrl) {
          updateData.responseUrl = input.responseUrl;
        }
      }

      const post = await ctx.prisma.redditPost.update({
        where: { id: input.id },
        data: updateData,
      });

      return post;
    }),

  /**
   * Bulk update post statuses
   */
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        status: postStatusEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.redditPost.updateMany({
        where: { id: { in: input.ids } },
        data: {
          status: input.status,
          ...(input.status === "responded" && {
            respondedAt: new Date(),
            respondedBy: ctx.session.user.name,
          }),
        },
      });

      return { count: result.count };
    }),

  // ==================== AI FEATURES ====================

  /**
   * Generate AI response suggestion for a post
   */
  generateResponse: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.redditPost.findUnique({
        where: { id: input.postId },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      const response = await generateResponseSuggestion(
        {
          redditId: post.redditId,
          subreddit: post.subreddit,
          title: post.title,
          content: post.content,
          author: post.author,
          url: post.url,
          score: post.score,
          numComments: post.numComments,
          createdUtc: post.createdUtc,
          permalink: "",
        },
        input.context
      );

      if (!response) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate response",
        });
      }

      // Update the post with the new suggested response
      await ctx.prisma.redditPost.update({
        where: { id: input.postId },
        data: { suggestedResponse: response },
      });

      return { response };
    }),

  // ==================== MONITORING ====================

  /**
   * Manually trigger a monitoring refresh
   */
  refreshPosts: adminProcedure.mutation(async () => {
    const result = await runRedditMonitor();
    return result;
  }),

  /**
   * Get monitoring statistics
   */
  getStats: protectedProcedure.query(async () => {
    return getMonitoringStats();
  }),

  /**
   * Get available subreddits (from posts)
   */
  getSubreddits: protectedProcedure.query(async ({ ctx }) => {
    const subreddits = await ctx.prisma.redditPost.groupBy({
      by: ["subreddit"],
      _count: true,
      orderBy: { _count: { subreddit: "desc" } },
    });

    return subreddits.map((s) => ({
      subreddit: s.subreddit,
      count: s._count,
    }));
  }),

  // ==================== NOTIFICATIONS ====================

  /**
   * Get notification configurations for current user
   */
  getNotificationConfigs: protectedProcedure.query(async ({ ctx }) => {
    const configs = await ctx.prisma.redditNotificationConfig.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return configs;
  }),

  /**
   * Create notification configuration
   */
  createNotificationConfig: protectedProcedure
    .input(
      z.object({
        type: notificationTypeEnum,
        endpoint: z.string().min(1),
        minLeadScore: z.number().min(0).max(100).default(70),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.redditNotificationConfig.create({
        data: {
          userId: ctx.session.user.id,
          type: input.type,
          endpoint: input.endpoint,
          minLeadScore: input.minLeadScore,
          isActive: input.isActive,
        },
      });

      return config;
    }),

  /**
   * Update notification configuration
   */
  updateNotificationConfig: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        endpoint: z.string().optional(),
        minLeadScore: z.number().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.prisma.redditNotificationConfig.findUnique({
        where: { id: input.id },
      });

      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const config = await ctx.prisma.redditNotificationConfig.update({
        where: { id: input.id },
        data: {
          ...(input.endpoint && { endpoint: input.endpoint }),
          ...(input.minLeadScore !== undefined && {
            minLeadScore: input.minLeadScore,
          }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
        },
      });

      return config;
    }),

  /**
   * Delete notification configuration
   */
  deleteNotificationConfig: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.prisma.redditNotificationConfig.findUnique({
        where: { id: input.id },
      });

      if (!existing || existing.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.redditNotificationConfig.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Test notification endpoint
   */
  testNotification: protectedProcedure
    .input(
      z.object({
        type: notificationTypeEnum,
        endpoint: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return testNotification(input.type, input.endpoint);
    }),

  /**
   * Manually trigger daily digest
   */
  sendDigest: adminProcedure.mutation(async () => {
    return sendDailyDigest();
  }),
});
