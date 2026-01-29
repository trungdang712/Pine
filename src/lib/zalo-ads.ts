/**
 * Zalo OA (Official Account) API Client
 *
 * Integrates with Zalo OA API to fetch:
 * - OA information
 * - Articles/posts
 * - Article statistics (views, reactions, comments)
 * - Follower stats
 *
 * Uses access token authentication
 */

import {
  ApiClient,
  type ApiClientConfig,
  type TokenInfo,
} from "./api-client";

// Zalo API types
export interface ZaloOAInfo {
  oa_id: string;
  name: string;
  description?: string;
  avatar?: string;
  cover?: string;
  num_follower: number;
  is_verified: boolean;
}

export interface ZaloArticle {
  id: string;
  title: string;
  description?: string;
  thumb?: string;
  status: "show" | "hide" | "pending";
  type: "normal" | "video" | "link";
  created_date: number; // Unix timestamp
  updated_date: number;
}

export interface ZaloArticleStats {
  total_view: number;
  total_share: number;
  total_reaction: number;
  total_comment: number;
}

export interface ZaloArticleWithStats extends ZaloArticle {
  stats: ZaloArticleStats;
}

export interface ZaloFollowerStats {
  total: number;
  new_today: number;
  unfollowed_today: number;
}

interface ZaloCredentials {
  oa_id: string;
  app_id: string;
  secret_key: string;
  access_token: string;
  refresh_token?: string;
}

interface ZaloApiResponse<T> {
  error: number;
  message: string;
  data?: T;
}

interface ZaloArticleListResponse {
  total: number;
  offset: number;
  count: number;
  medias: ZaloArticle[];
}

interface ZaloArticleDetailResponse {
  id: string;
  title: string;
  description?: string;
  thumb?: string;
  status: string;
  type: string;
  created_date: number;
  updated_date: number;
  total_view: number;
  total_share: number;
  total_reaction: number;
  total_comment: number;
}

export class ZaloClient extends ApiClient {
  private credentials: ZaloCredentials | null = null;

  constructor() {
    const config: ApiClientConfig = {
      platform: "zalo",
      baseUrl: "https://openapi.zalo.me",
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
      console.error("[Zalo] No credentials found");
      return false;
    }

    this.credentials = creds as unknown as ZaloCredentials;
    this.accessToken = this.credentials.access_token;
    return true;
  }

