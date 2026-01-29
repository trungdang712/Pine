"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  team: string;
  role: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
}

const DEMO_PROFILE: UserProfile = {
  id: "demo-user",
  email: "demo@greenfield.clinic",
  name: "Demo User",
  avatar: null,
  team: "marketing",
  role: "marketing_manager",
};

// Helper for timeout
function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number): Promise<T | null> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
  ]);
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isDemoMode: false,
  });

  useEffect(() => {
    // Check for demo mode first
    const isDemoMode = typeof window !== "undefined" && localStorage.getItem("demo_mode") === "true";

    if (isDemoMode) {
      setState({
        user: { id: "demo-user" } as User,
        profile: DEMO_PROFILE,
        loading: false,
        isDemoMode: true,
      });
      return;
    }

    const supabase = createClient();
    let isMounted = true;

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        // Add 5 second timeout to prevent infinite loading
        const result = await withTimeout(supabase.auth.getUser(), 5000);

        if (!isMounted) return;

        if (!result) {
          setState({ user: null, profile: null, loading: false, isDemoMode: false });
          return;
        }

        const { data: { user }, error: authError } = result;

        if (authError) {
          setState({ user: null, profile: null, loading: false, isDemoMode: false });
          return;
        }

        if (user) {
          // Also add timeout for profile fetch
          const profileResult = await withTimeout(
            supabase
              .from("User")
              .select("id, email, name, avatar, team, role")
              .eq("authId", user.id)
              .single(),
            3000
          );

          if (!isMounted) return;

          const profile = profileResult?.data ?? null;

          setState({
            user,
            profile: profile as UserProfile | null,
            loading: false,
            isDemoMode: false,
          });
        } else {
          setState({ user: null, profile: null, loading: false, isDemoMode: false });
        }
      } catch (error) {
        if (isMounted) {
          setState({ user: null, profile: null, loading: false, isDemoMode: false });
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          const profileResult = await withTimeout(
            supabase
              .from("User")
              .select("id, email, name, avatar, team, role")
              .eq("authId", session.user.id)
              .single(),
            3000
          );

          if (!isMounted) return;

          setState({
            user: session.user,
            profile: (profileResult?.data as UserProfile | null) ?? null,
            loading: false,
            isDemoMode: false,
          });
        } else {
          setState({ user: null, profile: null, loading: false, isDemoMode: false });
        }
      }
    );

    // Cleanup
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    // Clear demo mode
    if (typeof window !== "undefined") {
      localStorage.removeItem("demo_mode");
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return {
    ...state,
    signOut,
    isAuthenticated: !!state.user || state.isDemoMode,
  };
}
