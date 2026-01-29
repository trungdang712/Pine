/**
 * Google Analytics 4 Sync Cron Job API Route
 *
 * Syncs landing page metrics from Google Analytics 4:
 * - Page views and sessions
 * - Bounce rate
 * - Average session duration
 * - Conversions
 *
 * Vercel Cron configuration:
 * - Daily at 7:00 AM: /api/cron/sync-ga4
 *
 * Creates LandingPage records for new URLs discovered in GA4 data.
 */

import { NextResponse } from "next/server";
import { syncService } from "@/server/services/sync";
import { getYesterday } from "@/lib/api-client";

const CRON_SECRET = process.env.CRON_SECRET;

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
  const dateParam = url.searchParams.get("date");

  // Parse date or use yesterday
  let syncDate = getYesterday();
  if (dateParam) {
    const parsed = new Date(dateParam);
    if (!isNaN(parsed.getTime())) {
      syncDate = parsed;
    }
  }

  console.log(`[Cron] Starting GA4 sync - date: ${syncDate.toISOString().split("T")[0]}`);

  try {
    const result = await syncService.syncLandingPageMetrics(syncDate);

    console.log(`[Cron] GA4 sync completed:`, {
      success: result.success,
      recordsProcessed: result.recordsProcessed,
      errorCount: result.errors.length,
    });

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      date: syncDate.toISOString().split("T")[0],
      result: {
        landingPagesProcessed: result.recordsProcessed,
        errors: result.errors.length > 0 ? result.errors : undefined,
      },
    });
  } catch (error) {
    console.error(`[Cron] GA4 sync failed:`, error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        date: syncDate.toISOString().split("T")[0],
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
