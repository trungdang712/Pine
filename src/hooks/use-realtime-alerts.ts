"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeAlertsOptions {
  userId: string | undefined;
  /** If true, skip realtime subscription (e.g. demo mode) */
  isDemoMode?: boolean;
}

interface UseRealtimeAlertsReturn {
  isConnected: boolean;
}

/**
 * Hook that subscribes to Supabase Realtime postgres_changes on the "UserAlert" table
 * filtered by the current user's ID (INSERT events only).
 *
 * When a new alert arrives:
 *   - Invalidates tRPC alerts queries (getUnreadCount, getMyAlerts)
 *   - Shows a browser notification if permission is granted
 *   - Shows a sonner toast with the alert title and message
 *
 * Cleans up the subscription on unmount.
 * Handles demo mode by skipping realtime entirely.
 * Requests browser Notification permission on mount.
 */
export function useRealtimeAlerts({
  userId,
  isDemoMode = false,
}: UseRealtimeAlertsOptions): UseRealtimeAlertsReturn {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const utils = trpc.useUtils();

  // Request browser notification permission on mount
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {
        // Silently ignore if user denies or browser blocks the request
      });
    }
  }, []);

  const showBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification(title, {
            body,
            icon: "/favicon.ico",
          });
        } catch {
          // Notification constructor can fail in some environments
        }
      }
    },
    []
  );

  useEffect(() => {
    // Skip realtime in demo mode or if no user ID
    if (isDemoMode || !userId) {
      setIsConnected(false);
      return;
    }

    let isMounted = true;

    const setupSubscription = () => {
      try {
        const supabase = createClient();

        // Create a unique channel name per user
        const channelName = `user-alerts:${userId}`;

        const channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "UserAlert",
              filter: `userId=eq.${userId}`,
            },
            (payload) => {
              if (!isMounted) return;

              const newAlert = payload.new as {
                id: string;
                title: string;
                message: string;
                link?: string | null;
              };

              // Invalidate tRPC queries so UI updates immediately
              utils.alerts.getUnreadCount.invalidate();
              utils.alerts.getMyAlerts.invalidate();

              // Show sonner toast
              toast.info(newAlert.title, {
                description: newAlert.message,
                action: newAlert.link
                  ? {
                      label: "Xem",
                      onClick: () => {
                        if (newAlert.link) {
                          window.location.href = newAlert.link;
                        }
                      },
                    }
                  : undefined,
              });

              // Show browser notification
              showBrowserNotification(
                newAlert.title,
                newAlert.message
              );
            }
          )
          .subscribe((status) => {
            if (!isMounted) return;

            if (status === "SUBSCRIBED") {
              setIsConnected(true);
            } else if (
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT"
            ) {
              setIsConnected(false);
              console.warn(
                `[useRealtimeAlerts] Channel ${channelName} status: ${status}`
              );
            } else if (status === "CLOSED") {
              setIsConnected(false);
            }
          });

        channelRef.current = channel;
      } catch (error) {
        console.error("[useRealtimeAlerts] Failed to setup subscription:", error);
        if (isMounted) {
          setIsConnected(false);
        }
      }
    };

    setupSubscription();

    // Cleanup on unmount or when userId changes
    return () => {
      isMounted = false;
      setIsConnected(false);

      if (channelRef.current) {
        const supabase = createClient();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, isDemoMode, utils, showBrowserNotification]);

  return { isConnected };
}
