import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || "Admin User" }
    });

    if (authError) throw authError;

    const user = authData.user;

    // 2. Add to users table (if not handled by trigger)
    const { error: userTableError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName || "Admin User",
        is_premium: true, // Admins are premium by default
      });

    if (userTableError) console.warn("User table update warning:", userTableError.message);

    // 3. Add to admins table
    const { error: adminError } = await supabase
      .from("admins")
      .insert({
        user_id: user.id,
        role: "superadmin"
      });

    if (adminError) throw adminError;

    return NextResponse.json({ 
      success: true, 
      message: `Admin account created for ${email}.`,
      userId: user.id
    });

  } catch (err: any) {
    console.error("[ADMIN-CREATE] Error:", err);
    return NextResponse.json({ 
      error: "Gagal membuat akun admin", 
      details: err.message || "Unknown error",
      code: err.code 
    }, { status: 500 });
  }
}
