/**
 * Reddit Monitoring Service
 *
 * Background job that fetches new posts from monitored subreddits,
 * analyzes them with AI, and stores leads in the database.
 */

import { prisma } from "./prisma";
import {
  createRedditClient,
  searchSubreddit,
  isRelevantPost,
  DEFAULT_KEYWORDS,
  type RedditPostData,
} from "./reddit";
import { analyzeRedditPost, type AnalysisResult } from "./ai-analysis";
import { sendLeadNotifications } from "./notifications";

export interface MonitoringResult {
  success: boolean;
  postsFound: number;
  postsAnalyzed: number;
  newLeadsCreated: number;
  highScoreLeads: number;
  errors: string[];
}

/**
 * Run the Reddit monitoring job
 */
export async function runRedditMonitor(): Promise<MonitoringResult> {
  const result: MonitoringResult = {
    success: false,
    postsFound: 0,
    postsAnalyzed: 0,
    newLeadsCreated: 0,
    highScoreLeads: 0,
    errors: [],
  };

  console.log("[RedditMonitor] Starting monitoring job...");

  // Create Reddit client
  const redditClient = createRedditClient();
  if (!redditClient) {
    result.errors.push("Failed to create Reddit client - check credentials");
    console.error("[RedditMonitor] Failed to create Reddit client");
    return result;
  }

  try {
    // Get active monitoring configurations
    const configs = await prisma.redditMonitorConfig.findMany({
      where: { isActive: true },
    });

    if (configs.length === 0) {
      console.log("[RedditMonitor] No active configurations found");
      result.success = true;
      return result;
    }

    console.log(`[RedditMonitor] Found ${configs.length} active configurations`);

    // Collect all posts from all configurations
    const allPosts: RedditPostData[] = [];

    for (const config of configs) {
      try {
        const keywords = JSON.parse(config.keywords) as string[];

        console.log(
          `[RedditMonitor] Searching r/${config.subreddit} with ${keywords.length} keywords`
        );

        const posts = await searchSubreddit(
          redditClient,
          config.subreddit,
          keywords,
          {
            timeFilter: "day",
            limit: 50,
          }
        );

        console.log(
          `[RedditMonitor] Found ${posts.length} posts from r/${config.subreddit}`
        );

        allPosts.push(...posts);
      } catch (error) {
        const errorMsg = `Error searching r/${config.subreddit}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`[RedditMonitor] ${errorMsg}`);
      }
    }

    result.postsFound = allPosts.length;

    // Deduplicate posts
    const uniquePosts = allPosts.filter(
      (post, index, self) =>
        index === self.findIndex((p) => p.redditId === post.redditId)
    );

    console.log(
      `[RedditMonitor] ${uniquePosts.length} unique posts after deduplication`
    );

    // Filter out already captured posts
    const existingPostIds = await prisma.redditPost.findMany({
      where: {
        redditId: { in: uniquePosts.map((p) => p.redditId) },
      },
      select: { redditId: true },
    });

    const existingIds = new Set(existingPostIds.map((p) => p.redditId));
    const newPosts = uniquePosts.filter((p) => !existingIds.has(p.redditId));

    console.log(`[RedditMonitor] ${newPosts.length} new posts to process`);

    // Filter for relevance
    const relevantPosts = newPosts.filter(isRelevantPost);

    console.log(`[RedditMonitor] ${relevantPosts.length} relevant posts`);

    // Analyze and save posts
    for (const post of relevantPosts) {
      try {
        // Analyze with AI
        const analysis = await analyzeRedditPost(post);
        result.postsAnalyzed++;

        if (!analysis) {
          console.log(
            `[RedditMonitor] No analysis for post ${post.redditId}, skipping`
          );
          continue;
        }

        // Only save if lead score is meaningful (> 20)
        if (analysis.leadScore < 20) {
          console.log(
            `[RedditMonitor] Low score (${analysis.leadScore}) for post ${post.redditId}, skipping`
          );
          continue;
        }

        // Save to database
        const savedPost = await prisma.redditPost.create({
          data: {
            redditId: post.redditId,
            subreddit: post.subreddit,
            title: post.title,
            content: post.content,
            author: post.author,
            url: post.url,
            score: post.score,
            numComments: post.numComments,
            createdUtc: post.createdUtc,
            intent: analysis.intent,
            sentiment: analysis.sentiment,
            leadScore: analysis.leadScore,
            keySignals: JSON.stringify(analysis.keySignals),
            aiNotes: analysis.aiNotes,
            suggestedResponse: analysis.suggestedResponse,
            status: "new",
          },
        });

        result.newLeadsCreated++;
        console.log(
          `[RedditMonitor] Saved lead: ${savedPost.id} (score: ${analysis.leadScore})`
        );

        // Track high-score leads for notifications
        if (analysis.leadScore >= 70) {
          result.highScoreLeads++;

          // Send notifications for high-score leads
          await sendLeadNotifications(savedPost, analysis);
        }
      } catch (error) {
        const errorMsg = `Error processing post ${post.redditId}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`[RedditMonitor] ${errorMsg}`);
      }
    }

    result.success = true;
    console.log(
      `[RedditMonitor] Job completed. Created ${result.newLeadsCreated} leads (${result.highScoreLeads} high-score)`
    );
  } catch (error) {
    result.errors.push(`Monitor job failed: ${error}`);
    console.error("[RedditMonitor] Job failed:", error);
  }

  return result;
}

