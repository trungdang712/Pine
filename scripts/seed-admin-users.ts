/**
 * Script to create universal admin users in Supabase
 * Run with: npx tsx scripts/seed-admin-users.ts
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

const adminUsers = [
  {
    email: "trung@nhakhoagreenfield.com",
    password: "Greenfield@2026",
    name: "Trung Dang",
    team: "admin",
    role: "super_admin",
  },
  {
    email: "nhung@nhakhoagreenfield.com",
    password: "Greenfield@2026",
    name: "Nhung Nguyen",
    team: "admin",
    role: "super_admin",
  },
];

async function seedAdminUsers() {
  console.log("Creating universal admin users...\n");

  for (const user of adminUsers) {
    try {
      // Check if auth user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingAuth = existingUsers?.users.find(
        (u) => u.email === user.email
      );

      let authId: string;

      if (existingAuth) {
        console.log(`Auth user ${user.email} already exists`);
        authId = existingAuth.id;
      } else {
        // Create auth user
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
          });

        if (authError) {
          throw authError;
        }

        console.log(`Created auth user: ${user.email}`);
        authId = authData.user.id;
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .single();

      if (existingProfile) {
        // Update to admin team
        const { error: updateError } = await supabase
          .from("users")
          .update({
            team: user.team,
            role: user.role,
            name: user.name
          })
          .eq("auth_id", authId);

        if (updateError) {
          console.error(`Error updating ${user.email}:`, updateError);
        } else {
          console.log(`Updated ${user.email} to admin team`);
        }
      } else {
        // Create profile
        const { error: profileError } = await supabase.from("users").insert({
          auth_id: authId,
          email: user.email,
          name: user.name,
          team: user.team,
          role: user.role,
        });

        if (profileError) {
          console.error(`Error creating profile for ${user.email}:`, profileError);
        } else {
          console.log(`Created profile for ${user.email}`);
        }
      }

      // Create user points if not exists
      const { data: userRecord } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", authId)
        .single();

      if (userRecord) {
        const { data: existingPoints } = await supabase
          .from("user_points")
          .select("id")
          .eq("user_id", userRecord.id)
          .single();

        if (!existingPoints) {
          await supabase.from("user_points").insert({
            user_id: userRecord.id,
            total_points: 0,
            available_points: 0,
            level: 1,
          });
          console.log(`Created user points for ${user.email}`);
        }
      }

      console.log(`Successfully processed ${user.email}\n`);
    } catch (error) {
      console.error(`Error processing ${user.email}:`, error);
    }
  }

  console.log("\n=== Admin users created ===");
  console.log("\nUniversal Admin Accounts (access all apps):");
  adminUsers.forEach((u) => {
    console.log(`  ${u.email} / ${u.password}`);
  });
}

seedAdminUsers().catch(console.error);
