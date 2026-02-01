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

    // Process Premium if success
    if (isSuccess) {
      const userId = txData.user_id;
      const startDate = new Date();
      const expiredAt = new Date(startDate);
      expiredAt.setDate(startDate.getDate() + 30);

      const premiumData = {
        user_id: userId,
        transaction_id: txData.id,
        status: "active",
        plan_type: "monthly",
        start_date: startDate.toISOString(),
        expired_at: expiredAt.toISOString(),
      };

      console.log(`[WEBHOOK] Activating Premium for User: ${userId}`);

      // Smart Upsert
      const { data: existingPrem } = await supabase
        .from("premium_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingPrem) {
        await supabase.from("premium_subscriptions").update(premiumData).eq("user_id", userId);
      } else {
        await supabase.from("premium_subscriptions").insert([premiumData]);
      }
      
      console.log(`[WEBHOOK] PREMIUM ACTIVATED for ${userId}`);
    }

    return NextResponse.json({ message: "OK" });
  } catch (err) {
    console.error("[WEBHOOK] Error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