/**
 * Initialize default monitoring configurations if none exist
 */
export async function initializeDefaultConfigs(): Promise<void> {
  const existingConfigs = await prisma.redditMonitorConfig.count();

  if (existingConfigs > 0) {
    console.log("[RedditMonitor] Configurations already exist, skipping init");
    return;
  }

  console.log("[RedditMonitor] Creating default configurations...");

  const defaultConfigs = [
    {
      subreddit: "dentistry",
      keywords: JSON.stringify([
        "dental tourism",
        "cost",
        "abroad",
        "vietnam",
        "asia",
      ]),
    },
    {
      subreddit: "dental",
      keywords: JSON.stringify([
        "dental tourism",
        "implant cost",
        "affordable",
        "overseas",
      ]),
    },
    {
      subreddit: "medicaltourism",
      keywords: JSON.stringify([
        "dental",
        "dentist",
        "implant",
        "vietnam",
        "teeth",
      ]),
    },
    {
      subreddit: "expats",
      keywords: JSON.stringify([
        "dental",
        "dentist",
        "vietnam dental",
        "teeth",
      ]),
    },
    {
      subreddit: "digitalnomad",
      keywords: JSON.stringify([
        "dental",
        "dentist",
        "vietnam",
        "teeth work",
      ]),
    },
    {
      subreddit: "VietNam",
      keywords: JSON.stringify([
        "dental",
        "dentist",
        "teeth",
        "implant",
        "orthodont",
      ]),
    },
    {
      subreddit: "askdentists",
      keywords: JSON.stringify([
        "abroad",
        "overseas",
        "tourism",
        "cost",
        "vietnam",
      ]),
    },
  ];

  for (const config of defaultConfigs) {
    await prisma.redditMonitorConfig.create({
      data: config,
    });
  }

  console.log(`[RedditMonitor] Created ${defaultConfigs.length} default configurations`);
}

/**
 * Get monitoring statistics
 */
export async function getMonitoringStats(): Promise<{
  totalPosts: number;
  newPosts: number;
  reviewedPosts: number;
  respondedPosts: number;
  ignoredPosts: number;
  avgLeadScore: number;
  highScoreCount: number;
  postsLast24h: number;
  postsBySubreddit: Record<string, number>;
}> {
  const [
    totalPosts,
    newPosts,
    reviewedPosts,
    respondedPosts,
    ignoredPosts,
    scoreAgg,
    highScoreCount,
    postsLast24h,
    bySubreddit,
  ] = await Promise.all([
    prisma.redditPost.count(),
    prisma.redditPost.count({ where: { status: "new" } }),
    prisma.redditPost.count({ where: { status: "reviewed" } }),
    prisma.redditPost.count({ where: { status: "responded" } }),
    prisma.redditPost.count({ where: { status: "ignored" } }),
    prisma.redditPost.aggregate({
      _avg: { leadScore: true },
    }),
    prisma.redditPost.count({
      where: { leadScore: { gte: 70 } },
    }),
    prisma.redditPost.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.redditPost.groupBy({
      by: ["subreddit"],
      _count: true,
    }),
  ]);

  return {
    totalPosts,
    newPosts,
    reviewedPosts,
    respondedPosts,
    ignoredPosts,
    avgLeadScore: Math.round(scoreAgg._avg.leadScore ?? 0),
    highScoreCount,
    postsLast24h,
    postsBySubreddit: Object.fromEntries(
      bySubreddit.map((s) => [s.subreddit, s._count])
    ),
  };
}
