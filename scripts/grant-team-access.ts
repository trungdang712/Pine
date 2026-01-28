/**
 * Script to grant universal admins access to all teams
 * Run with: npx tsx scripts/grant-team-access.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const adminEmails = [
  "trung@nhakhoagreenfield.com",
  "nhung@nhakhoagreenfield.com",
];

const teams = ["marketing", "sales", "medical"];

async function grantTeamAccess() {
  console.log("Granting team access to universal admins...\n");

  for (const email of adminEmails) {
    try {
      // Get user ID
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name, team, role")
        .eq("email", email)
        .single();

      if (userError || !user) {
        console.error(`User not found: ${email}`);
        continue;
      }

      console.log(`Processing ${user.name} (${email})`);
      console.log(`  Primary team: ${user.team}, Role: ${user.role}`);

      // Grant access to all teams
      for (const team of teams) {
        const { error } = await supabase
          .from("user_team_access")
          .upsert({
            user_id: user.id,
            team: team,
            access_level: "manager",
          }, {
            onConflict: "user_id,team"
          });

        if (error) {
          console.error(`  Error granting ${team} access:`, error.message);
        } else {
          console.log(`  Granted ${team} team access (manager level)`);
        }
      }

      console.log("");
    } catch (error) {
      console.error(`Error processing ${email}:`, error);
    }
  }

  console.log("=== Team access granted ===");
}

grantTeamAccess().catch(console.error);
