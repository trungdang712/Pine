/**
 * Reddit Monitoring Cron Job API Route
 *
 * This endpoint is called by Vercel Cron or external cron service
 * to trigger the Reddit monitoring job every 15 minutes.
 *
 * Vercel Cron configuration (add to vercel.json):
 * crons: [{ path: "/api/cron/reddit", schedule: "every 15 minutes" }]
 */

import { NextResponse } from "next/server";
import { runRedditMonitor, initializeDefaultConfigs } from "@/lib/reddit-monitor";
import { sendDailyDigest } from "@/lib/notifications";

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
  const action = url.searchParams.get("action") || "monitor";

  console.log(`[Cron] Starting Reddit cron job - action: ${action}`);

  try {
    switch (action) {
      case "monitor": {
        // Run the main monitoring job
        const result = await runRedditMonitor();

        console.log(`[Cron] Monitor job completed:`, result);

        return NextResponse.json({
          success: result.success,
          timestamp: new Date().toISOString(),
          action: "monitor",
          result: {
            postsFound: result.postsFound,
            postsAnalyzed: result.postsAnalyzed,
            newLeadsCreated: result.newLeadsCreated,
            highScoreLeads: result.highScoreLeads,
            errors: result.errors.length > 0 ? result.errors : undefined,
          },
        });
      }

      case "digest": {
        // Send daily digest (call this once per day)
        const digestResult = await sendDailyDigest();

        console.log(`[Cron] Digest job completed:`, digestResult);

        return NextResponse.json({
          success: digestResult.success,
          timestamp: new Date().toISOString(),
          action: "digest",
          result: {
            emailsSent: digestResult.emailsSent,
            telegramsSent: digestResult.telegramsSent,
            errors: digestResult.errors.length > 0 ? digestResult.errors : undefined,
          },
        });
      }

      case "init": {
        // Initialize default configurations
        await initializeDefaultConfigs();

        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          action: "init",
          message: "Default configurations initialized",
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`[Cron] Job failed:`, error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        action,
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
