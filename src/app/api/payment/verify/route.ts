import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Initialize Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const isProduction = false;

    console.log(`[VERIFY] Starting verification for Order: ${order_id}`);
    console.log(`[VERIFY] ENV Check: URL=${supabaseUrl.slice(0, 15)}..., KeyPresent=${!!serviceKey}`);

    const apiClient = new Midtrans.CoreApi({
      isProduction: isProduction,
      serverKey: serverKey,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    let transactionStatus;
    try {
      console.log(`[VERIFY] Fetching status from Midtrans for: ${order_id}`);
      transactionStatus = await apiClient.transaction.status(order_id);
      console.log(`[VERIFY] Midtrans Raw Response:`, transactionStatus);
    } catch (midtransErr: any) {
      console.error("[VERIFY] Midtrans API Error:", midtransErr.message);
      return NextResponse.json(
        { error: "Gagal komunkasi dengan Midtrans", details: midtransErr.message },
        { status: 502 },
      );
    }

    const verificationStatus = (transactionStatus.transaction_status || "").toLowerCase();
    const fraudStatus = (transactionStatus.fraud_status || "").toLowerCase();

    console.log(`[VERIFY] Status: ${verificationStatus}, Fraud: ${fraudStatus}`);

    let isSuccess = false;
    if (verificationStatus === "capture") {
      if (fraudStatus === "challenge") {
        isSuccess = false; 
      } else {
        isSuccess = true;
      }
    } else if (verificationStatus === "settlement" || verificationStatus === "success") {
      isSuccess = true;
    }

    if (!isSuccess) {
      console.warn(`[VERIFY] Payment NOT successful yet. Status: ${verificationStatus}`);
      return NextResponse.json(
        { message: "Pembayaran belum tuntas", status: verificationStatus },
        { status: 400 },
      );
    }

    // 3. Update Database Securely (Bypass RLS)
    const supabase = createAdminClient();

    // Check current status first to avoid "already updated" edge cases
    console.log(`[VERIFY] Checking current transaction status for: ${order_id}`);
    const { data: currentTx, error: fetchError } = await supabase
      .from("transactions")
      .select("user_id, status")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !currentTx) {
      console.error("[VERIFY] Transaction Find Error:", fetchError);
      return NextResponse.json({ error: "Data transaksi tidak ditemukan di database kami" }, { status: 404 });
    }

    const userId = currentTx.user_id;
    console.log(`[VERIFY] Database current status: ${currentTx.status} for User: ${userId}`);

    // If already success, we can skip updates but still ensure premium just in case
    if (currentTx.status !== "success") {
      console.log(`[VERIFY] Updating transaction record to success...`);
      const { error: txError } = await supabase
        .from("transactions")
        .update({ 
          status: "success",
          payment_method: transactionStatus.payment_type || "midtrans"
        })
        .eq("order_id", order_id);

      if (txError) {
        console.error("[VERIFY] DB Transaction Update Error:", txError);
      }
    }

    // Update Premium Table
    const startDate = new Date();
    const expiredAt = new Date(startDate);
    expiredAt.setDate(startDate.getDate() + 30);

    console.log(`[VERIFY] Upserting premium record for User: ${userId}`);
    const { error: premError } = await supabase.from("premium").upsert(
      {
        user_id: userId,
        status: "active",
        start_date: startDate.toISOString(),
        expired_at: expiredAt.toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (premError) {
      console.error("[VERIFY] DB Premium Error:", premError);
      return NextResponse.json({ error: "Gagal memperbarui status premium di database" }, { status: 500 });
    }
    
    // Sync User Flag
    console.log(`[VERIFY] Syncing is_premium flag for User: ${userId}`);
    
    // First, try a simple update
    const { error: userUpdateError, count } = await supabase
      .from("users")
      .update({ is_premium: true })
      .eq("id", userId)
      .select("id");

    if (userUpdateError) {
      console.error("[VERIFY] DB User Sync Error Details:", JSON.stringify(userUpdateError));
      
      // DIAGNOSTIC: Try to see what columns ARE there
      const { data: sampleUser } = await supabase.from("users").select("*").limit(1).single();
      const availableColumns = sampleUser ? Object.keys(sampleUser) : [];
      console.log("[VERIFY] Available columns in 'users' table:", availableColumns);

      return NextResponse.json({ 
        error: "Gagal sinkronisasi data user", 
        details: userUpdateError.message || JSON.stringify(userUpdateError),
        code: userUpdateError.code,
        available_columns: availableColumns, // Help me debug!
        debug_id: userId 
      }, { status: 500 });
    }

    console.log(`[VERIFY] Rows updated in 'users': ${count ?? "unknown"}`);
    if (!count && count !== null) {
        console.warn(`[VERIFY] No user record found for ${userId}. Creating skeleton profile.`);
        // Fallback: If user profile doesn't exist yet, we must create it so dashboard doesn't break
        await supabase.from("users").insert({ 
            id: userId, 
            is_premium: true,
            full_name: "Premium User",
            daily_target: 2000 // Default fallback
        });
    }

    console.log(`[VERIFY] DONE: Premium activated successfully for ${userId}`);
    return NextResponse.json({ success: true, message: "Premium aktif!" });
  } catch (err: any) {
    console.error("[VERIFY] Critical Error:", err);
    return NextResponse.json({ error: `System Error: ${err.message}` }, { status: 500 });
  }
}
