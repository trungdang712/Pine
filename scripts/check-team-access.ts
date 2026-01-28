import { config } from "dotenv";
config();
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from("user_team_access")
    .select("*, users(email, name, team)")
    .order("created_at");
  
  if (error) {
    console.error("Error:", error.message);
    return;
  }
  
  console.log("Team Access Records:");
  if (data.length === 0) {
    console.log("  (no records)");
  } else {
    data.forEach((r: any) => {
      console.log(`  ${r.users?.email} -> ${r.team} access`);
    });
  }
}

check();
