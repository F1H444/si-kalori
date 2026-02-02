const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAdmins() {
  const usersToMakeAdmin = [
    { email: "admin@sikalori.com", role: "super_admin" },
    { email: "foszy112233@gmail.com", role: "admin" }
  ];

  for (const item of usersToMakeAdmin) {
    console.log(`Processing ${item.email}...`);
    
    // Get user from auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("Error listing users:", listError);
      continue;
    }

    const user = users.find(u => u.email === item.email);
    if (!user) {
      console.log(`User ${item.email} not found in Auth. Skipping.`);
      continue;
    }

    // Insert into admins table
    const { error: insertError } = await supabase
      .from("admins")
      .upsert({
        user_id: user.id,
        role: item.role
      }, { onConflict: "user_id" });

    if (insertError) {
      console.error(`Error adding ${item.email} to admins:`, insertError);
    } else {
      console.log(`Successfully added ${item.email} as ${item.role}.`);
    }
  }
}

seedAdmins();
