/**
 * Query Client Configuration with Optimized Cache Settings
 *
 * This module provides a factory function for creating QueryClient instances
 * with tuned cache settings for different types of queries.
 *
 * Cache Strategy:
 * - Default: 5 minutes staleTime, 30 minutes gcTime
 * - Analytics queries: 10 minutes staleTime (heavy computations, rarely changes)
 * - Calendar queries: 2 minutes staleTime (more real-time needs)
 * - User queries: 10 minutes staleTime (user data rarely changes)
 */

import { QueryClient } from "@tanstack/react-query";

// Time constants in milliseconds
const MINUTE = 60 * 1000;

export const CACHE_TIMES = {
  // Default cache settings
  default: {
    staleTime: 5 * MINUTE,
    gcTime: 30 * MINUTE,
  },
  // Analytics queries - heavy computations, data doesn't change frequently
  analytics: {
    staleTime: 10 * MINUTE,
    gcTime: 30 * MINUTE,
  },
  // Calendar queries - need more real-time data
  calendar: {
    staleTime: 2 * MINUTE,
    gcTime: 15 * MINUTE,
  },
  // User queries - rarely changes
  user: {
    staleTime: 10 * MINUTE,
    gcTime: 30 * MINUTE,
  },
  // Task queries - moderate update frequency
  task: {
    staleTime: 3 * MINUTE,
    gcTime: 20 * MINUTE,
  },
  // Real-time data - minimal caching
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * MINUTE,
  },
} as const;

/**
 * Creates a QueryClient with optimized default settings
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time - data is fresh for 5 minutes
        staleTime: CACHE_TIMES.default.staleTime,
        // Garbage collection time - cached data lives for 30 minutes
        gcTime: CACHE_TIMES.default.gcTime,
        // Don't refetch on window focus by default (reduces unnecessary requests)
        refetchOnWindowFocus: false,
        // Retry failed requests once
        retry: 1,
        // Network mode - always attempt fetch even if offline
        networkMode: "offlineFirst",
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

/**
 * Query key prefixes for different data domains
 * Use these to create consistent query keys across the app
 */
export const QUERY_KEY_PREFIXES = {
  analytics: ["analytics"] as const,
  calendar: ["calendar"] as const,
  user: ["user"] as const,
  task: ["task"] as const,
  proposal: ["proposal"] as const,
  gamification: ["gamification"] as const,
  library: ["library"] as const,
  budget: ["budget"] as const,
  alerts: ["alerts"] as const,
} as const;

/**
 * Helper to get cache settings based on query key
 * This can be used with queryClient.setQueryDefaults() if needed
 */
export function getCacheSettingsForQuery(queryKey: readonly unknown[]): {
  staleTime: number;
  gcTime: number;
} {
  const firstKey = queryKey[0];

  if (typeof firstKey === "string") {
    if (firstKey.startsWith("analytics")) {
      return CACHE_TIMES.analytics;
    }
    if (firstKey.startsWith("calendar")) {
      return CACHE_TIMES.calendar;
    }
    if (firstKey.startsWith("user")) {
      return CACHE_TIMES.user;
    }
    if (firstKey.startsWith("task")) {
      return CACHE_TIMES.task;
    }
  }

  // Check if it's a tRPC query key (array format)
  if (Array.isArray(firstKey) && firstKey.length > 0) {
    const trpcPath = firstKey[0];
    if (typeof trpcPath === "string") {
      if (trpcPath.startsWith("analytics.")) {
        return CACHE_TIMES.analytics;
      }
      if (trpcPath.startsWith("calendar.")) {
        return CACHE_TIMES.calendar;
      }
      if (trpcPath.startsWith("user.getAll") || trpcPath.startsWith("user.getTeamMembers")) {
        return CACHE_TIMES.user;
      }
      if (trpcPath.startsWith("task.")) {
        return CACHE_TIMES.task;
      }
    }
  }

  return CACHE_TIMES.default;
}
