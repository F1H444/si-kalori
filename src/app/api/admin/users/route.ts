
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    console.log("🚀 [API/Admin/Users] Fetching all data via Admin Client (Bypassing RLS)");

    const [adminRes, userRes, premiumRes, countRes] = await Promise.all([
      supabase.from("admins").select("user_id"),
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("premium_subscriptions").select("user_id, expired_at, status"),
      supabase.from("food_logs").select("*", { count: "exact", head: true })
    ]);

    if (userRes.error) throw userRes.error;

    return NextResponse.json({
      admins: adminRes.data || [],
      users: userRes.data || [],
      premium: premiumRes.data || [],
      totalScans: countRes.count || 0
    });

  } catch (error: any) {
    console.error("💥 [API/Admin/Users] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
