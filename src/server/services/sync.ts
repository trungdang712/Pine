/**
 * Sync Service
 *
 * Orchestrates data synchronization from external platforms:
 * - Google Ads campaigns and metrics
 * - Facebook/Instagram ads and posts
 * - Zalo OA posts
 * - Google Analytics landing page metrics
 *
 * Records sync operations in SyncLog for monitoring
 */

import { prisma } from "@/lib/prisma";
import {
  GoogleAdsClient,
  type GoogleAdsCampaignWithMetrics,
} from "@/lib/google-ads";
import {
  FacebookAdsClient,
  type FacebookCampaignWithInsights,
  type FacebookPost,
  type InstagramMedia,
} from "@/lib/facebook-ads";
import { ZaloClient, type ZaloArticleWithStats } from "@/lib/zalo-ads";
import { GA4Client, type GA4PageMetrics } from "@/lib/ga4";
import { type DateRange, getYesterday } from "@/lib/api-client";

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
}

type SyncType = "campaigns" | "posts" | "metrics" | "landing_pages";

export class SyncService {
  /**
   * Sync Google Ads campaigns and metrics for a date
   */
  async syncGoogleAdsCampaigns(date: Date = getYesterday()): Promise<SyncResult> {
    const result: SyncResult = { success: true, recordsProcessed: 0, errors: [] };

    try {
      const client = new GoogleAdsClient();
      const initialized = await client.initialize();

      if (!initialized) {
        return {
          success: false,
          recordsProcessed: 0,
          errors: ["Google Ads integration not configured"],
        };
      }

      // Get campaigns with metrics for yesterday
      const dateRange: DateRange = { startDate: date, endDate: date };
      const campaigns = await client.getCampaigns(dateRange);

      for (const campaign of campaigns) {
        try {
          await this.upsertGoogleAdsCampaign(campaign, date);
          result.recordsProcessed++;
        } catch (error) {
          const msg = `Failed to sync campaign ${campaign.id}: ${error}`;
          result.errors.push(msg);
          console.error(msg);
        }
      }

      await client.updateLastSyncTime();
      await this.logSync("google_ads", "campaigns", result);
    } catch (error) {
      result.success = false;
      result.errors.push(`Google Ads sync failed: ${error}`);
      await this.logSync("google_ads", "campaigns", result);
    }

    return result;
  }

  /**
   * Sync Facebook Ads campaigns and metrics for a date
   */
  async syncFacebookAdsCampaigns(date: Date = getYesterday()): Promise<SyncResult> {
    const result: SyncResult = { success: true, recordsProcessed: 0, errors: [] };

    try {
      const client = new FacebookAdsClient();
      const initialized = await client.initialize();

      if (!initialized) {
        return {
          success: false,
          recordsProcessed: 0,
          errors: ["Facebook integration not configured"],
        };
      }

      const dateRange: DateRange = { startDate: date, endDate: date };
      const campaigns = await client.getCampaigns(dateRange);

      for (const campaign of campaigns) {
        try {
          await this.upsertFacebookCampaign(campaign, date);
          result.recordsProcessed++;
        } catch (error) {
          const msg = `Failed to sync campaign ${campaign.id}: ${error}`;
          result.errors.push(msg);
          console.error(msg);
        }
      }

      await client.updateLastSyncTime();
      await this.logSync("facebook", "campaigns", result);
    } catch (error) {
      result.success = false;
      result.errors.push(`Facebook Ads sync failed: ${error}`);
      await this.logSync("facebook", "campaigns", result);
    }

    return result;
  }

  /**
   * Sync Zalo OA articles (Zalo doesn't have traditional ad campaigns)
   */
  async syncZaloAdsCampaigns(): Promise<SyncResult> {
    // Zalo OA doesn't have campaigns like Google/Facebook Ads
    // This is a placeholder that syncs articles as "campaigns"
    return {
      success: true,
      recordsProcessed: 0,
      errors: ["Zalo does not have traditional ad campaigns - use syncZaloPosts instead"],
    };
  }

