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

  // 3. Prepare Midtrans
  const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
  const clientKey = (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "").trim();
  
  if (!serverKey) {
    console.error("PAYMENT ERROR: MIDTRANS_SERVER_KEY is missing.");
    return NextResponse.json({ error: "Konfigurasi server bermasalah (Missing Key)" }, { status: 500 });
  }

  // Detect environment
  // Default to Sandbox unless explicitly set to 'true'
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  
  console.log(`🚀 [Payment] Initializing Midtrans Snap...`);
  console.log(`📡 [Payment] Mode: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
  console.log(`🔑 [Payment] Server Key Prefix: ${serverKey.substring(0, 10)}...`);

  const snap = new Midtrans.Snap({
    isProduction: isProduction,
    serverKey: serverKey,
    // Note: clientKey is optional in some versions but good to have
    clientKey: clientKey 
  });

  const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const amount = 16000; 

  // 4. Create Transaction Record (Securely using Admin Client)
  console.log("💾 [Payment] Creating transaction:", orderId);
  const { error: transactionError } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: user.id,
      order_id: orderId,
      amount: amount,
      status: "pending",
      payment_type: "midtrans",
      metadata: { email: user.email }
    });
  
  if (transactionError) {
    console.error("❌ [Payment] DB Error:", transactionError);
    return NextResponse.json({ error: "Gagal mencatat transaksi di database." }, { status: 500 });
  }

  // 5. Create Snap Transaction
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: profile.full_name || "Customer",
      email: user.email,
    },
    credit_card: {
      secure: true,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success`,
      error: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/failed`,
      pending: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (e) {
    console.error("💥 [Midtrans] Transaction Error:", e.message);
    return NextResponse.json({ error: e.message || "Gagal menghubungi Midtrans." }, { status: 500 });
  }

}
