/**
 * Social Posts Sync Cron Job API Route
 *
 * Syncs social media posts and engagement metrics from:
 * - Facebook Page posts
 * - Instagram media
 * - Zalo OA articles
 *
 * Vercel Cron configuration:
 * - Every 6 hours: /api/cron/sync-posts
 *
 * Updates engagement metrics (reach, impressions, clicks, reactions, etc.)
 */

import { NextResponse } from "next/server";
import { syncService } from "@/server/services/sync";

const CRON_SECRET = process.env.CRON_SECRET;

type Platform = "facebook" | "instagram" | "zalo" | "all";

/**
 * Verify the cron request is authorized
 */
function isAuthorized(request: Request): boolean {
  // In development, allow all requests
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Check for Vercel Cron authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${CRON_SECRET}`) {
    return true;
  }

  // Check for Vercel's internal cron header
  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (vercelCronHeader === "true") {
    return true;
  }

  // Check query param for external cron services
  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");
  if (secretParam && secretParam === CRON_SECRET) {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  // Verify authorization
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const platform = (url.searchParams.get("platform") || "all") as Platform;

  console.log(`[Cron] Starting posts sync - platform: ${platform}`);

  try {
    // Sync all platforms at once using the unified method
    // The syncSocialPosts method handles all platforms internally
    const result = await syncService.syncSocialPosts();

    console.log(`[Cron] Posts sync completed:`, {
      success: result.success,
      recordsProcessed: result.recordsProcessed,
      errorCount: result.errors.length,
    });

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      platform,
      result: {
        recordsProcessed: result.recordsProcessed,
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
    });
  } catch (error) {
    console.error(`[Cron] Posts sync failed:`, error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        platform,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers from dashboard
export async function POST(request: Request) {
  return GET(request);
}