  /**
   * Sync social posts from all configured platforms
   */
  async syncSocialPosts(): Promise<SyncResult> {
    const result: SyncResult = { success: true, recordsProcessed: 0, errors: [] };

    // Sync Facebook posts
    try {
      const fbResult = await this.syncFacebookPosts();
      result.recordsProcessed += fbResult.recordsProcessed;
      result.errors.push(...fbResult.errors);
      if (!fbResult.success) result.success = false;
    } catch (error) {
      result.errors.push(`Facebook posts sync failed: ${error}`);
    }

    // Sync Instagram posts
    try {
      const igResult = await this.syncInstagramPosts();
      result.recordsProcessed += igResult.recordsProcessed;
      result.errors.push(...igResult.errors);
      if (!igResult.success) result.success = false;
    } catch (error) {
      result.errors.push(`Instagram posts sync failed: ${error}`);
    }

    // Sync Zalo posts
    try {
      const zaloResult = await this.syncZaloPosts();
      result.recordsProcessed += zaloResult.recordsProcessed;
      result.errors.push(...zaloResult.errors);
      if (!zaloResult.success) result.success = false;
    } catch (error) {
      result.errors.push(`Zalo posts sync failed: ${error}`);
    }

    await this.logSync("all", "posts", result);
    return result;
  }

