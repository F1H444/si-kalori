
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load env from .env.local
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Checking Admin Access...");

  // 1. List all users from Auth (limit 50)
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error listing users:", authError);
    return;
  }

  console.log(`Found ${users.length} users in Auth.`);

  // 2. List all admins
  const { data: admins, error: dbError } = await supabase.from("admins").select("*");
  if (dbError) {
    console.error("Error fetching admins table:", dbError);
    // If table doesn't exist, that's a huge issue
    return;
  }

  console.log(`Found ${admins?.length || 0} rows in 'admins' table.`);

  // 3. Check specific email 'admin@sikalori.com'
  const targetEmail = "admin@sikalori.com";
  const adminUser = users.find(u => u.email === targetEmail);

  if (adminUser) {
    console.log(`\nUser '${targetEmail}' exists in Auth. ID: ${adminUser.id}`);
    
    // Check if in admins table
    const isAdmin = admins?.find(a => a.user_id === adminUser.id);
    
    if (isAdmin) {
      console.log("✅ User is ALREADY in admins table.");
    } else {
      console.log("❌ User is NOT in admins table. Fixing...");
      const { error: insertError } = await supabase.from("admins").insert({
        user_id: adminUser.id,
        role: "super_admin"
      });
      
      if (insertError) {
        console.error("Failed to insert admin:", insertError);
      } else {
        console.log("✅ Successfully added to admins table!");
      }
    }
  } else {
    console.log(`\nUser '${targetEmail}' NOT found in Auth.`);
    console.log("Available Users:");
    users.forEach(u => console.log(`- ${u.email} (${u.id})`));
  }
}

main();
