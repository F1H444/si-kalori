import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();

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

  // 3. Prepare Midtrans
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

  if (!serverKey) {
    console.error(
      "PAYMENT ERROR: MIDTRANS_SERVER_KEY is missing in environment variables.",
    );
    return NextResponse.json(
      { error: "Server Configuration Error: Missing Key" },
      { status: 500 },
    );
  }

  // FORCE SANDBOX: User keys look like Prod but are Sandbox
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
  });

  const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const amount = 16000; // Fixed amount from UI

  // 4. Create Transaction Record
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      order_id: orderId,
      amount: amount,
      status: "pending",
      payment_method: "midtrans",
      // payment_url: "", // Will be filled by webhooks or client if needed, or we can save token here
    });

  if (transactionError) {
    console.error("Transaction create error:", transactionError);
    return NextResponse.json(
      { error: "Failed to create transaction" },
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
