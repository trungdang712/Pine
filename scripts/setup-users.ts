/**
 * Setup users in Supabase
 * Run with: npx tsx scripts/setup-users.ts
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

interface UserToCreate {
  email: string;
  password: string;
  name: string;
  role: string;
  team: string;
}

const usersToCreate: UserToCreate[] = [
  {
    email: "ducanh.nh@nhakhoagreenfield.com",
    password: "Greenfield@2024",
    name: "Nguyen Hoang Duc Anh",
    role: "digital_marketing",
    team: "marketing",
  },
  {
    email: "hoai.tt@nhakhoagreenfield.com",
    password: "Greenfield@2024",
    name: "Tran Thi Hoai",
    role: "marketing_manager",
    team: "marketing",
  },
  {
    email: "hoai.ptt@nhakhoagreenfield.com",
    password: "Greenfield@2024",
    name: "Phan Thi Thu Hoai",
    role: "graphic_designer",
    team: "marketing",
  },
  {
    email: "tien.n@nhakhoagreenfield.com",
    password: "Greenfield@2024",
    name: "Nguyen Tien",
    role: "video_producer",
    team: "marketing",
  },
];

async function clearExistingUsers() {
  console.log("Clearing existing users...");

  // Get all users from auth
  const { data: authUsers, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  // Delete each auth user
  for (const user of authUsers.users) {
    console.log(`Deleting auth user: ${user.email}`);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`Error deleting user ${user.email}:`, error);
    }
  }

  // Clear the users table
  const { error: deleteError } = await supabase.from("users").delete().neq("id", "");
  if (deleteError) {
    console.error("Error clearing users table:", deleteError);
  }

  console.log("Existing users cleared.");
}

async function createUsers() {
  console.log("\nCreating new users...\n");

  for (const user of usersToCreate) {
    console.log(`Creating user: ${user.email} (${user.role})`);

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

    if (authError) {
      console.error(`Error creating auth user ${user.email}:`, authError);
      continue;
    }

    if (!authData.user) {
      console.error(`No user returned for ${user.email}`);
      continue;
    }

    // Create user record in users table
    const { error: dbError } = await supabase.from("users").insert({
      auth_id: authData.user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.team,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error(`Error creating user record for ${user.email}:`, dbError);
      continue;
    }

    console.log(`  Created: ${user.name} - ${user.role}`);
  }

  console.log("\nAll users created successfully!");
  console.log("\nLogin credentials:");
  console.log("Password for all users: Greenfield@2024");
  console.log("\nUsers:");
  usersToCreate.forEach((u) => {
    console.log(`  - ${u.email} (${u.role})`);
  });
}

async function main() {
  console.log("=== Greenfield Dental User Setup ===\n");

  await clearExistingUsers();
  await createUsers();
}

main().catch(console.error);
