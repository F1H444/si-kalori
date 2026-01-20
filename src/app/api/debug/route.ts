import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = createAdminClient();
  
  const { data: latestTransactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: latestUsers } = await supabase
    .from("users")
    .select("id, full_name, email, is_premium")
    .limit(5);

  return NextResponse.json({
    latestTransactions,
    latestUsers
  });
}
