
import Midtrans from "midtrans-client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";

console.log("Server Key:", serverKey.substring(0, 15) + "...");
const isProduction = false;
console.log("Environment FORCED to: SANDBOX");

const snap = new Midtrans.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey
});

async function testMidtrans() {
  try {
    const parameter = {
      transaction_details: {
        order_id: "TEST-" + Date.now(),
        gross_amount: 10000
      }
    };
    const transaction = await snap.createTransaction(parameter);
    console.log("Success! Token received:", transaction.token);
  } catch (err: any) {
    console.error("Error connecting to Midtrans:", err.message);
  }
}

testMidtrans();
