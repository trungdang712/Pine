/**
 * Google Analytics 4 Data API Client
 *
 * Integrates with GA4 Data API to fetch:
 * - Page views and sessions
 * - Landing page metrics
 * - User behavior data
 * - Conversion data
 *
 * Uses service account authentication with JWT
 */

import {
  ApiClient,
  type ApiClientConfig,
  type DateRange,
  type TokenInfo,
  formatDateForApi,
} from "./api-client";

// GA4 API types
export interface GA4PageMetrics {
  pagePath: string;
  pageTitle?: string;
  screenPageViews: number;
  totalUsers: number;
  sessions: number;
  bounceRate: number;
  averageSessionDuration: number;
  conversions: number;
}

export interface GA4LandingPageReport {
  pages: GA4PageMetrics[];
  totals: {
    screenPageViews: number;
    totalUsers: number;
    sessions: number;
    bounceRate: number;
    averageSessionDuration: number;
    conversions: number;
  };
}

export interface GA4TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  conversions: number;
}

interface GA4Credentials {
  property_id: string;
  client_email: string;
  private_key: string;
  project_id?: string;
}

interface GA4RunReportRequest {
  dateRanges: Array<{
    startDate: string;
    endDate: string;
  }>;
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dimensionFilter?: {
    filter?: {
      fieldName: string;
      stringFilter: {
        matchType: string;
        value: string;
      };
    };
    andGroup?: {
      expressions: Array<{
        filter: {
          fieldName: string;
          stringFilter: {
            matchType: string;
            value: string;
          };
        };
      }>;
    };
  };
  orderBys?: Array<{
    dimension?: { dimensionName: string };
    metric?: { metricName: string };
    desc?: boolean;
  }>;
  limit?: number;
}

interface GA4RunReportResponse {
  dimensionHeaders?: Array<{ name: string }>;
  metricHeaders?: Array<{ name: string; type: string }>;
  rows?: Array<{
    dimensionValues?: Array<{ value: string }>;
    metricValues?: Array<{ value: string }>;
  }>;
  totals?: Array<{
    dimensionValues?: Array<{ value: string }>;
    metricValues?: Array<{ value: string }>;
  }>;
  rowCount?: number;
}

export class GA4Client extends ApiClient {
  private credentials: GA4Credentials | null = null;
  private propertyId: string = "";

  constructor() {
    const config: ApiClientConfig = {
      platform: "google_analytics",
      baseUrl: "https://analyticsdata.googleapis.com/v1beta",
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
      console.error("[GA4] No credentials found");
      return false;
    }

    this.credentials = creds as unknown as GA4Credentials;
    this.propertyId = this.credentials.property_id;
    return true;
  }

  /**
   * Generate JWT and exchange for access token using service account
   */
  async refreshToken(): Promise<TokenInfo> {
    if (!this.credentials) {
      throw new Error("Credentials not initialized");
    }

    // Create JWT
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: "RS256",
      typ: "JWT",
    };

    const payload = {
      iss: this.credentials.client_email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600, // 1 hour
    };

    // Sign the JWT
    const jwt = await this.signJwt(header, payload, this.credentials.private_key);

