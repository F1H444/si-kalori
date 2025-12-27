"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, ChevronRight, CreditCard, QrCode, Smartphone, Building2, Copy, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function PaymentPage() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const PRICE = 15000;
    const ADMIN_FEE = 1000;
    const TOTAL = PRICE + ADMIN_FEE;

    useEffect(() => {
        // Get user email from session
        const session = localStorage.getItem("user_session");
        if (session) {
            const user = JSON.parse(session);
            setUserEmail(user.email);
        }
    }, []);

    const paymentMethods = [
        {
            category: "E-Wallet",
            icon: <Smartphone className="w-5 h-5" />,
            items: [
                { id: "ovo", name: "OVO", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg" },
                { id: "dana", name: "DANA", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" },
                { id: "shopeepay", name: "ShopeePay", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" }
            ]
        }
    ];

    const handlePayment = async () => {
        if (!selectedMethod) {
            alert("Silakan pilih metode pembayaran terlebih dahulu!");
            return;
        }

        setLoading(true);

        try {
            // 1. Create Invoice via API
            const res = await fetch("/api/payment/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    external_id: `invoice-${Date.now()}`,
                    amount: TOTAL,
                    payer_email: userEmail || "guest@example.com",
                    description: "Upgrade Premium SiKalori (1 Bulan)"
                })
            });

            const data = await res.json();

            if (res.ok && data.invoice_url) {
                // 2. Redirect to Xendit Checkout
                window.location.href = data.invoice_url;
            } else {
                alert(`Gagal membuat invoice: ${data.error}`);
            }
        } catch (error) {
            console.error("Payment Error:", error);
            alert("Terjadi kesalahan koneksi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] font-sans text-black pb-20 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            {/* Main Container with Extra Top Padding */}
            <div className="max-w-2xl mx-auto p-4 pt-48 relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black uppercase leading-none mb-2 transform -rotate-2">
                        Upgrade <span className="bg-[#FF0080] text-white px-3 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">Premium</span>
                    </h1>
                    <p className="font-bold text-gray-600 mt-4 text-lg">Buka semua fitur tanpa batas!</p>
                </div>

                {/* Order Summary Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-10 relative overflow-hidden"
                >
                    {/* Decorative Tape */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 border-2 border-black px-4 py-1 transform -rotate-1 font-black text-xs tracking-widest shadow-sm z-10">
                        RECEIPT
                    </div>

                    <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3 border-b-4 border-black pb-4">
                        <CreditCard className="w-8 h-8" strokeWidth={2.5} />
                        Ringkasan
                    </h2>
                    <div className="space-y-4 font-bold text-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Paket Premium (1 Bulan)</span>
                            <span>Rp {PRICE.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Biaya Layanan</span>
                            <span>Rp {ADMIN_FEE.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="h-0.5 bg-black my-4 border-t-2 border-dashed border-gray-400" />
                        <div className="flex justify-between items-center text-3xl font-black">
                            <span>TOTAL</span>
                            <span className="bg-[#7ED957] px-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                                Rp {TOTAL.toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Payment Methods */}
                <div className="space-y-8">
                    <h3 className="font-black text-3xl uppercase flex items-center gap-3">
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm rounded-full">1</div>
                        Pilih E-Wallet
                    </h3>

                    <div className="grid gap-4">
                        {paymentMethods[0].items.map((method) => (
                            <motion.div
                                key={method.id}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`relative cursor-pointer border-4 border-black p-4 flex items-center justify-between transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${selectedMethod === method.id
                                        ? "bg-[#A6FAFF] translate-x-1 translate-y-1 shadow-none"
                                        : "bg-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    {/* Logo Container */}
                                    <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center p-2 rounded-lg">
                                        <img
                                            src={method.logo}
                                            alt={method.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xl uppercase">{method.name}</h4>
                                        <p className="text-sm font-bold text-gray-500">Bayar dengan {method.name}</p>
                                    </div>
                                </div>

                                <div className={`w-8 h-8 rounded-full border-4 border-black flex items-center justify-center transition-all ${selectedMethod === method.id ? "bg-black" : "bg-white"
                                    }`}>
                                    {selectedMethod === method.id && <Check className="w-5 h-5 text-white" strokeWidth={4} />}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Pay Button (Static Position) */}
                <div className="mt-12">
                    <button
                        onClick={handlePayment}
                        disabled={!selectedMethod || loading}
                        className="w-full bg-black text-white font-black py-6 text-2xl border-4 border-transparent hover:bg-[#FF0080] hover:border-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_#7ED957] hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-y-1 active:translate-y-0 active:shadow-none"
                    >
                        {loading ? <Loader2 className="animate-spin w-8 h-8" /> : (
                            <>
                                BAYAR SEKARANG
                                <ChevronRight size={32} strokeWidth={4} />
                            </>
                        )}
                    </button>
                    <p className="text-center font-bold text-gray-400 mt-4 text-sm uppercase tracking-widest">
                        Secure Payment by Xendit
                    </p>
                </div>
            </div>
        </div>
    );
}
