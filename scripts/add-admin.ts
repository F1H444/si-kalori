import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function addAdmin() {
  console.log("🔧 Admin Setup Script");
  console.log("===================\n");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing Supabase credentials in .env.local");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get email from command line argument or use default
  const email = process.argv[2] || "admin@sikalori.com";

  console.log(`📧 Looking for user with email: ${email}\n`);

  // 1. Find user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Error fetching users:", listError);
    return;
  }

  const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error(`❌ User not found with email: ${email}`);
    console.log("\n💡 Tip: Register this email first at /register, then run this script again.");
    return;
  }

  console.log(`✅ User found!`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Created: ${user.created_at}\n`);

  // 2. Check if already admin
  const { data: existingAdmin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingAdmin) {
    console.log("⚠️  User is already an admin!");
    console.log(`   Role: ${existingAdmin.role}`);
    console.log(`   Created: ${existingAdmin.created_at}`);
    return;
  }

  // 3. Add to admins table
  console.log("➕ Adding user to admins table...");

  const { data: newAdmin, error: insertError } = await supabase
    .from("admins")
    .insert({
      user_id: user.id,
      role: "super_admin",
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("❌ Error adding admin:", insertError);
    return;
  }

  console.log("\n✅ SUCCESS! User is now an admin!");
  console.log(`   User ID: ${newAdmin.user_id}`);
  console.log(`   Role: ${newAdmin.role}`);
  console.log(`   Created: ${newAdmin.created_at}`);
  console.log("\n🎉 You can now login to /admin with this account!");
}

addAdmin().catch(console.error);
