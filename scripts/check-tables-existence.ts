
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // transactions
  console.log("Checking transactions table...");
  const { data: tx, error: txError } = await supabase.from("transactions").select().limit(0);
  if (txError) console.error("Transactions Error:", txError);
  else console.log("Transactions table exists.");

  // premium_subscriptions
  console.log("\nChecking premium_subscriptions table...");
  const { data: prem, error: premError } = await supabase.from("premium_subscriptions").select().limit(0);
  if (premError) console.error("Premium Error:", premError);
  else console.log("Premium subscriptions table exists.");
}

checkSchema();
