"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message === "Invalid login credentials"
          ? "Invalid email or password"
          : authError.message);
        return;
      }

      if (data.user) {
        // Check if user has marketing team access
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('team, role, name')
          .eq('auth_id', data.user.id)
          .single();

        if (userError || !userData) {
          setError("User profile not found. Please contact administrator.");
          await supabase.auth.signOut();
          return;
        }

        // Check team access
        if (userData.team !== 'admin' && userData.team !== 'marketing') {
          // Check additional team access
          const { data: teamAccess } = await supabase
            .from('user_team_access')
            .select('team')
            .eq('user_id', data.user.id)
            .eq('team', 'marketing')
            .single();

          if (!teamAccess) {
            setError("You don't have access to the Marketing Command Center.");
            await supabase.auth.signOut();
            return;
          }
        }

        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-2xl font-bold text-primary-foreground">GF</span>
          </div>
          <CardTitle className="text-2xl">Greenfield Dental</CardTitle>
          <CardDescription>
            Marketing Command Center
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@greenfield.clinic"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                // Set demo mode in localStorage and redirect
                localStorage.setItem("demo_mode", "true");
                router.push("/");
                router.refresh();
              }}
            >
              Continue in Demo Mode
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