  /**
   * Sync Facebook Page posts
   */
  private async syncFacebookPosts(): Promise<SyncResult> {
    const result: SyncResult = { success: true, recordsProcessed: 0, errors: [] };

    try {
      const client = new FacebookAdsClient();
      const initialized = await client.initialize();

      if (!initialized) {
        return {
          success: false,
          recordsProcessed: 0,
          errors: ["Facebook integration not configured"],
        };
      }

      // Get posts from last 30 days
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const posts = await client.getPagePosts(since, 50);

      for (const post of posts) {
        try {
          await this.upsertFacebookPost(post, client);
          result.recordsProcessed++;
        } catch (error) {
          const msg = `Failed to sync Facebook post ${post.id}: ${error}`;
          result.errors.push(msg);
          console.error(msg);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Facebook posts sync failed: ${error}`);
    }

    return result;
  }

  /**
   * Sync Instagram posts
   */
  private async syncInstagramPosts(): Promise<SyncResult> {
    const result: SyncResult = { success: true, recordsProcessed: 0, errors: [] };

    try {
      const client = new FacebookAdsClient();
      const initialized = await client.initialize();

      if (!initialized) {
        return {
          success: false,
          recordsProcessed: 0,
          errors: ["Instagram integration not configured"],
        };
      }

      const media = await client.getInstagramMedia(50);

      for (const item of media) {
        try {
          await this.upsertInstagramPost(item, client);
          result.recordsProcessed++;
        } catch (error) {
          const msg = `Failed to sync Instagram post ${item.id}: ${error}`;
          result.errors.push(msg);
          console.error(msg);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Instagram posts sync failed: ${error}`);
    }

    return result;
  }

  /**
   * Sync Zalo OA articles
   */
  private async syncZaloPosts(): Promise<SyncResult> {
    const result: SyncResult = { success: true, recordsProcessed: 0, errors: [] };

    try {
      const client = new ZaloClient();
      const initialized = await client.initialize();

      if (!initialized) {
        return {
          success: false,
          recordsProcessed: 0,
          errors: ["Zalo integration not configured"],
        };
      }

      const articles = await client.getArticlesWithStats(50);

      for (const article of articles) {
        try {
          await this.upsertZaloPost(article);
          result.recordsProcessed++;
        } catch (error) {
          const msg = `Failed to sync Zalo article ${article.id}: ${error}`;
          result.errors.push(msg);
          console.error(msg);
        }
      }

      await client.updateLastSyncTime();
    } catch (error) {
      result.success = false;
      result.errors.push(`Zalo posts sync failed: ${error}`);
    }

    return result;
  }

  /**
   * Sync landing page metrics from GA4
   */
  async syncLandingPageMetrics(date: Date = getYesterday()): Promise<SyncResult> {
    const result: SyncResult = { success: true, recordsProcessed: 0, errors: [] };

    try {
      const client = new GA4Client();
      const initialized = await client.initialize();

      if (!initialized) {
        return {
          success: false,
          recordsProcessed: 0,
          errors: ["GA4 integration not configured"],
        };
      }

      const dateRange: DateRange = { startDate: date, endDate: date };
      const report = await client.getLandingPageReport(dateRange);

      for (const page of report.pages) {
        try {
          await this.upsertLandingPageMetric(page, date);
          result.recordsProcessed++;
        } catch (error) {
          const msg = `Failed to sync landing page ${page.pagePath}: ${error}`;
          result.errors.push(msg);
          console.error(msg);
        }
      }

      await client.updateLastSyncTime();
      await this.logSync("google_analytics", "landing_pages", result);
    } catch (error) {
      result.success = false;
      result.errors.push(`GA4 sync failed: ${error}`);
      await this.logSync("google_analytics", "landing_pages", result);
    }

    return result;
  }

  /**
   * Record daily budget spend from platform
   */
  async recordBudgetSpend(
    platform: "google_ads" | "facebook" | "zalo",
    date: Date = getYesterday()
  ): Promise<void> {
    let spend = 0;

    try {
      switch (platform) {
        case "google_ads": {
          const client = new GoogleAdsClient();
          if (await client.initialize()) {
            const summary = await client.getAccountSpend(date);
            spend = summary.totalSpend;
          }
          break;
        }
        case "facebook": {
          const client = new FacebookAdsClient();
          if (await client.initialize()) {
            spend = await client.getAccountSpend(date);
          }
          break;
        }
        case "zalo":
          // Zalo OA doesn't have ad spend tracking
          spend = 0;
          break;
      }

      if (spend > 0) {
        // Get the monthly budget for this date
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const budget = await prisma.monthlyBudget.findUnique({
          where: { month },
        });

        if (budget) {
          await prisma.budgetSpend.create({
            data: {
              budgetId: budget.id,
              platform,
              date,
              amount: spend,
            },
          });

          // Check for budget alerts
          await this.checkBudgetAlerts(budget.id, platform);
        }
      }
    } catch (error) {
      console.error(`Failed to record ${platform} spend for ${date}:`, error);
    }
  }

  /**
   * Check and create budget alerts if thresholds are crossed
   */
  private async checkBudgetAlerts(
    budgetId: string,
    platform: string
  ): Promise<void> {
    const budget = await prisma.monthlyBudget.findUnique({
      where: { id: budgetId },
      include: {
        spends: true,
        alerts: true,
      },
    });

    if (!budget) return;

    // Calculate total spend for platform
    const platformSpend = budget.spends
      .filter((s) => s.platform === platform)
      .reduce((sum, s) => sum + s.amount, 0);

    // Get allocation for platform
    let allocation = 0;
    switch (platform) {
      case "google_ads":
        allocation = budget.googleAdsAllocation;
        break;
      case "facebook":
        allocation = budget.facebookAllocation;
        break;
      case "zalo":
        allocation = budget.zaloAllocation;
        break;
    }

    if (allocation <= 0) return;

    const percentUsed = (platformSpend / allocation) * 100;

    // Check thresholds
    const thresholds = [
      { type: "50_percent", threshold: 50 },
      { type: "80_percent", threshold: 80 },
    ];

    for (const { type, threshold } of thresholds) {
      if (percentUsed >= threshold) {
        // Check if alert already exists
        const existingAlert = budget.alerts.find(
          (a) => a.type === type && a.message.includes(platform)
        );

        if (!existingAlert) {
          await prisma.budgetAlert.create({
            data: {
              budgetId: budget.id,
              type,
              threshold,
              message: `${platform} has used ${percentUsed.toFixed(1)}% of its ${budget.month} budget allocation`,
            },
          });
        }
      }
    }
  }

  /**
   * Log sync operation
   */
  private async logSync(
    platform: string,
    type: SyncType,
    result: SyncResult
  ): Promise<void> {
    await prisma.syncLog.create({
      data: {
        platform,
        type,
        status: result.success
          ? result.errors.length > 0
            ? "partial"
            : "success"
          : "failed",
        recordsProcessed: result.recordsProcessed,
        errorMessage:
          result.errors.length > 0 ? result.errors.join("; ") : null,
        completedAt: new Date(),
      },
    });
  }

  // ==================== Private Upsert Methods ====================

  /**
   * Upsert Google Ads campaign and metrics
   */
  private async upsertGoogleAdsCampaign(
    campaign: GoogleAdsCampaignWithMetrics,
    date: Date
  ): Promise<void> {
    // Upsert campaign
    const dbCampaign = await prisma.marketingCampaign.upsert({
      where: { externalId: campaign.id },
      create: {
        name: campaign.name,
        platform: "google_ads",
        externalId: campaign.id,
        status: GoogleAdsClient.mapStatus(campaign.status),
        budget: campaign.budget,
        startDate: campaign.startDate ? new Date(campaign.startDate) : null,
        endDate: campaign.endDate ? new Date(campaign.endDate) : null,
        objective: this.mapGoogleAdsObjective(campaign.advertisingChannelType),
      },
      update: {
        name: campaign.name,
        status: GoogleAdsClient.mapStatus(campaign.status),
        budget: campaign.budget,
        startDate: campaign.startDate ? new Date(campaign.startDate) : null,
        endDate: campaign.endDate ? new Date(campaign.endDate) : null,
      },
    });

    // Upsert metrics for the date
    await prisma.campaignMetric.upsert({
      where: {
        campaignId_date: {
          campaignId: dbCampaign.id,
          date,
        },
      },
      create: {
        campaignId: dbCampaign.id,
        date,
        impressions: campaign.metrics.impressions,
        clicks: campaign.metrics.clicks,
        conversions: Math.round(campaign.metrics.conversions),
        spend: campaign.metrics.costMicros / 1_000_000,
        leads: Math.round(campaign.metrics.conversions), // Treating conversions as leads
      },
      update: {
        impressions: campaign.metrics.impressions,
        clicks: campaign.metrics.clicks,
        conversions: Math.round(campaign.metrics.conversions),
        spend: campaign.metrics.costMicros / 1_000_000,
        leads: Math.round(campaign.metrics.conversions),
      },
    });
  }

  /**
   * Upsert Facebook campaign and metrics
   */
  private async upsertFacebookCampaign(
    campaign: FacebookCampaignWithInsights,
    date: Date
  ): Promise<void> {
    // Calculate budget
    const budget = campaign.daily_budget
      ? parseFloat(campaign.daily_budget) / 100
      : campaign.lifetime_budget
        ? parseFloat(campaign.lifetime_budget) / 100
        : null;

    // Upsert campaign
    const dbCampaign = await prisma.marketingCampaign.upsert({
      where: { externalId: campaign.id },
      create: {
        name: campaign.name,
        platform: "facebook",
        externalId: campaign.id,
        status: FacebookAdsClient.mapStatus(campaign.status),
        budget,
        startDate: campaign.start_time ? new Date(campaign.start_time) : null,
        endDate: campaign.stop_time ? new Date(campaign.stop_time) : null,
        objective: FacebookAdsClient.mapObjective(campaign.objective),
      },
      update: {
        name: campaign.name,
        status: FacebookAdsClient.mapStatus(campaign.status),
        budget,
        startDate: campaign.start_time ? new Date(campaign.start_time) : null,
        endDate: campaign.stop_time ? new Date(campaign.stop_time) : null,
      },
    });

    // Get conversions from actions
    const conversions = FacebookAdsClient.getConversions(campaign.insights);

    // Upsert metrics
    await prisma.campaignMetric.upsert({
      where: {
        campaignId_date: {
          campaignId: dbCampaign.id,
          date,
        },
      },
      create: {
        campaignId: dbCampaign.id,
        date,
        impressions: campaign.insights.impressions,
        clicks: campaign.insights.clicks,
        conversions,
        spend: campaign.insights.spend,
        leads: conversions,
      },
      update: {
        impressions: campaign.insights.impressions,
        clicks: campaign.insights.clicks,
        conversions,
        spend: campaign.insights.spend,
        leads: conversions,
      },
    });
  }

  /**
   * Upsert Facebook post
   */
  private async upsertFacebookPost(
    post: FacebookPost,
    client: FacebookAdsClient
  ): Promise<void> {
    // Get post insights
    const insights = await client.getPostInsights(post.id);

    // Calculate engagement
    const reactions = post.reactions?.summary?.total_count ?? 0;
    const comments = post.comments?.summary?.total_count ?? 0;
    const shares = post.shares?.count ?? 0;
    const engagement = reactions + comments + shares;

    await prisma.socialPost.upsert({
      where: { id: post.id },
      create: {
        id: post.id,
        platform: "facebook",
        externalId: post.id,
        content: post.message ?? null,
        mediaUrl: post.full_picture ?? null,
        publishedAt: new Date(post.created_time),
        reach: insights.post_reach,
        impressions: insights.post_impressions,
        engagement,
        clicks: insights.post_clicks,
        shares,
        comments,
      },
      update: {
        content: post.message ?? null,
        mediaUrl: post.full_picture ?? null,
        reach: insights.post_reach,
        impressions: insights.post_impressions,
        engagement,
        clicks: insights.post_clicks,
        shares,
        comments,
      },
    });
  }

  /**
   * Upsert Instagram post
   */
  private async upsertInstagramPost(
    media: InstagramMedia,
    client: FacebookAdsClient
  ): Promise<void> {
    // Get media insights
    const insights = await client.getInstagramMediaInsights(media.id);

    const engagement =
      (media.like_count ?? 0) + (media.comments_count ?? 0) + (insights.saved ?? 0);

    await prisma.socialPost.upsert({
      where: { id: media.id },
      create: {
        id: media.id,
        platform: "instagram",
        externalId: media.id,
        content: media.caption ?? null,
        mediaUrl: media.media_url ?? null,
        publishedAt: new Date(media.timestamp),
        reach: insights.reach,
        impressions: insights.impressions,
        engagement,
        clicks: 0, // Instagram doesn't expose clicks
        shares: 0, // Instagram doesn't expose shares for regular posts
        comments: media.comments_count ?? 0,
        videoViews: insights.video_views ?? 0,
      },
      update: {
        content: media.caption ?? null,
        mediaUrl: media.media_url ?? null,
        reach: insights.reach,
        impressions: insights.impressions,
        engagement,
        comments: media.comments_count ?? 0,
        videoViews: insights.video_views ?? 0,
      },
    });
  }

  /**
   * Upsert Zalo article as social post
   */
  private async upsertZaloPost(article: ZaloArticleWithStats): Promise<void> {
    const postData = ZaloClient.toSocialPost(article);

    await prisma.socialPost.upsert({
      where: { id: article.id },
      create: {
        id: article.id,
        ...postData,
      },
      update: {
        content: postData.content,
        mediaUrl: postData.mediaUrl,
        reach: postData.reach,
        impressions: postData.impressions,
        engagement: postData.engagement,
        shares: postData.shares,
        comments: postData.comments,
      },
    });
  }

  /**
   * Upsert landing page and metrics
   */
  private async upsertLandingPageMetric(
    metrics: GA4PageMetrics,
    date: Date
  ): Promise<void> {
    // Create or find landing page
    const landingPage = await prisma.landingPage.upsert({
      where: { url: metrics.pagePath },
      create: {
        url: metrics.pagePath,
        name: metrics.pageTitle ?? metrics.pagePath,
      },
      update: {
        name: metrics.pageTitle ?? metrics.pagePath,
      },
    });

    // Convert metrics
    const metricData = GA4Client.toLandingPageMetric(metrics, date);

    // Upsert metrics
    await prisma.landingPageMetric.upsert({
      where: {
        landingPageId_date: {
          landingPageId: landingPage.id,
          date,
        },
      },
      create: {
        landingPageId: landingPage.id,
        date,
        visits: metricData.visits,
        uniqueVisitors: metricData.uniqueVisitors,
        bounceRate: metricData.bounceRate,
        avgTimeOnPage: metricData.avgTimeOnPage,
        conversions: metricData.conversions,
      },
      update: {
        visits: metricData.visits,
        uniqueVisitors: metricData.uniqueVisitors,
        bounceRate: metricData.bounceRate,
        avgTimeOnPage: metricData.avgTimeOnPage,
        conversions: metricData.conversions,
      },
    });
  }

  /**
   * Map Google Ads channel type to objective
   */
  private mapGoogleAdsObjective(
    channelType: string
  ): "awareness" | "conversion" | "retargeting" | null {
    const map: Record<string, "awareness" | "conversion" | "retargeting"> = {
      SEARCH: "conversion",
      DISPLAY: "awareness",
      SHOPPING: "conversion",
      VIDEO: "awareness",
      MULTI_CHANNEL: "conversion",
      LOCAL: "conversion",
      SMART: "conversion",
      PERFORMANCE_MAX: "conversion",
      LOCAL_SERVICES: "conversion",
      DISCOVERY: "awareness",
    };

    return map[channelType] ?? null;
  }
}

// Export singleton instance
export const syncService = new SyncService();
