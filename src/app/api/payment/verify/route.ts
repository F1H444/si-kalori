import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Initialize Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    
    // FORCE SANDBOX to match payment route (User has Prod-like keys in Sandbox)
    const isProduction = false; 

    console.log(`[VERIFY] Starting verification for Order: ${order_id}`);
    console.log(`[VERIFY] Using Key: ${serverKey.substring(0, 5)}... in Mode: ${isProduction ? 'Production' : 'Sandbox'}`);

    // 2. Check Status Function
    const apiClient = new Midtrans.CoreApi({
       isProduction: isProduction,
       serverKey: serverKey,
       clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    });

    let transactionStatus;
    try {
        console.log(`[VERIFY] Calling Midtrans API...`);
        transactionStatus = await apiClient.transaction.status(order_id);
        console.log(`[VERIFY] Midtrans Response Status: ${transactionStatus.transaction_status}`);
    } catch (midtransErr: any) {
        console.error("[VERIFY] Midtrans API Error:", midtransErr.message);
        return NextResponse.json({ error: "Verification Failed with Payment Gateway" }, { status: 502 });
    }

    const verificationStatus = transactionStatus.transaction_status;
    const fraudStatus = transactionStatus.fraud_status;

    let isSuccess = false;
    if (verificationStatus == 'capture') {
        if (fraudStatus == 'challenge') {
            // deny
        } else if (fraudStatus == 'accept') {
            isSuccess = true;
        }
    } else if (verificationStatus == 'settlement') {
        isSuccess = true;
    }
    
    console.log(`[VERIFY] Payment Success Determined: ${isSuccess}`);

    if (!isSuccess) {
        return NextResponse.json({ message: "Payment not settled yet", status: verificationStatus }, { status: 400 });
    }

    // 3. Update Database Securely
    const supabase = await createClient();

    // Update Transaction
    const { error: txError } = await supabase.from("transactions")
        .update({ status: 'success' })
        .eq("order_id", order_id);

    if (txError) console.error("[VERIFY] Transaction Update Error:", txError);

    // Update Profile
    const { data: transaction } = await supabase.from("transactions").select("user_id").eq("order_id", order_id).single();
    
    if (transaction?.user_id) {
        console.log(`[VERIFY] Updating Profile for User ID: ${transaction.user_id}`);
        const { error } = await supabase
            .from("profiles")
            .update({ is_premium: true })
            .eq("id", transaction.user_id);
            
        if (error) {
             console.error("[VERIFY] Profile Update Error", error);
             return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }
        console.log("[VERIFY] Profile Updated Successfully");
    } else {
        console.error("[VERIFY] Transaction record not found for retrieval");
    }

    return NextResponse.json({ success: true, message: "Premium activated" });

  } catch (error: any) {
    console.error("Verify Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
