/**
 * Check database constraints
 */

import { config } from "dotenv";
config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraints() {
  // Get existing users to see what roles/teams are used
  const { data: users, error } = await supabase
    .from("users")
    .select("role, team")
    .limit(20);

  console.log("Existing users roles/teams:", users);

  // Try to get constraint info via raw query (may not work)
  const { data, error: err2 } = await supabase.rpc("get_check_constraints", {});
  console.log("Constraints:", data, err2);
}

checkConstraints();