    // Exchange JWT for access token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get GA4 access token: ${error}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * Sign JWT using RSA-SHA256
   */
  private async signJwt(
    header: object,
    payload: object,
    privateKey: string
  ): Promise<string> {
    const encoder = new TextEncoder();

    // Base64URL encode header and payload
    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.base64UrlEncode(JSON.stringify(payload));
    const signInput = `${headerB64}.${payloadB64}`;

    // Import private key
    const pemContents = privateKey
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\n/g, "");

    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );

    // Sign
    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      encoder.encode(signInput)
    );

    const signatureB64 = this.base64UrlEncode(
      String.fromCharCode(...new Uint8Array(signature))
    );

    return `${signInput}.${signatureB64}`;
  }

  /**
   * Base64URL encode a string
   */
  private base64UrlEncode(str: string): string {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }

  /**
   * Run a GA4 report
   */
  private async runReport(request: GA4RunReportRequest): Promise<GA4RunReportResponse> {
    const token = await this.ensureValidToken();

    const response = await fetch(
      `${this.baseUrl}/properties/${this.propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GA4 API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<GA4RunReportResponse>;
  }

  /**
   * Get page metrics for a date range
   */
  async getPageMetrics(dateRange: DateRange): Promise<GA4PageMetrics[]> {
    const response = await this.runReport({
      dateRanges: [
        {
          startDate: formatDateForApi(dateRange.startDate),
          endDate: formatDateForApi(dateRange.endDate),
        },
      ],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 100,
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row) => ({
      pagePath: row.dimensionValues?.[0]?.value ?? "",
      pageTitle: row.dimensionValues?.[1]?.value,
      screenPageViews: parseInt(row.metricValues?.[0]?.value ?? "0"),
      totalUsers: parseInt(row.metricValues?.[1]?.value ?? "0"),
      sessions: parseInt(row.metricValues?.[2]?.value ?? "0"),
      bounceRate: parseFloat(row.metricValues?.[3]?.value ?? "0"),
      averageSessionDuration: parseFloat(row.metricValues?.[4]?.value ?? "0"),
      conversions: parseInt(row.metricValues?.[5]?.value ?? "0"),
    }));
  }

  /**
   * Get landing page report for a date range
   */
  async getLandingPageReport(dateRange: DateRange): Promise<GA4LandingPageReport> {
    const response = await this.runReport({
      dateRanges: [
        {
          startDate: formatDateForApi(dateRange.startDate),
          endDate: formatDateForApi(dateRange.endDate),
        },
      ],
      dimensions: [{ name: "landingPage" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 50,
    });

    const pages: GA4PageMetrics[] = (response.rows ?? []).map((row) => ({
      pagePath: row.dimensionValues?.[0]?.value ?? "",
      screenPageViews: parseInt(row.metricValues?.[0]?.value ?? "0"),
      totalUsers: parseInt(row.metricValues?.[1]?.value ?? "0"),
      sessions: parseInt(row.metricValues?.[2]?.value ?? "0"),
      bounceRate: parseFloat(row.metricValues?.[3]?.value ?? "0"),
      averageSessionDuration: parseFloat(row.metricValues?.[4]?.value ?? "0"),
      conversions: parseInt(row.metricValues?.[5]?.value ?? "0"),
    }));

    // Calculate totals
    const totals = pages.reduce(
      (acc, page) => ({
        screenPageViews: acc.screenPageViews + page.screenPageViews,
        totalUsers: acc.totalUsers + page.totalUsers,
        sessions: acc.sessions + page.sessions,
        bounceRate: 0, // Will calculate weighted average
        averageSessionDuration: 0, // Will calculate weighted average
        conversions: acc.conversions + page.conversions,
      }),
      {
        screenPageViews: 0,
        totalUsers: 0,
        sessions: 0,
        bounceRate: 0,
        averageSessionDuration: 0,
        conversions: 0,
      }
    );

    // Calculate weighted averages
    if (totals.sessions > 0) {
      totals.bounceRate =
        pages.reduce((sum, p) => sum + p.bounceRate * p.sessions, 0) /
        totals.sessions;
      totals.averageSessionDuration =
        pages.reduce((sum, p) => sum + p.averageSessionDuration * p.sessions, 0) /
        totals.sessions;
    }

    return { pages, totals };
  }

  /**
   * Get metrics for a specific page/URL
   */
  async getPageMetricsForUrl(
    url: string,
    dateRange: DateRange
  ): Promise<GA4PageMetrics | null> {
    // Extract path from URL
    let pagePath: string;
    try {
      pagePath = new URL(url).pathname;
    } catch {
      pagePath = url;
    }

    const response = await this.runReport({
      dateRanges: [
        {
          startDate: formatDateForApi(dateRange.startDate),
          endDate: formatDateForApi(dateRange.endDate),
        },
      ],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
      ],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "EXACT",
            value: pagePath,
          },
        },
      },
    });

    if (!response.rows || response.rows.length === 0) {
      return null;
    }

    const row = response.rows[0];
    return {
      pagePath: row.dimensionValues?.[0]?.value ?? "",
      screenPageViews: parseInt(row.metricValues?.[0]?.value ?? "0"),
      totalUsers: parseInt(row.metricValues?.[1]?.value ?? "0"),
      sessions: parseInt(row.metricValues?.[2]?.value ?? "0"),
      bounceRate: parseFloat(row.metricValues?.[3]?.value ?? "0"),
      averageSessionDuration: parseFloat(row.metricValues?.[4]?.value ?? "0"),
      conversions: parseInt(row.metricValues?.[5]?.value ?? "0"),
    };
  }

  /**
   * Get traffic sources for a date range
   */
  async getTrafficSources(dateRange: DateRange): Promise<GA4TrafficSource[]> {
    const response = await this.runReport({
      dateRanges: [
        {
          startDate: formatDateForApi(dateRange.startDate),
          endDate: formatDateForApi(dateRange.endDate),
        },
      ],
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "conversions" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 25,
    });

    if (!response.rows) {
      return [];
    }

    return response.rows.map((row) => ({
      source: row.dimensionValues?.[0]?.value ?? "(direct)",
      medium: row.dimensionValues?.[1]?.value ?? "(none)",
      sessions: parseInt(row.metricValues?.[0]?.value ?? "0"),
      users: parseInt(row.metricValues?.[1]?.value ?? "0"),
      conversions: parseInt(row.metricValues?.[2]?.value ?? "0"),
    }));
  }

  /**
   * Get metrics for a specific date (for daily sync)
   */
  async getDailyMetrics(date: Date): Promise<{
    pageViews: number;
    users: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions: number;
  }> {
    const dateStr = formatDateForApi(date);

    const response = await this.runReport({
      dateRanges: [{ startDate: dateStr, endDate: dateStr }],
      metrics: [
        { name: "screenPageViews" },
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
      ],
    });

    if (!response.rows || response.rows.length === 0) {
      return {
        pageViews: 0,
        users: 0,
        sessions: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        conversions: 0,
      };
    }

    const row = response.rows[0];
    return {
      pageViews: parseInt(row.metricValues?.[0]?.value ?? "0"),
      users: parseInt(row.metricValues?.[1]?.value ?? "0"),
      sessions: parseInt(row.metricValues?.[2]?.value ?? "0"),
      bounceRate: parseFloat(row.metricValues?.[3]?.value ?? "0"),
      avgSessionDuration: parseFloat(row.metricValues?.[4]?.value ?? "0"),
      conversions: parseInt(row.metricValues?.[5]?.value ?? "0"),
    };
  }

  /**
   * Convert GA4 metrics to our LandingPageMetric format
   */
  static toLandingPageMetric(metrics: GA4PageMetrics, date: Date): {
    visits: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgTimeOnPage: number;
    conversions: number;
    date: Date;
  } {
    return {
      visits: metrics.screenPageViews,
      uniqueVisitors: metrics.totalUsers,
      bounceRate: metrics.bounceRate * 100, // Convert to percentage
      avgTimeOnPage: Math.round(metrics.averageSessionDuration),
      conversions: metrics.conversions,
      date,
    };
  }
}
