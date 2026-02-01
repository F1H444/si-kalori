import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // 1. Auth Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch User Profile
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile error:", profileError);
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 3. Prepare Midtrans - Trim the key to avoid 401 errors from invisible whitespace
  const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
  
  if (!serverKey) {
    console.error(
      "PAYMENT ERROR: MIDTRANS_SERVER_KEY is missing in environment variables.",
    );
    return NextResponse.json(
      { error: "Server Configuration Error: Missing Key" },
      { status: 500 },
    );
  }

  // Force Sandbox for testing as requested
  const isProduction = false;

  console.log("PAYMENT DEBUG:", {
    keyLoaded: true,
    keyPrefix: serverKey.substring(0, 4) + "...",
    isProductionMode: isProduction,
    keyLength: serverKey.length,
  });

  const snap = new Midtrans.Snap({
    isProduction: isProduction,
    serverKey: serverKey,
    clientKey: (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "").trim()
  });

  const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const amount = 16000; // Fixed amount from UI

  // 4. Create Transaction Record
  // Using Admin Client to bypass RLS for logging transactions
  console.log("Creating transaction record for:", user.id, orderId);
  const { error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: user.id,
      order_id: orderId,
      amount: amount,
      status: "pending",
      payment_type: "midtrans",
      metadata: { 
        email: user.email, 
        created_at_api: new Date().toISOString() 
      }
    });
  
  if (transactionError) {
    console.error("PAYMENT DB ERROR Details:", transactionError);
    return NextResponse.json(
      { error: `Database Error: ${transactionError.message}` },
      { status: 500 },
    );
  }

  // 5. Create Snap Transaction
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: profile.full_name || "Customer",
      // last_name: "", // Optional
      email: user.email,
      phone: profile.phone || undefined,
    },
    credit_card: {
      secure: true,
    },
    callbacks: {
      finish: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/payment/success`,
      error: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/payment/failed`,
      pending: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/payment/success`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    // Optional: Update transaction with token or url if column exists
    // await supabase.from("transactions").update({ payment_url: transaction.redirect_url }).eq("order_id", orderId);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (e) {
    console.error("Midtrans error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
