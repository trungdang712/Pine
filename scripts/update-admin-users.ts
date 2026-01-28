/**
 * Script to update existing users to universal admin
 * Run with: npx tsx scripts/update-admin-users.ts
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

async function updateAdminUsers() {
  console.log("Updating users to universal admin...\n");

  for (const email of adminEmails) {
    try {
      // Update user profile to admin team
      const { data, error } = await supabase
        .from("users")
        .update({
          team: "admin",
          role: "super_admin",
        })
        .eq("email", email)
        .select();

      if (error) {
        console.error(`Error updating ${email}:`, error);
      } else if (data && data.length > 0) {
        console.log(`Updated ${email} to admin team`);
        console.log(`  Team: ${data[0].team}, Role: ${data[0].role}`);
      } else {
        console.log(`No user found with email ${email}`);
      }
    } catch (error) {
      console.error(`Error processing ${email}:`, error);
    }
  }

  console.log("\n=== Update complete ===");
}

updateAdminUsers().catch(console.error);
