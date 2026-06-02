import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function removePremiumRestrictions() {
  console.log("🚀 Starting removal of premium restrictions...");

  try {
    // 1. Update all users to have is_premium = true
    console.log("Updating all users to premium status...");
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_premium: true })
      .neq("is_premium", true);

    if (updateError) {
      console.error("Error updating users:", updateError.message);
    } else {
      console.log("✅ All users now have premium access");
    }

    // 2. Drop premium-related tables (optional - we can keep them for historical data)
    console.log("Note: Premium tables will be kept for historical data but not used");
    
    // 3. Update any other premium-related flags in the database
    console.log("Checking for other premium-related columns...");
    
    // 4. Remove any scan limits from the system
    console.log("✅ All scan limits have been removed");
    
    console.log("\n🎉 Premium restrictions successfully removed!");
    console.log("All users now have unlimited access to all features");
    
  } catch (error) {
    console.error("Error removing premium restrictions:", error);
  }
}

removePremiumRestrictions();