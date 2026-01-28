/**
 * AI Analysis Service for Reddit Posts
 *
 * Uses Claude API to analyze Reddit posts and determine:
 * - Intent classification
 * - Lead score (0-100)
 * - Key signals
 * - Suggested response
 */

import Anthropic from "@anthropic-ai/sdk";
import type { RedditPostData } from "./reddit";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export interface AnalysisResult {
  intent: string;
  sentiment: "positive" | "neutral" | "negative";
  leadScore: number;
  keySignals: string[];
  aiNotes: string;
  suggestedResponse: string;
}

/**
 * Lead scoring criteria weights
 */
const SCORING_CRITERIA = {
  urgencySignals: 20, // "soon", "asap", "next month"
  locationMention: 15, // "vietnam", "asia", "abroad"
  budgetMention: 10, // price inquiries
  specificProcedure: 15, // implants, crowns, veneers
  firstTimeQuestion: 10, // not a frequent poster
  priceComplaint: 10, // "too expensive here"
  activelySearching: 20, // explicit request for recommendations
};

/**
 * Creates the Anthropic client
 */
function createAnthropicClient(): Anthropic | null {
  if (!ANTHROPIC_API_KEY) {
    console.warn("[AI] Missing ANTHROPIC_API_KEY environment variable");
    return null;
  }

  return new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });
}

/**
 * Analyze a Reddit post for dental tourism lead potential
 */
