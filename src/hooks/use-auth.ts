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

    // Get initial session
    const getInitialSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id, email, name, avatar, team, role")
          .eq("auth_id", user.id)
          .single();

        setState({
          user,
          profile: profile as UserProfile | null,
          loading: false,
          isDemoMode: false,
        });
      } else {
        setState({ user: null, profile: null, loading: false, isDemoMode: false });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("id, email, name, avatar, team, role")
            .eq("auth_id", session.user.id)
            .single();

          setState({
            user: session.user,
            profile: profile as UserProfile | null,
            loading: false,
            isDemoMode: false,
          });
        } else {
          setState({ user: null, profile: null, loading: false, isDemoMode: false });
        }
      }
    );

    return () => {
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
