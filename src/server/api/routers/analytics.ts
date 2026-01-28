import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const platformEnum = z.enum(["google_ads", "facebook", "instagram", "zalo", "tiktok"]);

export const analyticsRouter = createTRPCRouter({
  // Campaign Analytics
  getCampaigns: protectedProcedure
    .input(
      z.object({
        platform: platformEnum.optional(),
        status: z.enum(["draft", "active", "paused", "completed"]).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.platform) where.platform = input.platform;
      if (input?.status) where.status = input.status;

      const campaigns = await ctx.prisma.marketingCampaign.findMany({
        where,
        include: {
          metrics: {
            orderBy: { date: "desc" },
            take: 30,
          },
          _count: {
            select: { ads: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Calculate totals for each campaign
      return campaigns.map((campaign) => {
        const totalMetrics = campaign.metrics.reduce(
          (acc, m) => ({
            impressions: acc.impressions + m.impressions,
            clicks: acc.clicks + m.clicks,
            conversions: acc.conversions + m.conversions,
            spend: acc.spend + m.spend,
            leads: acc.leads + m.leads,
          }),
          { impressions: 0, clicks: 0, conversions: 0, spend: 0, leads: 0 }
        );

        const ctr = totalMetrics.impressions > 0
          ? (totalMetrics.clicks / totalMetrics.impressions) * 100
          : 0;

        const cpc = totalMetrics.clicks > 0
          ? totalMetrics.spend / totalMetrics.clicks
          : 0;

        const cpl = totalMetrics.leads > 0
          ? totalMetrics.spend / totalMetrics.leads
          : 0;

        return {
          ...campaign,
          totalMetrics,
          ctr,
          cpc,
          cpl,
        };
      });
    }),

  getCampaignById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.marketingCampaign.findUnique({
        where: { id: input.id },
        include: {
          metrics: {
            orderBy: { date: "asc" },
          },
          ads: true,
          landingPages: {
            include: {
              metrics: {
                orderBy: { date: "desc" },
                take: 30,
              },
            },
          },
        },
      });

      if (!campaign) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      }

      return campaign;
    }),

  // Overview Dashboard
  getDashboardStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dateFilter = {
        date: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
      };

      // Get campaign metrics
      const metrics = await ctx.prisma.campaignMetric.findMany({
        where: dateFilter,
      });

      const totalMetrics = metrics.reduce(
        (acc, m) => ({
          impressions: acc.impressions + m.impressions,
          clicks: acc.clicks + m.clicks,
          conversions: acc.conversions + m.conversions,
          spend: acc.spend + m.spend,
          leads: acc.leads + m.leads,
        }),
        { impressions: 0, clicks: 0, conversions: 0, spend: 0, leads: 0 }
      );

      // Get CRM leads
      const leadCount = await ctx.prisma.crmLead.count({
        where: {
          createdAt: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
      });

      // Get appointments
      const appointmentCount = await ctx.prisma.crmAppointment.count({
        where: {
          appointmentDate: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
      });

      // Calculate rates
      const ctr = totalMetrics.impressions > 0
        ? (totalMetrics.clicks / totalMetrics.impressions) * 100
        : 0;

      const conversionRate = totalMetrics.clicks > 0
        ? (totalMetrics.conversions / totalMetrics.clicks) * 100
        : 0;

      const cpl = totalMetrics.leads > 0
        ? totalMetrics.spend / totalMetrics.leads
        : 0;

      return {
        ...totalMetrics,
        leadCount,
        appointmentCount,
        ctr,
        conversionRate,
        cpl,
      };
    }),

  getSpendByPlatform: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      const campaigns = await ctx.prisma.marketingCampaign.findMany({
        include: {
          metrics: {
            where: {
              date: {
                gte: new Date(input.startDate),
                lte: new Date(input.endDate),
              },
            },
          },
        },
      });

      const byPlatform: Record<string, { spend: number; leads: number; conversions: number }> = {};

      for (const campaign of campaigns) {
        if (!byPlatform[campaign.platform]) {
          byPlatform[campaign.platform] = { spend: 0, leads: 0, conversions: 0 };
        }

        for (const metric of campaign.metrics) {
          byPlatform[campaign.platform].spend += metric.spend;
          byPlatform[campaign.platform].leads += metric.leads;
          byPlatform[campaign.platform].conversions += metric.conversions;
        }
      }

      return byPlatform;
    }),

  getSpendTrend: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
      })
    )
    .query(async ({ ctx, input }) => {
      const metrics = await ctx.prisma.campaignMetric.findMany({
        where: {
          date: {
            gte: new Date(input.startDate),
            lte: new Date(input.endDate),
          },
        },
        orderBy: { date: "asc" },
      });

      // Group by date
      const grouped: Record<string, { spend: number; leads: number; conversions: number; clicks: number }> = {};

      for (const metric of metrics) {
        let key: string;
        const date = new Date(metric.date);

        if (input.groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (input.groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        if (!grouped[key]) {
          grouped[key] = { spend: 0, leads: 0, conversions: 0, clicks: 0 };
        }

        grouped[key].spend += metric.spend;
        grouped[key].leads += metric.leads;
        grouped[key].conversions += metric.conversions;
        grouped[key].clicks += metric.clicks;
      }

      return Object.entries(grouped).map(([date, data]) => ({
        date,
        ...data,
      }));
    }),

  // Post Performance
  getPostPerformance: protectedProcedure
    .input(
      z.object({
        platform: platformEnum.optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {};

      if (input?.platform) where.platform = input.platform;
      if (input?.startDate && input?.endDate) {
        where.publishedAt = {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        };
      }

      const posts = await ctx.prisma.socialPost.findMany({
        where,
        include: {
          campaign: {
            select: { id: true, name: true },
          },
          calendarItem: {
            select: { id: true, title: true },
          },
        },
        orderBy: { engagement: "desc" },
        take: input?.limit ?? 20,
      });

      return posts.map((post) => ({
        ...post,
        engagementRate: post.reach > 0 ? (post.engagement / post.reach) * 100 : 0,
        ctr: post.impressions > 0 ? (post.clicks / post.impressions) * 100 : 0,
      }));
    }),

  // Landing Page Analytics
  getLandingPagePerformance: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      const pages = await ctx.prisma.landingPage.findMany({
        include: {
          metrics: {
            where: {
              date: {
                gte: new Date(input.startDate),
                lte: new Date(input.endDate),
              },
            },
          },
          campaign: {
            select: { id: true, name: true },
          },
        },
      });

      return pages.map((page) => {
        const totalMetrics = page.metrics.reduce(
          (acc, m) => ({
            visits: acc.visits + m.visits,
            uniqueVisitors: acc.uniqueVisitors + m.uniqueVisitors,
            conversions: acc.conversions + m.conversions,
            bounceRateSum: acc.bounceRateSum + m.bounceRate,
            avgTimeSum: acc.avgTimeSum + m.avgTimeOnPage,
          }),
          { visits: 0, uniqueVisitors: 0, conversions: 0, bounceRateSum: 0, avgTimeSum: 0 }
        );

        const avgBounceRate = page.metrics.length > 0
          ? totalMetrics.bounceRateSum / page.metrics.length
          : 0;

        const avgTimeOnPage = page.metrics.length > 0
          ? totalMetrics.avgTimeSum / page.metrics.length
          : 0;

        const conversionRate = totalMetrics.visits > 0
          ? (totalMetrics.conversions / totalMetrics.visits) * 100
          : 0;

        return {
          ...page,
          totalVisits: totalMetrics.visits,
          uniqueVisitors: totalMetrics.uniqueVisitors,
          totalConversions: totalMetrics.conversions,
          avgBounceRate,
          avgTimeOnPage,
          conversionRate,
        };
      });
    }),

  // Lead Analytics (from CRM - read only)
  getLeadStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dateFilter = {
        createdAt: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
      };

      const [total, bySource, byStatus] = await Promise.all([
        ctx.prisma.crmLead.count({ where: dateFilter }),
        ctx.prisma.crmLead.groupBy({
          by: ["source"],
          where: dateFilter,
          _count: true,
        }),
        ctx.prisma.crmLead.groupBy({
          by: ["status"],
          where: dateFilter,
          _count: true,
        }),
      ]);

      return {
        total,
        bySource: Object.fromEntries(bySource.map((s) => [s.source ?? "unknown", s._count])),
        byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      };
    }),

  // Appointment Analytics (from CRM - read only)
  getAppointmentStats: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dateFilter = {
        appointmentDate: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
      };

      const [total, byStatus, byService] = await Promise.all([
        ctx.prisma.crmAppointment.count({ where: dateFilter }),
        ctx.prisma.crmAppointment.groupBy({
          by: ["status"],
          where: dateFilter,
          _count: true,
        }),
        ctx.prisma.crmAppointment.groupBy({
          by: ["serviceType"],
          where: dateFilter,
          _count: true,
        }),
      ]);

      const noShowRate = byStatus.find((s) => s.status === "no_show")?._count ?? 0;

      return {
        total,
        byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
        byService: Object.fromEntries(byService.map((s) => [s.serviceType ?? "unknown", s._count])),
        noShowRate: total > 0 ? (noShowRate / total) * 100 : 0,
      };
    }),
});
