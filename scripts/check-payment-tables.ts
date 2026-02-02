
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("Checking transactions table...");
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .limit(1);
  
  if (txError) {
    console.error("Error fetching transactions:", txError.message);
  } else {
    console.log("Transactions table exists. Columns:", Object.keys(transactions[0] || {}));
  }

  console.log("\nChecking premium_subscriptions table...");
  const { data: premium, error: premError } = await supabase
    .from("premium_subscriptions")
    .select("*")
    .limit(1);

  if (premError) {
    console.error("Error fetching premium_subscriptions:", premError.message);
  } else {
    console.log("Premium subscriptions table exists. Columns:", Object.keys(premium[0] || {}));
  }
}

checkTables();
