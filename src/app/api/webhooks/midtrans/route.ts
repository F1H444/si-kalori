import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const notificationJson = await request.json();
    console.log("[WEBHOOK] Received:", JSON.stringify(notificationJson));

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notificationJson;

    // 1. Verify Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const payload = order_id + status_code + gross_amount + serverKey;
    const computedSignature = crypto.createHash("sha512").update(payload).digest("hex");

    if (computedSignature !== signature_key) {
      console.error("[WEBHOOK] Invalid Signature");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
    }

    const supabase = createAdminClient();

    // 2. Determine success
    const vtStatus = (transaction_status || "").toLowerCase();
    const vtFraud = (fraud_status || "").toLowerCase();
    
    let isSuccess = false;
    if (vtStatus === "capture") {
      isSuccess = vtFraud !== "challenge";
    } else if (vtStatus === "settlement" || vtStatus === "success") {
      isSuccess = true;
    }

    console.log(`[WEBHOOK] Order: ${order_id}, Success: ${isSuccess}, Status: ${vtStatus}`);

    // Update Transaction
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .update({ 
        status: isSuccess ? "success" : vtStatus,
        payment_type: notificationJson.payment_type 
      })
      .eq("order_id", order_id)
      .select("id, user_id, status")
      .single();

    if (txError || !txData) {
      console.error("[WEBHOOK] Transaction Not Found:", order_id);
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Process Premium if success and not already success
    if (isSuccess) {
      const userId = txData.user_id;
      const startDate = new Date();
      const expiredAt = new Date(startDate);
      expiredAt.setDate(startDate.getDate() + 30);

      await supabase.from("premium").upsert({
        user_id: userId,
        transaction_id: txData.id,
        status: "active",
        start_date: startDate.toISOString(),
        expired_at: expiredAt.toISOString(),
      }, { onConflict: "user_id" });

      // Robust check for is_premium column before update
      const { data: sampleUser } = await supabase.from("users").select("*").limit(1).single();
      const availableColumns = sampleUser ? Object.keys(sampleUser) : [];
      
      if (availableColumns.includes("is_premium")) {
        await supabase.from("users").update({ is_premium: true }).eq("id", userId);
        console.log(`[WEBHOOK] PREMIUM ACTIVATED for ${userId}`);
      } else {
        console.warn(`[WEBHOOK] Skipping is_premium update for ${userId} because column is missing.`);
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (err) {
    console.error("[WEBHOOK] Error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
