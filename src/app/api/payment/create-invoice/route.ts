import { NextRequest, NextResponse } from "next/server";
import { Xendit } from "xendit-node";

const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || "xnd_development_...",
});

const { Invoice } = xenditClient;

export async function POST(req: NextRequest) {
    try {
        const { external_id, amount, payer_email, description } = await req.json();

        if (!external_id || !amount || !payer_email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const response = await Invoice.createInvoice({
            data: {
                externalId: external_id,
                amount: amount,
                payerEmail: payer_email,
                description: description,
                invoiceDuration: 86400, // 24 hours
                currency: "IDR",
                paymentMethods: ["OVO", "DANA", "SHOPEEPAY"]
            }
        });

        return NextResponse.json({ invoice_url: response.invoiceUrl });

    } catch (error: any) {
        console.error("Xendit Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 });
    }
}
