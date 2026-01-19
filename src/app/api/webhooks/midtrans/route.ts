import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const notificationJson = await request.json();
    console.log("[WEBHOOK] Received notification:", JSON.stringify(notificationJson));

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notificationJson;

    console.log(`[WEBHOOK] Processing Order ID: ${order_id}`);

    // 1. Verify Signature Key
    // Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is missing");
      return NextResponse.json(
        { error: "Server Configuration Error" },
        { status: 500 },
      );
    }

    const payload = order_id + status_code + gross_amount + serverKey;
    const computedSignature = crypto
      .createHash("sha512")
      .update(payload)
      .digest("hex");

    if (computedSignature !== signature_key) {
      console.error("Invalid Signature Key");
      return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
    }

    // Use Admin Client to bypass RLS
    const supabase = createAdminClient();

    // 2. Determine Success Status
    let isSuccess = false;
    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        // TODO: Handle challenge if needed, usually considered pending
      } else if (fraud_status === "accept") {
        isSuccess = true;
      }
    } else if (transaction_status === "settlement") {
      isSuccess = true;
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      isSuccess = false;
    } else if (transaction_status === "pending") {
      // Keep as pending
      return NextResponse.json({ message: "Transaction is pending" });
    }

    // 3. Update Transaction Record
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("user_id, status")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !transaction) {
      console.error("Transaction not found:", order_id);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    // Avoid duplicate processing
    if (transaction.status === "success" && isSuccess) {
      return NextResponse.json({ message: "Already processed" });
    }

    const newStatus = isSuccess ? "success" : transaction_status; // Use 'success' or raw midtrans status (e.g. 'expire')

    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: newStatus,
        payment_method: notificationJson.payment_type, // Update payment method if available (e.g. bank_transfer)
        // payment_url: ... // Optional: store other metadata
      })
      .eq("order_id", order_id);

    if (updateError) {
      console.error("[WEBHOOK] Failed to update transaction:", updateError);
      return NextResponse.json({ error: "Database Error" }, { status: 500 });
    }
    console.log(`[WEBHOOK] Transaction updated to ${newStatus}`);

    // 4. Update Premium Table if Success
    if (isSuccess) {
      console.log("[WEBHOOK] Status is success, updating premium table...");
      // Calculate expiration date (30 days from now)
      const startDate = new Date();
      const expiredAt = new Date(startDate);
      expiredAt.setDate(startDate.getDate() + 30);

      // Upsert into premium table
      const { error: premiumError } = await supabase.from("premium").upsert(
        {
          user_id: transaction.user_id,
          status: "active",
          start_date: startDate.toISOString(),
          expired_at: expiredAt.toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (premiumError) {
        console.error("[WEBHOOK] Failed to update premium table:", premiumError);
      } else {
        console.log("[WEBHOOK] Premium table updated successfully");
        
        // SYNC: Also update is_premium flag in users table
        const { error: userError } = await supabase
          .from("users")
          .update({ is_premium: true })
          .eq("id", transaction.user_id);
          
        if (userError) {
          console.error("[WEBHOOK] Failed to update is_premium in users table:", userError);
        } else {
          console.log("[WEBHOOK] Users table synced: is_premium = true");
        }
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
