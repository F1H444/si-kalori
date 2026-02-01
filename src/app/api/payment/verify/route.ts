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
    const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const isProduction = false;
    console.log(`[VERIFY] Starting verification for Order: ${order_id}`);
    console.log(`[VERIFY] ENV Check: URL=${supabaseUrl.slice(0, 15)}..., KeyPresent=${!!serviceKey}`);

    const apiClient = new Midtrans.CoreApi({
      isProduction: isProduction,
      serverKey: serverKey,
      clientKey: (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "").trim(),
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

    // Check current transaction record
    const { data: currentTx, error: fetchError } = await supabase
      .from("transactions")
      .select("id, user_id, status")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !currentTx) {
      console.error("[VERIFY] Transaction Find Error:", fetchError);
      return NextResponse.json({ error: "Data transaksi tidak ditemukan" }, { status: 404 });
    }

    const userId = currentTx.user_id;

    // 4. Update Transaction Status if not already success
    if (currentTx.status !== "success") {
      await supabase
        .from("transactions")
        .update({ 
          status: "success",
          payment_type: transactionStatus.payment_type || "midtrans"
        })
        .eq("order_id", order_id);
    }

    // 5. Update Premium Subscriptions Table
    const startDate = new Date();
    const expiredAt = new Date(startDate);
    expiredAt.setDate(startDate.getDate() + 30); // 30 days premium

    const premiumData = {
      user_id: userId,
      transaction_id: currentTx.id,
      status: "active",
      plan_type: "monthly",
      start_date: startDate.toISOString(),
      expired_at: expiredAt.toISOString(),
    };

    console.log(`[VERIFY] Activating Premium for User: ${userId}`);
    
    // Upsert logic: Try update first, then insert if not exists
    const { data: existingPrem } = await supabase
      .from("premium_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    let premError;
    if (existingPrem) {
      const { error } = await supabase
        .from("premium_subscriptions")
        .update(premiumData)
        .eq("user_id", userId);
      premError = error;
    } else {
      const { error } = await supabase
        .from("premium_subscriptions")
        .insert([premiumData]);
      premError = error;
    }

    if (premError) {
      console.error("[VERIFY] Premium DB Error:", premError);
      return NextResponse.json({ error: "Gagal mengaktifkan fitur premium di database." }, { status: 500 });
    }

    console.log(`[VERIFY] DONE: Premium activated successfully for ${userId}`);
    return NextResponse.json({ success: true, message: "Premium aktif!" });
  } catch (err: any) {
    console.error("[VERIFY] Critical Error:", err);
    return NextResponse.json({ error: `System Error: ${err.message}` }, { status: 500 });
  }
}
