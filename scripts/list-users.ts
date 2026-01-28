/**
 * List all users in Supabase
 * Run with: npx tsx scripts/list-users.ts
 */

import { config } from "dotenv";
config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function listUsers() {
  console.log("=== Supabase Users ===\n");

  // Get all auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("Error listing auth users:", authError);
    return;
  }

  console.log(`Total Auth Users: ${authUsers.users.length}\n`);

  // Get users table data
  const { data: dbUsers, error: dbError } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError) {
    console.error("Error fetching users table:", dbError);
  }

  console.log("Auth Users:");
  console.log("-".repeat(80));

  for (const user of authUsers.users) {
    const dbUser = dbUsers?.find((u: any) => u.auth_id === user.id);
    console.log(`Email: ${user.email}`);
    console.log(`  Auth ID: ${user.id}`);
    console.log(`  Created: ${user.created_at}`);
    if (dbUser) {
      console.log(`  Name: ${dbUser.name}`);
      console.log(`  Role: ${dbUser.role}`);
      console.log(`  Team: ${dbUser.team}`);
    } else {
      console.log(`  (No profile in users table)`);
    }
    console.log("");
  }

  // Check for orphaned records
  if (dbUsers) {
    const orphanedProfiles = dbUsers.filter(
      (u: any) => !authUsers.users.find((au) => au.id === u.auth_id)
    );
    if (orphanedProfiles.length > 0) {
      console.log("\nOrphaned profiles (no matching auth user):");
      orphanedProfiles.forEach((u: any) => {
        console.log(`  - ${u.email} (${u.name})`);
      });
    }
  }
}

listUsers().catch(console.error);
