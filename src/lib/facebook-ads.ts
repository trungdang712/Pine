/**
 * Facebook Marketing API Client
 *
 * Integrates with Facebook Marketing API v19.0 to fetch:
 * - Ad accounts and campaigns
 * - Campaign insights (impressions, clicks, conversions, spend)
 * - Page posts with engagement metrics
 * - Instagram media and insights
 *
 * Uses long-lived page access tokens for authentication
 */

import {
  ApiClient,
  type ApiClientConfig,
  type DateRange,
  type TokenInfo,
  formatDateForApi,
} from "./api-client";

// Facebook API types
export interface FacebookCampaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  objective: string;
  created_time: string;
  updated_time: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
}

export interface FacebookInsights {
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  actions?: Array<{ action_type: string; value: string }>;
  cost_per_action_type?: Array<{ action_type: string; value: string }>;
  ctr: number;
  cpc: number;
}

export interface FacebookCampaignWithInsights extends FacebookCampaign {
  insights: FacebookInsights;
}

export interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  full_picture?: string;
  shares?: { count: number };
  reactions?: { summary: { total_count: number } };
  comments?: { summary: { total_count: number } };
}

export interface FacebookPostInsights {
  post_impressions: number;
  post_reach: number;
  post_engaged_users: number;
  post_clicks: number;
  post_reactions_by_type_total?: Record<string, number>;
  post_video_views?: number;
  post_video_view_time?: number;
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramInsights {
  impressions: number;
  reach: number;
  engagement: number;
  saved?: number;
  video_views?: number;
}

interface FacebookCredentials {
  app_id: string;
  app_secret: string;
  page_access_token: string;
  page_id: string;
  ad_account_id: string;
  instagram_account_id?: string;
}

interface FacebookApiResponse<T> {
  data: T[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

interface FacebookInsightsResponse {
  data: Array<{
    impressions?: string;
    clicks?: string;
    spend?: string;
    reach?: string;
    actions?: Array<{ action_type: string; value: string }>;
    cost_per_action_type?: Array<{ action_type: string; value: string }>;
    ctr?: string;
    cpc?: string;
    date_start: string;
    date_stop: string;
  }>;
}

interface FacebookPostInsightsResponse {
  data: Array<{
    name: string;
    values: Array<{ value: number | Record<string, number> }>;
  }>;
}

export class FacebookAdsClient extends ApiClient {
  private credentials: FacebookCredentials | null = null;
  private apiVersion = "v19.0";

  constructor() {
    const config: ApiClientConfig = {
      platform: "facebook",
      baseUrl: "https://graph.facebook.com",
      maxRetries: 3,
      initialRetryDelay: 1000,
    };
    super(config);
  }

  /**
   * Initialize the client by loading credentials
   */
  async initialize(): Promise<boolean> {
    const creds = await this.getCredentials();
    if (!creds) {
      console.error("[Facebook] No credentials found");
      return false;
    }

    this.credentials = creds as unknown as FacebookCredentials;
    // For Facebook, we use the page access token directly
    this.accessToken = this.credentials.page_access_token;
    return true;
  }

  /**
   * Facebook uses long-lived tokens, so we exchange short-lived for long-lived
   * This is typically done during initial OAuth setup
   */
  async refreshToken(): Promise<TokenInfo> {
    if (!this.credentials) {
      throw new Error("Credentials not initialized");
    }

    // Exchange for long-lived token
    const url = new URL(`${this.baseUrl}/${this.apiVersion}/oauth/access_token`);
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", this.credentials.app_id);
    url.searchParams.set("client_secret", this.credentials.app_secret);
    url.searchParams.set("fb_exchange_token", this.credentials.page_access_token);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh Facebook token: ${error}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in?: number;
    };

    // Long-lived tokens last about 60 days
    const expiresIn = data.expires_in ?? 60 * 24 * 60 * 60; // Default 60 days

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }

  /**
   * Make a Facebook Graph API request
   */
  private async graphRequest<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${this.apiVersion}${endpoint}`);

    // Add access token
    url.searchParams.set("access_token", this.accessToken ?? "");

    // Add additional params
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Facebook API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get all ad accounts accessible by the token
   */
  async getAdAccounts(): Promise<Array<{ id: string; name: string }>> {
    const response = await this.graphRequest<
      FacebookApiResponse<{ account_id: string; name: string }>
    >("/me/adaccounts", {
      fields: "account_id,name",
    });

    return response.data.map((account) => ({
      id: account.account_id,
      name: account.name,
    }));
  }

  /**
   * Get campaigns for an ad account with optional date range
   */
  async getCampaigns(dateRange?: DateRange): Promise<FacebookCampaignWithInsights[]> {
    if (!this.credentials) {
      throw new Error("Credentials not initialized");
    }

    const adAccountId = this.credentials.ad_account_id.startsWith("act_")
      ? this.credentials.ad_account_id
      : `act_${this.credentials.ad_account_id}`;

    // Get campaigns
    const campaignsResponse = await this.graphRequest<
      FacebookApiResponse<FacebookCampaign>
    >(`/${adAccountId}/campaigns`, {
      fields:
        "id,name,status,objective,created_time,updated_time,daily_budget,lifetime_budget,start_time,stop_time",
      limit: "100",
    });

    // Get insights for each campaign
    const campaigns: FacebookCampaignWithInsights[] = [];

    for (const campaign of campaignsResponse.data) {
      const insights = await this.getCampaignInsights(
        campaign.id,
        dateRange
      );
      campaigns.push({
        ...campaign,
        insights,
      });
    }

    return campaigns;
  }

  /**
   * Get insights for a specific campaign
   */
  async getCampaignInsights(
    campaignId: string,
    dateRange?: DateRange
  ): Promise<FacebookInsights> {
    const params: Record<string, string> = {
      fields:
        "impressions,clicks,spend,reach,actions,cost_per_action_type,ctr,cpc",
    };

    if (dateRange) {
      params.time_range = JSON.stringify({
        since: formatDateForApi(dateRange.startDate),
        until: formatDateForApi(dateRange.endDate),
      });
    }

    try {
      const response = await this.graphRequest<FacebookInsightsResponse>(
        `/${campaignId}/insights`,
        params
      );

      if (!response.data || response.data.length === 0) {
        return this.emptyInsights();
      }

      const data = response.data[0];
      return {
        impressions: parseInt(data.impressions ?? "0"),
        clicks: parseInt(data.clicks ?? "0"),
        spend: parseFloat(data.spend ?? "0"),
        reach: parseInt(data.reach ?? "0"),
        actions: data.actions,
        cost_per_action_type: data.cost_per_action_type,
        ctr: parseFloat(data.ctr ?? "0"),
        cpc: parseFloat(data.cpc ?? "0"),
      };
    } catch {
      return this.emptyInsights();
    }
  }

  /**
   * Get conversions (leads) from campaign actions
   */
  static getConversions(insights: FacebookInsights): number {
    if (!insights.actions) return 0;

    const conversionActions = [
      "lead",
      "complete_registration",
      "submit_application",
      "contact",
    ];

    return insights.actions
      .filter((a) => conversionActions.includes(a.action_type))
      .reduce((sum, a) => sum + parseInt(a.value), 0);
  }

  /**
   * Get page posts with engagement
   */
  async getPagePosts(since?: Date, limit = 25): Promise<FacebookPost[]> {
    if (!this.credentials) {
      throw new Error("Credentials not initialized");
    }

    const params: Record<string, string> = {
      fields:
        "id,message,created_time,permalink_url,full_picture,shares,reactions.summary(true),comments.summary(true)",
      limit: limit.toString(),
    };

    if (since) {
      params.since = Math.floor(since.getTime() / 1000).toString();
    }

    const response = await this.graphRequest<FacebookApiResponse<FacebookPost>>(
      `/${this.credentials.page_id}/posts`,
      params
    );

    return response.data;
  }

  /**
   * Get insights for a specific post
   */
  async getPostInsights(postId: string): Promise<FacebookPostInsights> {
    const params = {
      metric:
        "post_impressions,post_reach,post_engaged_users,post_clicks,post_reactions_by_type_total,post_video_views,post_video_view_time",
    };

    try {
      const response = await this.graphRequest<FacebookPostInsightsResponse>(
        `/${postId}/insights`,
        params
      );

      const insights: FacebookPostInsights = {
        post_impressions: 0,
        post_reach: 0,
        post_engaged_users: 0,
        post_clicks: 0,
      };

      for (const metric of response.data) {
        const value = metric.values[0]?.value;
        if (typeof value === "number") {
          switch (metric.name) {
            case "post_impressions":
              insights.post_impressions = value;
              break;
            case "post_reach":
              insights.post_reach = value;
              break;
            case "post_engaged_users":
              insights.post_engaged_users = value;
              break;
            case "post_clicks":
              insights.post_clicks = value;
              break;
            case "post_video_views":
              insights.post_video_views = value;
              break;
            case "post_video_view_time":
              insights.post_video_view_time = value;
              break;
          }
        } else if (metric.name === "post_reactions_by_type_total") {
          insights.post_reactions_by_type_total = value as Record<string, number>;
        }
      }

      return insights;
    } catch {
      return {
        post_impressions: 0,
        post_reach: 0,
        post_engaged_users: 0,
        post_clicks: 0,
      };
    }
  }

  /**
   * Get Instagram media for the connected business account
   */
  async getInstagramMedia(limit = 25): Promise<InstagramMedia[]> {
    if (!this.credentials?.instagram_account_id) {
      return [];
    }

    const response = await this.graphRequest<FacebookApiResponse<InstagramMedia>>(
      `/${this.credentials.instagram_account_id}/media`,
      {
        fields:
          "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
        limit: limit.toString(),
      }
    );

    return response.data;
  }

  /**
   * Get insights for Instagram media
   */
  async getInstagramMediaInsights(mediaId: string): Promise<InstagramInsights> {
    try {
      const response = await this.graphRequest<FacebookPostInsightsResponse>(
        `/${mediaId}/insights`,
        {
          metric: "impressions,reach,engagement,saved,video_views",
        }
      );

      const insights: InstagramInsights = {
        impressions: 0,
        reach: 0,
        engagement: 0,
      };

      for (const metric of response.data) {
        const value = metric.values[0]?.value;
        if (typeof value === "number") {
          switch (metric.name) {
            case "impressions":
              insights.impressions = value;
              break;
            case "reach":
              insights.reach = value;
              break;
            case "engagement":
              insights.engagement = value;
              break;
            case "saved":
              insights.saved = value;
              break;
            case "video_views":
              insights.video_views = value;
              break;
          }
        }
      }

      return insights;
    } catch {
      return {
        impressions: 0,
        reach: 0,
        engagement: 0,
      };
    }
  }

  /**
   * Get account spend for a specific date
   */
  async getAccountSpend(date: Date): Promise<number> {
    if (!this.credentials) {
      throw new Error("Credentials not initialized");
    }

    const adAccountId = this.credentials.ad_account_id.startsWith("act_")
      ? this.credentials.ad_account_id
      : `act_${this.credentials.ad_account_id}`;

    const dateStr = formatDateForApi(date);

    const response = await this.graphRequest<FacebookInsightsResponse>(
      `/${adAccountId}/insights`,
      {
        fields: "spend",
        time_range: JSON.stringify({
          since: dateStr,
          until: dateStr,
        }),
      }
    );

    if (!response.data || response.data.length === 0) {
      return 0;
    }

    return parseFloat(response.data[0].spend ?? "0");
  }

  /**
   * Map Facebook status to our internal status
   */
  static mapStatus(
    fbStatus: FacebookCampaign["status"]
  ): "active" | "paused" | "completed" | "draft" {
    switch (fbStatus) {
      case "ACTIVE":
        return "active";
      case "PAUSED":
        return "paused";
      case "DELETED":
      case "ARCHIVED":
        return "completed";
      default:
        return "draft";
    }
  }

  /**
   * Map Facebook objective to our internal objective
   */
  static mapObjective(
    fbObjective: string
  ): "awareness" | "conversion" | "retargeting" | null {
    const objectiveMap: Record<string, "awareness" | "conversion" | "retargeting"> = {
      BRAND_AWARENESS: "awareness",
      REACH: "awareness",
      TRAFFIC: "conversion",
      ENGAGEMENT: "awareness",
      APP_INSTALLS: "conversion",
      VIDEO_VIEWS: "awareness",
      LEAD_GENERATION: "conversion",
      MESSAGES: "conversion",
      CONVERSIONS: "conversion",
      CATALOG_SALES: "retargeting",
      STORE_TRAFFIC: "conversion",
    };

    return objectiveMap[fbObjective] ?? null;
  }

  private emptyInsights(): FacebookInsights {
    return {
      impressions: 0,
      clicks: 0,
      spend: 0,
      reach: 0,
      ctr: 0,
      cpc: 0,
    };
  }
}
