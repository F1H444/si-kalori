
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    console.log("🚀 [API/Admin/Users] Fetching all data via Admin Client (Bypassing RLS)");

    // Optimize: Fetch minimal fields for heavy tables
    const [adminRes, userRes, premiumRes, foodLogRes] = await Promise.all([
      supabase.from("admins").select("user_id"),
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("premium_subscriptions").select("user_id, expired_at, status"),
      supabase.from("food_logs").select("user_id") // Fetch all logs but only user_id to count
    ]);

    if (userRes.error) throw userRes.error;

    // Aggregate scan counts in memory (efficient for thousands of records, scalable to tens/hundreds thousands)
    const scanCounts: Record<string, number> = {};
    (foodLogRes.data || []).forEach((log) => {
      if (log.user_id) {
        scanCounts[log.user_id] = (scanCounts[log.user_id] || 0) + 1;
      }
    });

    return NextResponse.json({
      admins: adminRes.data || [],
      users: userRes.data || [],
      premium: premiumRes.data || [],
      scanCounts: scanCounts, // Return the map of counts
      totalScans: foodLogRes.data?.length || 0
    });

  } catch (error: any) {
    console.error("💥 [API/Admin/Users] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
