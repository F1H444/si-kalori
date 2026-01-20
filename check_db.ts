import { createAdminClient } from "./src/lib/supabase-admin.ts";

async function checkSchema() {
  const supabase = createAdminClient();
  
  console.log("--- Checking Tables ---");
  
  const { data: users, error: uError } = await supabase.from('users').select('*').limit(1);
  console.log("Users Table sample:", users ? Object.keys(users[0] || {}) : "No data", uError?.message || "");

  const { data: trans, error: tError } = await supabase.from('transactions').select('*').limit(1);
  console.log("Transactions Table sample:", trans ? Object.keys(trans[0] || {}) : "No data", tError?.message || "");

  const { data: prem, error: pError } = await supabase.from('premium').select('*').limit(1);
  console.log("Premium Table sample:", prem ? Object.keys(prem[0] || {}) : "No data", pError?.message || "");
}

checkSchema();
