const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdminAccount() {
  const email = "admin@sikalori.com";
  
  // 1. Get from Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log("admin@sikalori.com not found in Auth. Creating...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: 'admin123',
      email_confirm: true
    });
    if (createError) {
      console.error("Error creating auth user:", createError);
      return;
    }
    console.log("Created auth user:", newUser.user.id);
    var userId = newUser.user.id;
  } else {
    var userId = user.id;
  }

  // 2. Add to users table
  console.log("Adding to users table...");
  const { error: userError } = await supabase.from('users').upsert({
    id: userId,
    email: email,
    full_name: 'Super Admin',
    has_completed_onboarding: true
  });

  if (userError) {
    console.error("Error adding to users table:", userError);
  } else {
    console.log("Successfully added to users table.");
  }

  // 3. Add to admins table
  console.log("Adding to admins table...");
  const { error: adminError } = await supabase.from('admins').upsert({
    user_id: userId,
    role: 'super_admin'
  });

  if (adminError) {
    console.error("Error adding to admins table:", adminError);
  } else {
    console.log("Successfully added to admins table.");
  }
}

fixAdminAccount();
