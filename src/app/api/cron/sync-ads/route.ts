/**
 * Ads Sync Cron Job API Route
 *
 * Syncs campaign data and metrics from advertising platforms:
 * - Google Ads
 * - Facebook Ads
 * - Zalo (posts only, no traditional ads)
 *
 * Vercel Cron configuration:
 * - Daily at 6:00 AM: /api/cron/sync-ads?platform=google_ads
 * - Daily at 6:00 AM: /api/cron/sync-ads?platform=facebook
 *
 * Also records daily budget spend from each platform.
 */

import { NextResponse } from "next/server";
import { syncService } from "@/server/services/sync";
import { getYesterday } from "@/lib/api-client";

const CRON_SECRET = process.env.CRON_SECRET;

type Platform = "google_ads" | "facebook" | "zalo" | "all";

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
  const dateParam = url.searchParams.get("date");

  // Parse date or use yesterday
  let syncDate = getYesterday();
  if (dateParam) {
    const parsed = new Date(dateParam);
    if (!isNaN(parsed.getTime())) {
      syncDate = parsed;
    }
  }

  console.log(`[Cron] Starting ads sync - platform: ${platform}, date: ${syncDate.toISOString().split("T")[0]}`);

  const results: Record<string, { success: boolean; recordsProcessed: number; errors: string[] }> = {};

  try {
    // Sync based on platform
    switch (platform) {
      case "google_ads": {
        results.google_ads = await syncService.syncGoogleAdsCampaigns(syncDate);
        // Record spend
        await syncService.recordBudgetSpend("google_ads", syncDate);
        break;
      }

      case "facebook": {
        results.facebook = await syncService.syncFacebookAdsCampaigns(syncDate);
        // Record spend
        await syncService.recordBudgetSpend("facebook", syncDate);
        break;
      }

      case "zalo": {
        // Zalo doesn't have traditional ads, just sync posts
        results.zalo = await syncService.syncZaloAdsCampaigns();
        break;
      }

      case "all": {
        // Sync all platforms
        results.google_ads = await syncService.syncGoogleAdsCampaigns(syncDate);
        results.facebook = await syncService.syncFacebookAdsCampaigns(syncDate);
        results.zalo = await syncService.syncZaloAdsCampaigns();

        // Record spend for platforms with ads
        await syncService.recordBudgetSpend("google_ads", syncDate);
        await syncService.recordBudgetSpend("facebook", syncDate);
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown platform: ${platform}. Valid values: google_ads, facebook, zalo, all` },
          { status: 400 }
        );
    }

    // Calculate overall success
    const overallSuccess = Object.values(results).every((r) => r.success);
    const totalRecords = Object.values(results).reduce((sum, r) => sum + r.recordsProcessed, 0);
    const allErrors = Object.entries(results)
      .flatMap(([p, r]) => r.errors.map((e) => `[${p}] ${e}`));

    console.log(`[Cron] Ads sync completed:`, {
      platform,
      overallSuccess,
      totalRecords,
      errorCount: allErrors.length,
    });

    return NextResponse.json({
      success: overallSuccess,
      timestamp: new Date().toISOString(),
      date: syncDate.toISOString().split("T")[0],
      platform,
      results,
      summary: {
        totalRecordsProcessed: totalRecords,
        errors: allErrors.length > 0 ? allErrors : undefined,
      },
    });
  } catch (error) {
    console.error(`[Cron] Ads sync failed:`, error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        date: syncDate.toISOString().split("T")[0],
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
