/**
 * Google Ads API Client
 *
 * Integrates with Google Ads API v16 to fetch:
 * - Campaign data (name, status, budget, dates)
 * - Campaign metrics (impressions, clicks, conversions, spend)
 * - Account spend summary
 *
 * Uses OAuth 2.0 for authentication with refresh token flow
 */

import {
  ApiClient,
  type ApiClientConfig,
  type DateRange,
  type TokenInfo,
  formatDateForApi,
} from "./api-client";

// Google Ads API types
export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED" | "UNKNOWN";
  budget: number | null;
  budgetType: string;
  startDate: string | null;
  endDate: string | null;
  advertisingChannelType: string;
}

export interface GoogleAdsMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  costMicros: number; // Cost in micros (divide by 1,000,000)
  ctr: number;
  averageCpc: number;
  conversionRate: number;
}

export interface GoogleAdsCampaignWithMetrics extends GoogleAdsCampaign {
  metrics: GoogleAdsMetrics;
}

export interface GoogleAdsSpendSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
}

interface GoogleAdsCredentials {
  client_id: string;
  client_secret: string;
  refresh_token: string;
  developer_token: string;
  customer_id: string;
  login_customer_id?: string;
}

interface GoogleOAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GoogleAdsSearchResponse {
  results?: Array<{
    campaign?: {
      resourceName: string;
      id: string;
      name: string;
      status: string;
      startDate?: string;
      endDate?: string;
      advertisingChannelType?: string;
    };
    campaignBudget?: {
      amountMicros: string;
      type: string;
    };
    metrics?: {
      impressions: string;
      clicks: string;
      conversions: string;
      costMicros: string;
      ctr: string;
      averageCpc: string;
      conversionsFromInteractionsRate: string;
    };
  }>;
  nextPageToken?: string;
}

export class GoogleAdsClient extends ApiClient {
  private credentials: GoogleAdsCredentials | null = null;
  private customerId: string = "";

  constructor() {
    const config: ApiClientConfig = {
      platform: "google_ads",
      baseUrl: "https://googleads.googleapis.com/v16",
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
      console.error("[GoogleAds] No credentials found");
      return false;
    }

    this.credentials = creds as unknown as GoogleAdsCredentials;
    this.customerId = this.credentials.customer_id.replace(/-/g, "");
    return true;
  }

