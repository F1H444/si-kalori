"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import Confetti from "react-confetti";
import { useEffect, useState, Suspense } from "react";
import { useWindowSize } from "react-use";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessContent() {
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      // Check if accessed normally after a payment
      const orderId = searchParams.get("order_id") || searchParams.get("id");
      if (!orderId) {
        console.warn("Direct access to success page denied - No Order ID");
        router.push("/dashboard");
        return;
      }

      try {
        console.log("Verifying payment for order:", orderId);
        await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId }),
        });
      } catch (err) {
        console.error("Verification error:", err);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();

    // Stop confetti after 5 seconds to not be annoying
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-green-400 flex flex-col items-center justify-center p-4 font-mono overflow-hidden relative">
      {/* Confetti Celebration */}
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />}

      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="bg-white border-[6px] sm:border-[8px] border-black p-8 sm:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full text-center relative z-10"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 border-4 border-black p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ShieldCheck size={48} className="text-black" />
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter mb-4 mt-6"
        >
          PEMBAYARAN <span className="text-green-500">SUKSES!</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4 }}
          className="h-2 bg-black w-24 mx-auto mb-6"
        />

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-bold uppercase mb-8 leading-relaxed"
        >
          {verifying ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" /> Sedang memverifikasi...
            </span>
          ) : (
            <>
              Selamat! Akun kamu sekarang sudah <span className="bg-black text-white px-2 py-1">PREMIUM</span>. 
              Nikmati semua fitur tanpa batas sekarang juga.
            </>
          )}
        </motion.p>

        <div className="space-y-4">
            <Link href="/dashboard" className="block">
                <motion.button 
                    whileHover={{ scale: 1.02, x: -4, y: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                    whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
                    className="w-full bg-black text-white py-4 font-black uppercase text-xl border-2 border-black flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    Mulai Eksplor <ArrowRight strokeWidth={3} />
                </motion.button>
            </Link>
            
            <Link href="/riwayat" className="block">
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white text-black py-4 font-bold uppercase text-lg border-2 border-black hover:bg-gray-50 transition-all"
                >
                    Lihat Riwayat
                </motion.button>
            </Link>
        </div>
      </motion.div>

      <div className="mt-12 text-center text-black font-bold uppercase tracking-widest text-sm opacity-60">
        TRANSAKSI ID: {searchParams.get("order_id") || searchParams.get("id") || "N/A"}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-green-400 flex items-center justify-center font-black text-white italic">MEMUAT...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
