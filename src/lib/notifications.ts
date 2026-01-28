/**
 * Notification Service for Reddit Monitoring
 *
 * Sends notifications via email (Resend) and Telegram
 * when high-score leads are detected.
 */

import { Resend } from "resend";
import { prisma } from "./prisma";
import type { RedditPost } from "@/generated/prisma";
import type { AnalysisResult } from "./ai-analysis";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Initialize Resend client
let resendClient: Resend | null = null;
if (RESEND_API_KEY) {
  resendClient = new Resend(RESEND_API_KEY);
}

export interface NotificationResult {
  success: boolean;
  emailsSent: number;
  telegramsSent: number;
  errors: string[];
}

/**
 * Send notifications for a new high-score lead
 */
export async function sendLeadNotifications(
  post: RedditPost,
  analysis: AnalysisResult
): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: true,
    emailsSent: 0,
    telegramsSent: 0,
    errors: [],
  };

  try {
    // Get notification configs that should receive this alert
    const configs = await prisma.redditNotificationConfig.findMany({
      where: {
        isActive: true,
        minLeadScore: { lte: analysis.leadScore },
      },
    });

    if (configs.length === 0) {
      console.log("[Notifications] No active notification configs found");
      return result;
    }

    console.log(
      `[Notifications] Sending to ${configs.length} configured endpoints`
    );

    for (const config of configs) {
      try {
        if (config.type === "email") {
          await sendEmailNotification(config.endpoint, post, analysis);
          result.emailsSent++;
        } else if (config.type === "telegram") {
          await sendTelegramNotification(config.endpoint, post, analysis);
          result.telegramsSent++;
        }
      } catch (error) {
        const errorMsg = `Failed to send ${config.type} notification: ${error}`;
        result.errors.push(errorMsg);
        console.error(`[Notifications] ${errorMsg}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Notification job failed: ${error}`);
    console.error("[Notifications] Job failed:", error);
  }

  return result;
}

/**
 * Send email notification via Resend
 */
async function sendEmailNotification(
  email: string,
  post: RedditPost,
  analysis: AnalysisResult
): Promise<void> {
  if (!resendClient) {
    throw new Error("Resend client not configured - set RESEND_API_KEY");
  }

  const keySignals = post.keySignals
    ? (JSON.parse(post.keySignals) as string[])
    : [];

  const { error } = await resendClient.emails.send({
    from: "Dental Command Center <notifications@greenfielddental.com>",
    to: email,
    subject: `[Lead Score: ${analysis.leadScore}] New Reddit Lead - r/${post.subreddit}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Lead Detected</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Lead Score: ${analysis.leadScore}/100</p>
        </div>

        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <h2 style="margin: 0 0 10px 0; font-size: 16px; color: #374151;">
              r/${post.subreddit}
            </h2>
            <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #111827;">
              ${post.title}
            </h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
              ${post.content ? post.content.substring(0, 300) + (post.content.length > 300 ? "..." : "") : "(No content)"}
            </p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #374151;">Analysis</h4>
            <p style="margin: 0 0 5px 0; font-size: 14px;">
              <strong>Intent:</strong> ${analysis.intent}
            </p>
            <p style="margin: 0 0 5px 0; font-size: 14px;">
              <strong>Sentiment:</strong> ${analysis.sentiment}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Key Signals:</strong> ${keySignals.join(", ")}
            </p>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              ${analysis.aiNotes}
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <a href="${post.url}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              View on Reddit
            </a>
          </div>

          <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
            Posted by u/${post.author} | ${post.score} upvotes | ${post.numComments} comments
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`[Notifications] Email sent to ${email}`);
}

/**
 * Send Telegram notification
 */
async function sendTelegramNotification(
  chatId: string,
  post: RedditPost,
  analysis: AnalysisResult
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error(
      "Telegram bot not configured - set TELEGRAM_BOT_TOKEN"
    );
  }

  const keySignals = post.keySignals
    ? (JSON.parse(post.keySignals) as string[])
    : [];

  const scoreEmoji =
    analysis.leadScore >= 90
      ? "🔥"
      : analysis.leadScore >= 70
        ? "⭐"
        : "📊";

  const message = `
${scoreEmoji} *New Reddit Lead* (Score: ${analysis.leadScore}/100)

*Subreddit:* r/${post.subreddit}
*Title:* ${escapeMarkdown(post.title)}

${post.content ? `*Content:*\n${escapeMarkdown(post.content.substring(0, 200))}${post.content.length > 200 ? "..." : ""}` : ""}

*Analysis:*
- Intent: ${analysis.intent}
- Sentiment: ${analysis.sentiment}
- Signals: ${keySignals.join(", ")}

*AI Notes:* ${escapeMarkdown(analysis.aiNotes)}

[View on Reddit](${post.url})

_Posted by u/${post.author} | ${post.score}↑ | ${post.numComments} comments_
`.trim();

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }

  console.log(`[Notifications] Telegram message sent to ${chatId}`);
}

/**
 * Escape special characters for Telegram Markdown
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}

/**
 * Send daily digest summary
 */
export async function sendDailyDigest(): Promise<NotificationResult> {
  const result: NotificationResult = {
    success: true,
    emailsSent: 0,
    telegramsSent: 0,
    errors: [],
  };

  try {
    // Get posts from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentPosts = await prisma.redditPost.findMany({
      where: {
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { leadScore: "desc" },
    });

    if (recentPosts.length === 0) {
      console.log("[Notifications] No posts in last 24h for digest");
      return result;
    }

    // Calculate stats
    const stats = {
      total: recentPosts.length,
      highScore: recentPosts.filter((p) => (p.leadScore ?? 0) >= 70).length,
      new: recentPosts.filter((p) => p.status === "new").length,
      responded: recentPosts.filter((p) => p.status === "responded").length,
      avgScore: Math.round(
        recentPosts.reduce((sum, p) => sum + (p.leadScore ?? 0), 0) /
          recentPosts.length
      ),
      topSubreddits: Object.entries(
        recentPosts.reduce(
          (acc, p) => {
            acc[p.subreddit] = (acc[p.subreddit] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };

    // Get top 5 leads
    const topLeads = recentPosts.slice(0, 5);

    // Get all active notification configs
    const configs = await prisma.redditNotificationConfig.findMany({
      where: { isActive: true },
    });

    for (const config of configs) {
      try {
        if (config.type === "email") {
          await sendDigestEmail(config.endpoint, stats, topLeads);
          result.emailsSent++;
        } else if (config.type === "telegram") {
          await sendDigestTelegram(config.endpoint, stats, topLeads);
          result.telegramsSent++;
        }
      } catch (error) {
        result.errors.push(`Digest ${config.type} failed: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Daily digest failed: ${error}`);
  }

  return result;
}

/**
 * Send digest via email
 */
async function sendDigestEmail(
  email: string,
  stats: {
    total: number;
    highScore: number;
    new: number;
    responded: number;
    avgScore: number;
    topSubreddits: [string, number][];
  },
  topLeads: RedditPost[]
): Promise<void> {
  if (!resendClient) {
    throw new Error("Resend client not configured");
  }

  const leadsHtml = topLeads
    .map(
      (lead) => `
    <div style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 500;">${lead.title.substring(0, 50)}...</span>
        <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
          ${lead.leadScore}/100
        </span>
      </div>
      <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">
        r/${lead.subreddit} | ${lead.status}
      </p>
    </div>
  `
    )
    .join("");

  await resendClient.emails.send({
    from: "Dental Command Center <notifications@greenfielddental.com>",
    to: email,
    subject: `[Daily Digest] ${stats.total} Reddit Leads - ${stats.highScore} High Score`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Daily Reddit Digest</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Last 24 hours summary</p>
        </div>

        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #0d9488;">${stats.total}</div>
              <div style="font-size: 12px; color: #6b7280;">Total Leads</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.highScore}</div>
              <div style="font-size: 12px; color: #6b7280;">High Score (70+)</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${stats.new}</div>
              <div style="font-size: 12px; color: #6b7280;">New/Unreviewed</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">${stats.avgScore}</div>
              <div style="font-size: 12px; color: #6b7280;">Avg Score</div>
            </div>
          </div>

          <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">Top Subreddits</h3>
            ${stats.topSubreddits.map(([sub, count]) => `<span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; margin-right: 5px; font-size: 12px;">r/${sub} (${count})</span>`).join("")}
          </div>

          <div style="background: white; border-radius: 6px; overflow: hidden;">
            <h3 style="margin: 0; padding: 15px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
              Top Leads
            </h3>
            ${leadsHtml}
          </div>
        </div>

        <div style="padding: 15px; background: #f3f4f6; text-align: center; border-radius: 0 0 8px 8px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/social-listening" style="color: #0d9488; text-decoration: none; font-weight: 500;">
            View All Leads in Dashboard →
          </a>
        </div>
      </div>
    `,
  });
}

/**
 * Send digest via Telegram
 */
async function sendDigestTelegram(
  chatId: string,
  stats: {
    total: number;
    highScore: number;
    new: number;
    responded: number;
    avgScore: number;
    topSubreddits: [string, number][];
  },
  topLeads: RedditPost[]
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("Telegram bot not configured");
  }

  const leadsText = topLeads
    .map(
      (lead, i) =>
        `${i + 1}. [${lead.leadScore}/100] ${escapeMarkdown(lead.title.substring(0, 40))}...`
    )
    .join("\n");

  const message = `
📊 *Daily Reddit Digest*

📈 *Stats (Last 24h):*
- Total Leads: ${stats.total}
- High Score (70+): ${stats.highScore} 🔥
- New/Unreviewed: ${stats.new}
- Avg Score: ${stats.avgScore}

📍 *Top Subreddits:*
${stats.topSubreddits.map(([sub, count]) => `r/${sub}: ${count}`).join(" | ")}

🏆 *Top Leads:*
${leadsText}

[Open Dashboard](${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/social-listening)
`.trim();

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });
}

/**
 * Test notification configuration
 */
export async function testNotification(
  type: "email" | "telegram",
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (type === "email") {
      if (!resendClient) {
        return { success: false, error: "Resend not configured" };
      }

      await resendClient.emails.send({
        from: "Dental Command Center <notifications@greenfielddental.com>",
        to: endpoint,
        subject: "Test Notification - Dental Command Center",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Test Notification</h1>
            <p>This is a test notification from the Dental Command Center Reddit monitoring system.</p>
            <p>If you received this, your email notifications are configured correctly!</p>
          </div>
        `,
      });

      return { success: true };
    } else if (type === "telegram") {
      if (!TELEGRAM_BOT_TOKEN) {
        return { success: false, error: "Telegram bot not configured" };
      }

      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: endpoint,
            text: "✅ Test notification from Dental Command Center\n\nYour Telegram notifications are configured correctly!",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Telegram error: ${error}` };
      }

      return { success: true };
    }

    return { success: false, error: "Unknown notification type" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