  /**
   * Refresh OAuth access token using refresh token
   */
  async refreshToken(): Promise<TokenInfo> {
    if (!this.credentials) {
      throw new Error("Credentials not initialized");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.credentials.client_id,
        client_secret: this.credentials.client_secret,
        refresh_token: this.credentials.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh Google OAuth token: ${error}`);
    }

    const data = (await response.json()) as GoogleOAuthTokenResponse;

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * Make a Google Ads API request with proper headers
   */
  private async googleAdsRequest<T>(
    endpoint: string,
    body?: object
  ): Promise<T> {
    if (!this.credentials) {
      throw new Error("Credentials not initialized");
    }

    const token = await this.ensureValidToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "developer-token": this.credentials.developer_token,
      "Content-Type": "application/json",
    };

    // Add login-customer-id if managing accounts through MCC
    if (this.credentials.login_customer_id) {
      headers["login-customer-id"] = this.credentials.login_customer_id.replace(
        /-/g,
        ""
      );
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: body ? "POST" : "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Google Ads API error: ${response.status} - ${error}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Execute a GAQL query using searchStream
   */
  private async executeQuery(query: string): Promise<GoogleAdsSearchResponse> {
    const endpoint = `/customers/${this.customerId}/googleAds:searchStream`;

    return this.googleAdsRequest<GoogleAdsSearchResponse>(endpoint, { query });
  }

  /**
   * Get all campaigns with their metrics for a date range
   */
  async getCampaigns(dateRange: DateRange): Promise<GoogleAdsCampaignWithMetrics[]> {
    const startDate = formatDateForApi(dateRange.startDate);
    const endDate = formatDateForApi(dateRange.endDate);

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.start_date,
        campaign.end_date,
        campaign.advertising_channel_type,
        campaign_budget.amount_micros,
        campaign_budget.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions_from_interactions_rate
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
      ORDER BY campaign.name
    `;

    const response = await this.executeQuery(query);

    if (!response.results) {
      return [];
    }

    return response.results.map((row) => ({
      id: row.campaign?.id ?? "",
      name: row.campaign?.name ?? "",
      status: (row.campaign?.status ?? "UNKNOWN") as GoogleAdsCampaign["status"],
      budget: row.campaignBudget?.amountMicros
        ? parseInt(row.campaignBudget.amountMicros) / 1_000_000
        : null,
      budgetType: row.campaignBudget?.type ?? "",
      startDate: row.campaign?.startDate ?? null,
      endDate: row.campaign?.endDate ?? null,
      advertisingChannelType: row.campaign?.advertisingChannelType ?? "",
      metrics: {
        impressions: parseInt(row.metrics?.impressions ?? "0"),
        clicks: parseInt(row.metrics?.clicks ?? "0"),
        conversions: parseFloat(row.metrics?.conversions ?? "0"),
        costMicros: parseInt(row.metrics?.costMicros ?? "0"),
        ctr: parseFloat(row.metrics?.ctr ?? "0"),
        averageCpc: parseInt(row.metrics?.averageCpc ?? "0") / 1_000_000,
        conversionRate: parseFloat(
          row.metrics?.conversionsFromInteractionsRate ?? "0"
        ),
      },
    }));
  }

  /**
   * Get campaign metrics for a specific campaign on a specific date
   */
  async getCampaignMetrics(
    campaignId: string,
    date: Date
  ): Promise<GoogleAdsMetrics | null> {
    const dateStr = formatDateForApi(date);

    const query = `
      SELECT
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions_from_interactions_rate
      FROM campaign
      WHERE campaign.id = ${campaignId}
        AND segments.date = '${dateStr}'
    `;

    const response = await this.executeQuery(query);

    if (!response.results || response.results.length === 0) {
      return null;
    }

    const row = response.results[0];
    return {
      impressions: parseInt(row.metrics?.impressions ?? "0"),
      clicks: parseInt(row.metrics?.clicks ?? "0"),
      conversions: parseFloat(row.metrics?.conversions ?? "0"),
      costMicros: parseInt(row.metrics?.costMicros ?? "0"),
      ctr: parseFloat(row.metrics?.ctr ?? "0"),
      averageCpc: parseInt(row.metrics?.averageCpc ?? "0") / 1_000_000,
      conversionRate: parseFloat(
        row.metrics?.conversionsFromInteractionsRate ?? "0"
      ),
    };
  }

  /**
   * Get account-level spend summary for a date
   */
  async getAccountSpend(date: Date): Promise<GoogleAdsSpendSummary> {
    const dateStr = formatDateForApi(date);

    const query = `
      SELECT
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM customer
      WHERE segments.date = '${dateStr}'
    `;

    const response = await this.executeQuery(query);

    if (!response.results || response.results.length === 0) {
      return {
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
      };
    }

    const row = response.results[0];
    return {
      totalSpend: parseInt(row.metrics?.costMicros ?? "0") / 1_000_000,
      totalImpressions: parseInt(row.metrics?.impressions ?? "0"),
      totalClicks: parseInt(row.metrics?.clicks ?? "0"),
      totalConversions: parseFloat(row.metrics?.conversions ?? "0"),
    };
  }

  /**
   * Get daily metrics for all campaigns (for syncing historical data)
   */
  async getDailyCampaignMetrics(
    date: Date
  ): Promise<
    Array<{ campaignId: string; campaignName: string; metrics: GoogleAdsMetrics }>
  > {
    const dateStr = formatDateForApi(date);

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions_from_interactions_rate
      FROM campaign
      WHERE segments.date = '${dateStr}'
        AND campaign.status != 'REMOVED'
    `;

    const response = await this.executeQuery(query);

    if (!response.results) {
      return [];
    }

    return response.results.map((row) => ({
      campaignId: row.campaign?.id ?? "",
      campaignName: row.campaign?.name ?? "",
      metrics: {
        impressions: parseInt(row.metrics?.impressions ?? "0"),
        clicks: parseInt(row.metrics?.clicks ?? "0"),
        conversions: parseFloat(row.metrics?.conversions ?? "0"),
        costMicros: parseInt(row.metrics?.costMicros ?? "0"),
        ctr: parseFloat(row.metrics?.ctr ?? "0"),
        averageCpc: parseInt(row.metrics?.averageCpc ?? "0") / 1_000_000,
        conversionRate: parseFloat(
          row.metrics?.conversionsFromInteractionsRate ?? "0"
        ),
      },
    }));
  }

  /**
   * Map Google Ads status to our internal status
   */
  static mapStatus(
    googleStatus: GoogleAdsCampaign["status"]
  ): "active" | "paused" | "completed" | "draft" {
    switch (googleStatus) {
      case "ENABLED":
        return "active";
      case "PAUSED":
        return "paused";
      case "REMOVED":
        return "completed";
      default:
        return "draft";
    }
  }
}
