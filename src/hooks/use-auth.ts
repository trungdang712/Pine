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
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
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
        });
      } else {
        setState({ user: null, profile: null, loading: false });
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
          });
        } else {
          setState({ user: null, profile: null, loading: false });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return {
    ...state,
    signOut,
    isAuthenticated: !!state.user,
  };
}
