/**
 * Reddit API Client for Dental Tourism Lead Detection
 *
 * Uses snoowrap for Reddit API access with rate limiting handled automatically.
 * Searches subreddits for dental tourism related posts.
 */

import Snoowrap from "snoowrap";

// Reddit API configuration from environment variables
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USERNAME = process.env.REDDIT_USERNAME;
const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD;
const REDDIT_USER_AGENT =
  process.env.REDDIT_USER_AGENT || "dental-command-center:v1.0.0";

// Default subreddits to monitor for dental tourism leads
export const DEFAULT_SUBREDDITS = [
  "dentistry",
  "dental",
  "medicaltourism",
  "expats",
  "digitalnomad",
  "VietNam",
  "Bangkok",
  "Thailand",
  "askdentists",
];

// Default keywords to search for
export const DEFAULT_KEYWORDS = [
  "dental tourism",
  "dental implants abroad",
  "cheap dental work",
  "dentist vietnam",
  "dental vietnam",
  "wisdom tooth removal cost",
  "dental crown cost",
  "veneer abroad",
  "root canal cost",
  "dental work overseas",
  "dental treatment asia",
  "affordable dental",
  "dental prices",
  "implant cost",
];

export interface RedditPostData {
  redditId: string;
  subreddit: string;
  title: string;
  content: string;
  author: string;
  url: string;
  score: number;
  numComments: number;
  createdUtc: Date;
  permalink: string;
}

/**
 * Creates and configures the Reddit API client
 */
export function createRedditClient(): Snoowrap | null {
  if (
    !REDDIT_CLIENT_ID ||
    !REDDIT_CLIENT_SECRET ||
    !REDDIT_USERNAME ||
    !REDDIT_PASSWORD
  ) {
    console.warn(
      "[Reddit] Missing credentials. Set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD"
    );
    return null;
  }

  try {
    const client = new Snoowrap({
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      username: REDDIT_USERNAME,
      password: REDDIT_PASSWORD,
    });

    // Configure rate limiting
    client.config({
      requestDelay: 1000, // 1 second between requests
      continueAfterRatelimitError: true,
      retryErrorCodes: [502, 503, 504, 522],
      maxRetryAttempts: 3,
    });

    return client;
  } catch (error) {
    console.error("[Reddit] Failed to create client:", error);
    return null;
  }
}

/**
 * Search a subreddit for posts matching keywords
 */
export async function searchSubreddit(
  client: Snoowrap,
  subreddit: string,
  keywords: string[],
  options: {
    timeFilter?: "hour" | "day" | "week" | "month" | "year" | "all";
    limit?: number;
  } = {}
): Promise<RedditPostData[]> {
  const { timeFilter = "day", limit = 100 } = options;

  const results: RedditPostData[] = [];

  for (const keyword of keywords) {
    try {
      const searchQuery = `subreddit:${subreddit} ${keyword}`;

      const posts = await client.search({
        query: searchQuery,
        time: timeFilter,
        sort: "new",
        limit,
      });

      for (const post of posts) {
        // Skip if already in results (avoid duplicates)
        if (results.some((r) => r.redditId === post.id)) {
          continue;
        }

        results.push({
          redditId: post.id,
          subreddit: post.subreddit.display_name,
          title: post.title,
          content: post.selftext || "",
          author: post.author?.name || "[deleted]",
          url: `https://reddit.com${post.permalink}`,
          score: post.score,
          numComments: post.num_comments,
          createdUtc: new Date(post.created_utc * 1000),
          permalink: post.permalink,
        });
      }
    } catch (error) {
      console.error(
        `[Reddit] Error searching ${subreddit} for "${keyword}":`,
        error
      );
    }
  }

  return results;
}

/**
 * Get new posts from a subreddit
 */
export async function getNewPosts(
  client: Snoowrap,
  subreddit: string,
  limit: number = 50
): Promise<RedditPostData[]> {
  try {
    const posts = await client.getSubreddit(subreddit).getNew({ limit });

    return posts.map((post) => ({
      redditId: post.id,
      subreddit: post.subreddit.display_name,
      title: post.title,
      content: post.selftext || "",
      author: post.author?.name || "[deleted]",
      url: `https://reddit.com${post.permalink}`,
      score: post.score,
      numComments: post.num_comments,
      createdUtc: new Date(post.created_utc * 1000),
      permalink: post.permalink,
    }));
  } catch (error) {
    console.error(`[Reddit] Error fetching new posts from ${subreddit}:`, error);
    return [];
  }
}

/**
 * Get a single post by ID
 */
export async function getPostById(
  client: Snoowrap,
  postId: string
): Promise<RedditPostData | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submission = client.getSubmission(postId) as any;
    const post = await Promise.resolve(submission.fetch());

    return {
      redditId: post.id,
      subreddit: post.subreddit.display_name,
      title: post.title,
      content: post.selftext || "",
      author: post.author?.name || "[deleted]",
      url: `https://reddit.com${post.permalink}`,
      score: post.score,
      numComments: post.num_comments,
      createdUtc: new Date(post.created_utc * 1000),
      permalink: post.permalink,
    };
  } catch (error) {
    console.error(`[Reddit] Error fetching post ${postId}:`, error);
    return null;
  }
}

/**
 * Check if a post is relevant to dental tourism based on content
 */
export function isRelevantPost(post: RedditPostData): boolean {
  const combinedText = `${post.title} ${post.content}`.toLowerCase();

  const dentalTerms = [
    "dental",
    "dentist",
    "tooth",
    "teeth",
    "implant",
    "crown",
    "veneer",
    "root canal",
    "extraction",
    "wisdom tooth",
    "braces",
    "invisalign",
    "orthodont",
    "filling",
    "cavity",
    "gum",
    "periodon",
  ];

  const tourismTerms = [
    "abroad",
    "overseas",
    "travel",
    "tourism",
    "vietnam",
    "thailand",
    "asia",
    "cheap",
    "affordable",
    "cost",
    "price",
    "how much",
    "recommend",
    "suggestion",
    "experience",
  ];

  const hasDentalTerm = dentalTerms.some((term) => combinedText.includes(term));
  const hasTourismTerm = tourismTerms.some((term) =>
    combinedText.includes(term)
  );

  // Either has both terms, or is in a dental-specific subreddit with tourism terms
  const isDentalSubreddit = ["dentistry", "dental", "askdentists"].includes(
    post.subreddit.toLowerCase()
  );

  return (hasDentalTerm && hasTourismTerm) || (isDentalSubreddit && hasTourismTerm);
}

/**
 * Search across multiple subreddits
 */
export async function searchMultipleSubreddits(
  client: Snoowrap,
  configs: Array<{ subreddit: string; keywords: string[] }>,
  options: {
    timeFilter?: "hour" | "day" | "week" | "month" | "year" | "all";
    limit?: number;
  } = {}
): Promise<RedditPostData[]> {
  const allResults: RedditPostData[] = [];

  for (const config of configs) {
    const results = await searchSubreddit(
      client,
      config.subreddit,
      config.keywords,
      options
    );
    allResults.push(...results);
  }

  // Deduplicate by redditId
  const uniqueResults = allResults.filter(
    (post, index, self) =>
      index === self.findIndex((p) => p.redditId === post.redditId)
  );

  return uniqueResults;
}
