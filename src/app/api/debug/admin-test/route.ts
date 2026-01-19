import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Test Admin Client Connection
    console.log("[DEBUG ADMIN] Testing connection...");
    
    // 2. Try to fetch a user (any user) to verify permission to read users
    const { data: users, error: readError } = await supabase.from('users').select('id').limit(1);
    
    if (readError) {
        console.error("[DEBUG ADMIN] Read Error:", readError);
        return NextResponse.json({ success: false, step: 'read', error: readError }, { status: 500 });
    }
    console.log("[DEBUG ADMIN] Read Success. Users found:", users?.length);

    // 3. Try to Insert/Update dummy premium record to test Write Permission
    // We use a fake UUID for testing, or better, you can modify it to use your real user ID if known.
    // DANGER: We are writing to the DB. We will use a random UUID and immediate delete if possible, 
    // or just checking if it fails on RLS. 
    // Ideally, we just check if we CAN write.
    
    // Let's just return the config verification (without exposing keys)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isServiceKeyPresent = !!serviceRoleKey;
    const isServiceKeyLong = serviceRoleKey && serviceRoleKey.length > 20;

    return NextResponse.json({ 
        success: true, 
        message: "Admin Client Initialized",
        checks: {
            service_key_present: isServiceKeyPresent,
            service_key_valid_length: isServiceKeyLong,
            read_test: "success",
            user_count_sample: users?.length
        }
    });

  } catch (error: any) {
    console.error("[DEBUG ADMIN] Exception:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
