
import Midtrans from "midtrans-client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
const clientKey = (process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "").trim();

console.log("--- DEBUG MIDTRANS ---");
console.log("Server Key Prefix:", serverKey.substring(0, 15) + "...");
console.log("Client Key Prefix:", clientKey.substring(0, 15) + "...");

async function testMode(isProd: boolean) {
  console.log(`\nTesting with isProduction: ${isProd}`);
  const snap = new Midtrans.Snap({
    isProduction: isProd,
    serverKey: serverKey,
    clientKey: clientKey
  });

  try {
    const parameter = {
      transaction_details: {
        order_id: "TEST-" + (isProd ? "PROD-" : "SB-") + Date.now(),
        gross_amount: 10000
      }
    };
    const transaction = await snap.createTransaction(parameter);
    console.log(`✅ SUCCESS [${isProd ? 'PROD' : 'SB'}]: Token received:`, transaction.token);
    return true;
  } catch (err: any) {
    console.error(`❌ FAILED [${isProd ? 'PROD' : 'SB'}]:`, err.message);
    return false;
  }
}

async function run() {
  const sbResult = await testMode(false);
  const prodResult = await testMode(true);
  
  console.log("\n--- CONCLUSION ---");
  if (sbResult && !prodResult) {
    console.log("Conclusion: These are SANDBOX keys.");
  } else if (!sbResult && prodResult) {
    console.log("Conclusion: These are PRODUCTION keys.");
  } else if (!sbResult && !prodResult) {
    console.log("Conclusion: The keys are INVALID or have expired.");
  } else {
    console.log("Conclusion: Both worked? Unusual.");
  }
}

run();