  /**
   * Refresh the access token using the refresh token
   * Zalo tokens typically expire after 1 month
   */
  async refreshToken(): Promise<TokenInfo> {
    if (!this.credentials?.refresh_token) {
      throw new Error("No refresh token available for Zalo");
    }

    const response = await fetch("https://oauth.zaloapp.com/v4/oa/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        secret_key: this.credentials.secret_key,
      },
      body: new URLSearchParams({
        app_id: this.credentials.app_id,
        grant_type: "refresh_token",
        refresh_token: this.credentials.refresh_token,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh Zalo token: ${error}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: string;
    };

    // Update refresh token in credentials
    this.credentials.refresh_token = data.refresh_token;

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + parseInt(data.expires_in) * 1000),
    };
  }

  /**
   * Make a Zalo API request
   */
  private async zaloRequest<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add params to URL
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        access_token: this.accessToken ?? "",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Zalo API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as ZaloApiResponse<T>;

    if (data.error !== 0) {
      throw new Error(`Zalo API error: ${data.error} - ${data.message}`);
    }

    return data.data as T;
  }

  /**
   * Get OA (Official Account) information
   */
  async getOAInfo(): Promise<ZaloOAInfo> {
    return this.zaloRequest<ZaloOAInfo>("/v2.0/oa/getoa");
  }

  /**
   * Get articles/posts with pagination
   */
  async getArticles(offset = 0, limit = 10): Promise<ZaloArticleListResponse> {
    return this.zaloRequest<ZaloArticleListResponse>("/v2.0/article/getslice", {
      offset: offset.toString(),
      limit: limit.toString(),
      type: "normal",
    });
  }

  /**
   * Get all articles (handles pagination)
   */
  async getAllArticles(maxItems = 100): Promise<ZaloArticle[]> {
    const articles: ZaloArticle[] = [];
    let offset = 0;
    const limit = 10;

    while (articles.length < maxItems) {
      const response = await this.getArticles(offset, limit);

      if (!response.medias || response.medias.length === 0) {
        break;
      }

      articles.push(...response.medias);
      offset += limit;

      if (articles.length >= response.total) {
        break;
      }
    }

    return articles.slice(0, maxItems);
  }

  /**
   * Get article detail with statistics
   */
  async getArticleDetail(articleId: string): Promise<ZaloArticleWithStats> {
    const data = await this.zaloRequest<ZaloArticleDetailResponse>(
      "/v2.0/article/detail",
      {
        id: articleId,
      }
    );

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      thumb: data.thumb,
      status: data.status as ZaloArticle["status"],
      type: data.type as ZaloArticle["type"],
      created_date: data.created_date,
      updated_date: data.updated_date,
      stats: {
        total_view: data.total_view,
        total_share: data.total_share,
        total_reaction: data.total_reaction,
        total_comment: data.total_comment,
      },
    };
  }

  /**
   * Get article statistics
   */
  async getArticleStats(articleId: string): Promise<ZaloArticleStats> {
    const article = await this.getArticleDetail(articleId);
    return article.stats;
  }

  /**
   * Get articles with their statistics
   */
  async getArticlesWithStats(limit = 25): Promise<ZaloArticleWithStats[]> {
    const articles = await this.getAllArticles(limit);

    const articlesWithStats: ZaloArticleWithStats[] = [];

    for (const article of articles) {
      try {
        const detail = await this.getArticleDetail(article.id);
        articlesWithStats.push(detail);
      } catch (error) {
        // If we can't get details, use the basic article with empty stats
        console.warn(`Failed to get details for article ${article.id}:`, error);
        articlesWithStats.push({
          ...article,
          stats: {
            total_view: 0,
            total_share: 0,
            total_reaction: 0,
            total_comment: 0,
          },
        });
      }
    }

    return articlesWithStats;
  }

  /**
   * Get follower statistics
   */
  async getFollowers(): Promise<ZaloFollowerStats> {
    const oaInfo = await this.getOAInfo();

    // Zalo doesn't have a direct endpoint for daily follower stats
    // We return what we can get
    return {
      total: oaInfo.num_follower,
      new_today: 0, // Not available from API
      unfollowed_today: 0, // Not available from API
    };
  }

  /**
   * Send a message to a user (for future use in engagement)
   */
  async sendMessage(
    userId: string,
    message: string
  ): Promise<{ message_id: string }> {
    const response = await fetch(`${this.baseUrl}/v2.0/oa/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: this.accessToken ?? "",
      },
      body: JSON.stringify({
        recipient: {
          user_id: userId,
        },
        message: {
          text: message,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send Zalo message: ${error}`);
    }

    const data = (await response.json()) as ZaloApiResponse<{ message_id: string }>;

    if (data.error !== 0) {
      throw new Error(`Zalo send message error: ${data.error} - ${data.message}`);
    }

    return data.data!;
  }

  /**
   * Convert Zalo article to our SocialPost format
   */
  static toSocialPost(article: ZaloArticleWithStats): {
    platform: string;
    externalId: string;
    content: string;
    mediaUrl: string | null;
    publishedAt: Date;
    reach: number;
    impressions: number;
    engagement: number;
    clicks: number;
    shares: number;
    comments: number;
  } {
    return {
      platform: "zalo",
      externalId: article.id,
      content: article.title + (article.description ? `\n${article.description}` : ""),
      mediaUrl: article.thumb ?? null,
      publishedAt: new Date(article.created_date * 1000),
      reach: article.stats.total_view,
      impressions: article.stats.total_view,
      engagement:
        article.stats.total_reaction +
        article.stats.total_comment +
        article.stats.total_share,
      clicks: 0, // Not available
      shares: article.stats.total_share,
      comments: article.stats.total_comment,
    };
  }
}
