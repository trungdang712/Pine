/**
 * Setup all users in Supabase with team separation
 * Run with: npx tsx scripts/setup-all-users.ts
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
  allowedApps: string[]; // 'crm', 'quotation', 'marketing'
}

const allUsers: UserToCreate[] = [
  // === SUPER ADMINS (access to all systems) ===
  {
    email: "nhung@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Tạ Thị Hồng Nhung",
    role: "super_admin",
    team: "admin",
    allowedApps: ["crm", "quotation", "marketing"],
  },
  {
    email: "trung@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Đặng Đức Trung",
    role: "super_admin",
    team: "admin",
    allowedApps: ["crm", "quotation", "marketing"],
  },

  // === BUSINESS DEVELOPMENT (access to both marketing and sales) ===
  {
    email: "anass.l@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Anass Lamyasser",
    role: "sales_manager",
    team: "sales",
    allowedApps: ["crm", "quotation", "marketing"],
  },

  // === SALES TEAM (CRM & Quotation only) ===
  {
    email: "phuc.hh@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Hoàng Hồng Phúc",
    role: "sales_consultant",
    team: "sales",
    allowedApps: ["crm", "quotation"],
  },
  {
    email: "ninh.ttp@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Trần Phương Ninh (Sam)",
    role: "sales_consultant",
    team: "sales",
    allowedApps: ["crm", "quotation"],
  },
  {
    email: "hien.htp@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Hồ Thị Phương Hiền (Jenny)",
    role: "sales_consultant",
    team: "sales",
    allowedApps: ["crm", "quotation"],
  },
  {
    email: "anh.nl@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Nguyễn Lan Anh (Rachel)",
    role: "sales_consultant",
    team: "sales",
    allowedApps: ["crm", "quotation"],
  },
  {
    email: "ngoc.ch@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Chu Hải Ngọc",
    role: "sales_consultant",
    team: "sales",
    allowedApps: ["crm", "quotation"],
  },
  {
    email: "khanh.dh@nhakhoagreenfield.com",
    password: "95@Trunghoa",
    name: "Đỗ Hà Khanh",
    role: "sales_consultant",
    team: "sales",
    allowedApps: ["crm", "quotation"],
  },

  // === MARKETING TEAM (Marketing Command Center only) ===
  {
    email: "ducanh.nh@nhakhoagreenfield.com",
    password: "Greenfield@2024",
    name: "Nguyễn Hồng Đức Anh",
    role: "digital_marketing",
    team: "marketing",
    allowedApps: ["marketing"],
  },
  {
    email: "hoai.tt@nhakhoagreenfield.com",
    password: "Greenfield@2024",
    name: "Trịnh Thu Hoài",
    role: "marketing_manager",
    team: "marketing",
    allowedApps: ["marketing"],
  },
  {
    email: "hoai.ptt@nhakhoagreenfield.com",
    password: "Greenfield@2024",
    name: "Phạm Thị Thu Hoài",
    role: "graphic_designer",
    team: "marketing",
    allowedApps: ["marketing"],
  },
  {
    email: "tien.n@nhakhoagreenfield.com",
    password: "Greenfield@2024",
    name: "Nguyễn Đình Tiến",
    role: "video_producer",
    team: "marketing",
    allowedApps: ["marketing"],
  },
];

async function clearAllUsers() {
  console.log("Clearing all existing users...\n");

  // Get all auth users
  const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  // Delete each auth user
  for (const user of authUsers.users) {
    console.log(`  Deleting: ${user.email}`);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`  Error deleting ${user.email}:`, error.message);
    }
  }

  // Clear the users table
  const { error: deleteError } = await supabase
    .from("users")
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    console.error("Error clearing users table:", deleteError.message);
  }

  // Clear user_team_access table if it exists
  const { error: accessError } = await supabase
    .from("user_team_access")
    .delete()
    .not("id", "is", null);

  if (accessError && !accessError.message.includes("does not exist")) {
    console.error("Error clearing user_team_access:", accessError.message);
  }

  console.log("\nAll users cleared.\n");
}

async function createUsers() {
  console.log("Creating users...\n");

  for (const user of allUsers) {
    console.log(`Creating: ${user.email} (${user.team} - ${user.role})`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
    });

    if (authError) {
      console.error(`  Error creating auth: ${authError.message}`);
      continue;
    }

    if (!authData.user) {
      console.error(`  No user returned`);
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
      console.error(`  Error creating profile: ${dbError.message}`);
      continue;
    }

    // Add team access records for users with multiple app access
    // Only add valid teams: 'marketing', 'sales', 'medical', 'admin'
    const validTeams = ['marketing', 'sales', 'medical', 'admin'];
    for (const app of user.allowedApps) {
      if (validTeams.includes(app) && app !== user.team) {
        // Get the user's database ID first
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .eq("auth_id", authData.user.id)
          .single();

        if (dbUser) {
          const { error: accessError } = await supabase.from("user_team_access").insert({
            user_id: dbUser.id,
            team: app,
            created_at: new Date().toISOString(),
          });

          if (accessError) {
            console.error(`  Error adding ${app} access: ${accessError.message}`);
          } else {
            console.log(`  + Added ${app} team access`);
          }
        }
      }
    }

    console.log(`  ✓ Created successfully`);
  }
}

function printSummary() {
  console.log("\n" + "=".repeat(70));
  console.log("USER SETUP COMPLETE");
  console.log("=".repeat(70));

  console.log("\n👑 SUPER ADMINS (Access to ALL systems):");
  console.log("-".repeat(50));
  allUsers
    .filter((u) => u.team === "admin")
    .forEach((u) => {
      console.log(`  ${u.email}`);
      console.log(`    Name: ${u.name}`);
      console.log(`    Password: ${u.password}`);
    });

  console.log("\n🌐 BUSINESS DEVELOPMENT (Sales + Marketing access):");
  console.log("-".repeat(50));
  allUsers
    .filter((u) => u.allowedApps.includes("marketing") && u.allowedApps.includes("crm") && u.team !== "admin")
    .forEach((u) => {
      console.log(`  ${u.email}`);
      console.log(`    Name: ${u.name}`);
      console.log(`    Password: ${u.password}`);
    });

  console.log("\n💼 SALES TEAM (CRM & Quotation only):");
  console.log("-".repeat(50));
  allUsers
    .filter((u) => u.team === "sales" && !u.allowedApps.includes("marketing"))
    .forEach((u) => {
      console.log(`  ${u.email}`);
      console.log(`    Name: ${u.name}`);
    });
  console.log(`  Password for all: 95@Trunghoa`);

  console.log("\n🎨 MARKETING TEAM (Marketing Command Center only):");
  console.log("-".repeat(50));
  allUsers
    .filter((u) => u.team === "marketing")
    .forEach((u) => {
      console.log(`  ${u.email} (${u.role})`);
      console.log(`    Name: ${u.name}`);
    });
  console.log(`  Password for all: Greenfield@2024`);

  console.log("\n🔒 ACCESS CONTROL:");
  console.log("-".repeat(50));
  console.log("  • Sales team CANNOT access Marketing Command Center");
  console.log("  • Marketing team CANNOT access CRM or Quotation Tool");
  console.log("  • Super Admins can access ALL systems");
  console.log("");
}

async function main() {
  console.log("=".repeat(70));
  console.log("GREENFIELD DENTAL - USER SETUP");
  console.log("=".repeat(70) + "\n");

  await clearAllUsers();
  await createUsers();
  printSummary();
}

main().catch(console.error);
