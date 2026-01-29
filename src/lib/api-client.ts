/**
 * Base API Client with retry, rate limiting, and token refresh
 *
 * This abstract class provides common functionality for all external API integrations:
 * - Automatic token refresh when expired
 * - Exponential backoff retry for transient failures
 * - Rate limit handling with automatic backoff
 * - Request/response logging for debugging
 */

import { prisma } from "./prisma";

export interface ApiClientConfig {
  platform: string;
  baseUrl: string;
  maxRetries?: number;
  initialRetryDelay?: number;
}

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
}

export interface TokenInfo {
  accessToken: string;
  expiresAt: Date | null;
}

export abstract class ApiClient {
  protected platform: string;
  protected baseUrl: string;
  protected maxRetries: number;
  protected initialRetryDelay: number;
  protected accessToken: string | null = null;
  protected tokenExpiresAt: Date | null = null;

  constructor(config: ApiClientConfig) {
    this.platform = config.platform;
    this.baseUrl = config.baseUrl;
    this.maxRetries = config.maxRetries ?? 3;
    this.initialRetryDelay = config.initialRetryDelay ?? 1000;
  }

  /**
   * Refresh the access token using platform-specific logic
   * Must be implemented by each platform client
   */
  abstract refreshToken(): Promise<TokenInfo>;

  /**
   * Get platform-specific credentials from the database
   */
  protected async getCredentials(): Promise<Record<string, string> | null> {
    const config = await prisma.integrationConfig.findUnique({
      where: { platform: this.platform },
    });

    if (!config || !config.isActive) {
      return null;
    }

    try {
      const credentials = JSON.parse(config.credentials) as Record<
        string,
        string
      >;

      // Also load access token if available
      if (config.accessToken) {
        this.accessToken = config.accessToken;
        this.tokenExpiresAt = config.tokenExpiresAt;
      }

      return credentials;
    } catch {
      console.error(
        `Failed to parse credentials for platform ${this.platform}`
      );
      return null;
    }
  }

  /**
   * Save updated tokens to the database
   */
  protected async saveTokens(tokenInfo: TokenInfo): Promise<void> {
    await prisma.integrationConfig.update({
      where: { platform: this.platform },
      data: {
        accessToken: tokenInfo.accessToken,
        tokenExpiresAt: tokenInfo.expiresAt,
        updatedAt: new Date(),
      },
    });

    this.accessToken = tokenInfo.accessToken;
    this.tokenExpiresAt = tokenInfo.expiresAt;
  }

  /**
   * Check if the current token is expired or about to expire
   */
  protected isTokenExpired(): boolean {
    if (!this.accessToken || !this.tokenExpiresAt) {
      return true;
    }

    // Consider token expired if it expires within 5 minutes
    const bufferMs = 5 * 60 * 1000;
    return new Date().getTime() + bufferMs >= this.tokenExpiresAt.getTime();
  }

  /**
   * Ensure we have a valid access token, refreshing if needed
   */
  protected async ensureValidToken(): Promise<string> {
    // Load credentials if not already loaded
    if (!this.accessToken) {
      await this.getCredentials();
    }

    // Refresh if expired
    if (this.isTokenExpired()) {
      const tokenInfo = await this.refreshToken();
      await this.saveTokens(tokenInfo);
    }

    if (!this.accessToken) {
      throw new Error(`No valid access token for platform ${this.platform}`);
    }

    return this.accessToken;
  }

  /**
   * Make an authenticated API request with retry and rate limiting
   */
  async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, timeout = 30000, ...fetchOptions } = options;

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    return this.withRetry(async () => {
      // Get valid token if auth is required
      if (!skipAuth) {
        const token = await this.ensureValidToken();
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          await this.handleRateLimit(response);
          throw new RateLimitError("Rate limited, will retry");
        }

        // Handle token expiration
        if (response.status === 401) {
          // Force token refresh on next attempt
          this.accessToken = null;
          this.tokenExpiresAt = null;
          throw new AuthError("Token expired, will refresh and retry");
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new ApiError(
            `API request failed: ${response.status} ${response.statusText}`,
            response.status,
            errorBody
          );
        }

        const data = (await response.json()) as T;
        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    });
  }

  /**
   * Execute a function with exponential backoff retry
   */
  protected async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          // Don't retry client errors except 401 (auth) and 429 (rate limit)
          if (error.status !== 401 && error.status !== 429) {
            throw error;
          }
        }

        // Check if we should retry
        if (attempt < retries) {
          const delay = this.calculateRetryDelay(attempt);
          console.log(
            `[${this.platform}] Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`,
            error instanceof Error ? error.message : error
          );
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Handle rate limit response by waiting the specified time
   */
  protected async handleRateLimit(response: Response): Promise<void> {
    // Check for Retry-After header
    const retryAfter = response.headers.get("Retry-After");

    let waitMs: number;
    if (retryAfter) {
      // Could be seconds or a date
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        waitMs = seconds * 1000;
      } else {
        const retryDate = new Date(retryAfter);
        waitMs = Math.max(0, retryDate.getTime() - Date.now());
      }
    } else {
      // Default wait of 60 seconds
      waitMs = 60000;
    }

    // Cap at 5 minutes
    waitMs = Math.min(waitMs, 5 * 60 * 1000);

    console.log(
      `[${this.platform}] Rate limited, waiting ${waitMs / 1000} seconds`
    );
    await this.sleep(waitMs);
  }

  /**
   * Calculate exponential backoff delay
   */
  protected calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.initialRetryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 1000;
    return Math.min(baseDelay + jitter, 60000); // Cap at 60 seconds
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update the last sync timestamp for this platform
   */
  async updateLastSyncTime(): Promise<void> {
    await prisma.integrationConfig.update({
      where: { platform: this.platform },
      data: { lastSyncAt: new Date() },
    });
  }
}

/**
 * Custom error classes for API operations
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Date range helper type used across all API clients
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Format date for API queries (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get yesterday's date
 */
export function getYesterday(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get date range for last N days
 */
export function getLastNDays(days: number): DateRange {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}
