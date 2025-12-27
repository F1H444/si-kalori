import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Test endpoint to verify Supabase connection
 * GET /api/test-supabase
 */
export async function GET(req: NextRequest) {
  try {
    console.log("🧪 Testing Supabase connection...");
    
    // Test 1: Check if Supabase client is initialized
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: "Supabase client not initialized",
        hint: "Check if SUPABASE_SERVICE_ROLE_KEY is set in .env.local"
      }, { status: 500 });
    }
    
    console.log("✅ Supabase client initialized");
    
    // Test 2: Try to query user_profiles table
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("❌ Supabase query error:", error);
      return NextResponse.json({
        success: false,
        error: "Database query failed",
        details: error.message,
        hint: error.code === '42P01' 
          ? "Table 'user_profiles' does not exist. Run supabase-schema.sql in Supabase SQL Editor!"
          : "Check Supabase connection and credentials"
      }, { status: 500 });
    }
    
    console.log("✅ Successfully queried user_profiles table");
    console.log(`📊 Found ${data?.length || 0} profiles`);
    
    return NextResponse.json({
      success: true,
      message: "Supabase connection working!",
      tableExists: true,
      profileCount: data?.length || 0,
      sampleData: data?.[0] || null
    });
    
  } catch (error) {
    console.error("💥 Test failed:", error);
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
