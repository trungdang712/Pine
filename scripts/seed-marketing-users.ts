/**
 * Script to create marketing team users in Supabase
 * Run with: npx tsx scripts/seed-marketing-users.ts
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

const marketingUsers = [
  {
    email: "admin@greenfield.clinic",
    password: "Admin@123",
    name: "Admin Greenfield",
    team: "admin",
    role: "super_admin",
  },
  {
    email: "manager@greenfield.clinic",
    password: "Manager@123",
    name: "Marketing Manager",
    team: "marketing",
    role: "marketing_manager",
  },
  {
    email: "content@greenfield.clinic",
    password: "Content@123",
    name: "Content Creator",
    team: "marketing",
    role: "content_creator",
  },
  {
    email: "designer@greenfield.clinic",
    password: "Designer@123",
    name: "Graphic Designer",
    team: "marketing",
    role: "graphic_designer",
  },
  {
    email: "digital@greenfield.clinic",
    password: "Digital@123",
    name: "Digital Marketing",
    team: "marketing",
    role: "digital_marketing",
  },
  {
    email: "video@greenfield.clinic",
    password: "Video@123",
    name: "Video Producer",
    team: "marketing",
    role: "video_producer",
  },
];

async function seedUsers() {
  console.log("Starting to seed marketing users...\n");

  for (const user of marketingUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

      if (authError) {
        if (authError.message.includes("already been registered")) {
          console.log(`User ${user.email} already exists in Auth, skipping...`);

          // Get existing auth user
          const { data: existingUsers } =
            await supabase.auth.admin.listUsers();
          const existingAuth = existingUsers?.users.find(
            (u) => u.email === user.email
          );

          if (existingAuth) {
            // Check if user profile exists
            const { data: existingProfile } = await supabase
              .from("users")
              .select("*")
              .eq("auth_id", existingAuth.id)
              .single();

            if (!existingProfile) {
              // Create profile
              const { error: profileError } = await supabase
                .from("users")
                .insert({
                  auth_id: existingAuth.id,
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
            } else {
              // Update profile with team
              const { error: updateError } = await supabase
                .from("users")
                .update({ team: user.team, role: user.role })
                .eq("auth_id", existingAuth.id);

              if (updateError) {
                console.error(`Error updating ${user.email}:`, updateError);
              } else {
                console.log(`Updated ${user.email} with team: ${user.team}`);
              }
            }
          }
          continue;
        }
        throw authError;
      }

      console.log(`Created auth user: ${user.email}`);

      // Create user profile in users table
      const { error: profileError } = await supabase.from("users").insert({
        auth_id: authData.user.id,
        email: user.email,
        name: user.name,
        team: user.team,
        role: user.role,
      });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
      } else {
        console.log(`Created profile for ${user.email} (${user.team} team)`);
      }

      // Create initial user points
      const { data: userRecord } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", authData.user.id)
        .single();

      if (userRecord) {
        await supabase.from("user_points").insert({
          user_id: userRecord.id,
          total_points: 0,
          available_points: 0,
          level: 1,
        });
        console.log(`Created user points for ${user.email}`);
      }

      console.log(`Successfully created ${user.email}\n`);
    } catch (error) {
      console.error(`Error processing ${user.email}:`, error);
    }
  }

  console.log("\n=== Seeding complete ===");
  console.log("\nMarketing team users:");
  marketingUsers.forEach((u) => {
    console.log(`  ${u.email} / ${u.password} (${u.team} - ${u.role})`);
  });
}

seedUsers().catch(console.error);
