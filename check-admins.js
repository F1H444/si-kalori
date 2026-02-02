const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking 'admins' table...");
  const { data: admins, error: adminErr } = await supabase.from('admins').select('*');
  if (adminErr) {
    console.error("Error fetching admins:", adminErr);
  } else {
    console.log("Admins:", JSON.stringify(admins, null, 2));
  }

  console.log("\nChecking 'users' table...");
  const { data: usersTable, error: usersErr } = await supabase.from('users').select('id, full_name, email');
  if (usersErr) {
    console.error("Error fetching users:", usersErr);
  } else {
    console.log("Users:", JSON.stringify(usersTable, null, 2));
  }

  console.log("\nChecking 'auth.users' for admin@sikalori.com...");
  // Note: auth schema is not accessible via standard from(), but we can use supabase.auth.admin
  const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) {
    console.error("Error listing users:", userErr);
  } else {
    const adminUser = users.users.find(u => u.email === 'admin@sikalori.com');
    if (adminUser) {
      console.log("Found admin@sikalori.com in Auth:", adminUser.id);
    } else {
      console.log("admin@sikalori.com NOT FOUND in Auth");
      console.log("Existing users emails:", users.users.map(u => u.email).join(', '));
    }
  }
}

check();
