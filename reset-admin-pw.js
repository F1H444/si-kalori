const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdminPassword() {
  const email = "admin@sikalori.com";
  
  // 1. Get from Auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log("admin@sikalori.com not found in Auth.");
    return;
  }

  console.log("Resetting password for admin@sikalori.com to 'admin123'...");
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: 'admin123' }
  );

  if (error) {
    console.error("Error resetting password:", error);
  } else {
    console.log("Successfully reset password.");
  }
}

resetAdminPassword();