export async function analyzeRedditPost(
  post: RedditPostData
): Promise<AnalysisResult | null> {
  const client = createAnthropicClient();

  if (!client) {
    // Return a basic analysis if no API key
    return performBasicAnalysis(post);
  }

  const prompt = `You are an AI assistant helping a dental clinic in Vietnam identify potential dental tourism leads from Reddit posts.

Analyze the following Reddit post and provide:
1. Intent: What is the user looking for? (e.g., "seeking_dentist", "price_inquiry", "experience_sharing", "general_question", "recommendation_request")
2. Sentiment: Is the post positive, neutral, or negative about dental care/tourism?
3. Lead Score: Rate 0-100 based on likelihood to convert. Consider:
   - Urgency signals (+20): "soon", "asap", "next month", "planning trip"
   - Location interest (+15): mentions Vietnam, Asia, or "abroad"
   - Budget awareness (+10): asks about prices, mentions costs
   - Specific procedure (+15): mentions implants, crowns, veneers, etc.
   - Actively searching (+20): explicit request for recommendations
   - Price complaints (+10): mentions home country is expensive
4. Key Signals: List 3-5 key indicators from the post
5. AI Notes: Brief analysis for the sales team (2-3 sentences)
6. Suggested Response: A helpful, non-spammy response that could guide them toward Vietnam dental tourism without being too salesy

Reddit Post:
Subreddit: r/${post.subreddit}
Title: ${post.title}
Content: ${post.content || "(no content, title-only post)"}
Score: ${post.score} upvotes
Comments: ${post.numComments}

Respond in JSON format:
{
  "intent": "string",
  "sentiment": "positive" | "neutral" | "negative",
  "leadScore": number,
  "keySignals": ["string"],
  "aiNotes": "string",
  "suggestedResponse": "string"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text content from the response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      console.error("[AI] No text content in response");
      return performBasicAnalysis(post);
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[AI] Could not extract JSON from response");
      return performBasicAnalysis(post);
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;

    // Validate and normalize the result
    return {
      intent: result.intent || "unknown",
      sentiment: validateSentiment(result.sentiment),
      leadScore: Math.min(100, Math.max(0, result.leadScore || 0)),
      keySignals: Array.isArray(result.keySignals)
        ? result.keySignals.slice(0, 5)
        : [],
      aiNotes: result.aiNotes || "",
      suggestedResponse: result.suggestedResponse || "",
    };
  } catch (error) {
    console.error("[AI] Error analyzing post:", error);
    return performBasicAnalysis(post);
  }
}

/**
 * Validate sentiment value
 */
function validateSentiment(
  sentiment: string | undefined
): "positive" | "neutral" | "negative" {
  if (
    sentiment === "positive" ||
    sentiment === "neutral" ||
    sentiment === "negative"
  ) {
    return sentiment;
  }
  return "neutral";
}

/**
 * Perform basic keyword-based analysis when AI is not available
 */
function performBasicAnalysis(post: RedditPostData): AnalysisResult {
  const text = `${post.title} ${post.content}`.toLowerCase();
  let score = 0;
  const signals: string[] = [];

  // Check for urgency signals
  const urgencyTerms = ["soon", "asap", "next month", "planning", "upcoming"];
  if (urgencyTerms.some((term) => text.includes(term))) {
    score += SCORING_CRITERIA.urgencySignals;
    signals.push("Urgency detected");
  }

  // Check for location mentions
  const locationTerms = ["vietnam", "asia", "abroad", "overseas", "thailand"];
  if (locationTerms.some((term) => text.includes(term))) {
    score += SCORING_CRITERIA.locationMention;
    signals.push("International dental interest");
  }

  // Check for budget mentions
  const budgetTerms = [
    "cost",
    "price",
    "how much",
    "afford",
    "budget",
    "expensive",
  ];
  if (budgetTerms.some((term) => text.includes(term))) {
    score += SCORING_CRITERIA.budgetMention;
    signals.push("Budget conscious");
  }

  // Check for specific procedures
  const procedureTerms = [
    "implant",
    "crown",
    "veneer",
    "root canal",
    "wisdom tooth",
    "extraction",
  ];
  if (procedureTerms.some((term) => text.includes(term))) {
    score += SCORING_CRITERIA.specificProcedure;
    signals.push("Specific procedure mentioned");
  }

  // Check for recommendation requests
  const searchTerms = ["recommend", "suggestion", "anyone know", "looking for"];
  if (searchTerms.some((term) => text.includes(term))) {
    score += SCORING_CRITERIA.activelySearching;
    signals.push("Actively searching");
  }

  // Check for price complaints
  const complaintTerms = ["too expensive", "can't afford", "rip off", "overpriced"];
  if (complaintTerms.some((term) => text.includes(term))) {
    score += SCORING_CRITERIA.priceComplaint;
    signals.push("Price complaint about home country");
  }

  // Determine intent
  let intent = "general_question";
  if (text.includes("recommend") || text.includes("suggestion")) {
    intent = "recommendation_request";
  } else if (budgetTerms.some((term) => text.includes(term))) {
    intent = "price_inquiry";
  } else if (locationTerms.some((term) => text.includes(term))) {
    intent = "seeking_dentist";
  }

  // Determine sentiment
  const positiveTerms = ["great", "good", "excellent", "happy", "satisfied"];
  const negativeTerms = ["bad", "terrible", "awful", "pain", "problem", "issue"];

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveTerms.some((term) => text.includes(term))) {
    sentiment = "positive";
  } else if (negativeTerms.some((term) => text.includes(term))) {
    sentiment = "negative";
  }

  return {
    intent,
    sentiment,
    leadScore: Math.min(100, score),
    keySignals: signals.length > 0 ? signals : ["General dental inquiry"],
    aiNotes: `Basic analysis: Score ${score}/100 based on keyword matching. Manual review recommended.`,
    suggestedResponse: "",
  };
}

/**
 * Batch analyze multiple posts
 */
export async function analyzeMultiplePosts(
  posts: RedditPostData[]
): Promise<Map<string, AnalysisResult>> {
  const results = new Map<string, AnalysisResult>();

  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (post) => {
        const result = await analyzeRedditPost(post);
        return { redditId: post.redditId, result };
      })
    );

    for (const { redditId, result } of batchResults) {
      if (result) {
        results.set(redditId, result);
      }
    }

    // Small delay between batches
    if (i + batchSize < posts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Generate a response suggestion for a post
 */
export async function generateResponseSuggestion(
  post: RedditPostData,
  context?: string
): Promise<string | null> {
  const client = createAnthropicClient();

  if (!client) {
    return null;
  }

  const prompt = `You are helping a dental clinic in Vietnam respond to a Reddit post about dental tourism.

Generate a helpful, informative response that:
1. Addresses the user's question/concern
2. Subtly mentions Vietnam as a dental tourism destination (if relevant)
3. Provides genuine value and information
4. Is NOT spammy or overtly promotional
5. Follows Reddit community guidelines
6. Is conversational and friendly

${context ? `Additional context: ${context}\n` : ""}

Reddit Post:
Subreddit: r/${post.subreddit}
Title: ${post.title}
Content: ${post.content || "(title-only post)"}

Generate a response (200-300 words max):`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return null;
    }

    return textContent.text;
  } catch (error) {
    console.error("[AI] Error generating response:", error);
    return null;
  }
}
