
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId) {
      console.error("❌ [API/Admin/Verify] Missing userId");
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    console.log("🔍 [API/Admin/Verify] Checking admin status for userId:", userId, "email:", email);

    const supabase = createAdminClient();

    const userEmail = email?.toLowerCase();

    // Check 1: Email-based admin (admin@sikalori.com) - FASTEST
    if (userEmail === "admin@sikalori.com") {
      console.log("✅ [API/Admin/Verify] Admin by email match: admin@sikalori.com");
      
      // AUTO-SAVE: Ensure this super admin exists in the 'admins' table
      // Refactored: We now use 'id' as the FK to auth.users, 'user_id' column is removed.
      const { error: upsertError } = await supabase
        .from("admins")
        .upsert(
          { 
            id: userId,          // 'id' now stores the User UUID directly 
            role: "super_admin" 
          }, 
          { onConflict: "id" }   // Conflict on PK 'id'
        );

      if (upsertError) {
        console.error("⚠️ [API/Admin/Verify] Failed to auto-save super admin to DB:", upsertError);
      } else {
        console.log("💾 [API/Admin/Verify] Super admin auto-saved to database.");
      }

      return NextResponse.json({ isAdmin: true, role: "super_admin", method: "email_autosave" });
    }

    // Check 2: Database lookup
    const { data: adminRecord, error } = await supabase
      .from("admins")
      .select("role")
      .eq("id", userId) // Lookup by 'id'
      .maybeSingle();

    if (error) {
      console.error("⚠️ [API/Admin/Verify] Database error:", error);
    }

    if (adminRecord) {
      console.log("✅ [API/Admin/Verify] Admin by database, role:", adminRecord.role);
      return NextResponse.json({ isAdmin: true, role: adminRecord.role, method: "database" });
    }

    // Not an admin
    console.log("❌ [API/Admin/Verify] Not an admin");
    return NextResponse.json({ isAdmin: false, reason: "Not in admin list" }, { status: 200 });

  } catch (err) {
    console.error("💥 [API/Admin/Verify] Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: String(err) }, { status: 500 });
  }
}
