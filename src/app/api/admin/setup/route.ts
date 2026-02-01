import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const password = "admin123"; // Default password
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Create admin_config table if it doesn't exist (via a hacky way since we can't run raw SQL)
    // Actually, we'll just try to upsert and see what happens.
    // If it fails with 'table not found', we'll know.
    
    console.log("[ADMIN-SETUP] Attempting to set admin password...");

    const { error } = await supabase
      .from("admin_config")
      .upsert({
        id: "admin_password",
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ 
          error: "Table 'admin_config' not found.",
          instruction: "Please run this SQL in your Supabase SQL Editor first:\n\nCREATE TABLE admin_config (\n  id TEXT PRIMARY KEY,\n  password_hash TEXT NOT NULL,\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);"
        }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Admin password has been set to 'admin123'. Please delete this API route after use.",
      hash: passwordHash
    });

  } catch (err: any) {
    console.error("[ADMIN-SETUP] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
