"use client";

import { motion } from "framer-motion";
import { X, RefreshCw, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-red-500 flex flex-col items-center justify-center p-4 font-mono overflow-hidden relative">
      
      {/* Background Pattern Removed as requested */}

      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="bg-white border-[6px] sm:border-[8px] border-black p-8 sm:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full text-center relative z-10"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black border-4 border-white p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            <X size={48} className="text-red-500" strokeWidth={4} />
        </div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter mb-4 mt-6 text-red-600"
        >
          PEMBAYARAN <br/><span className="text-black">GAGAL</span>
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
          className="text-lg font-bold uppercase mb-8 leading-relaxed text-gray-800"
        >
          Ups! Sepertinya ada masalah saat memproses pembayaranmu. Jangan panik, saldo kamu aman.
        </motion.p>

        <div className="space-y-4">
            <Link href="/premium" className="block">
                <motion.button 
                    whileHover={{ scale: 1.02, x: -4, y: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
                    whileTap={{ scale: 0.98, x: 0, y: 0, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
                    className="w-full bg-black text-white py-4 font-black uppercase text-xl border-2 border-black flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <RefreshCw size={24} /> Coba Lagi
                </motion.button>
            </Link>
            
            <Link href="/bantuan" className="block">
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-100 text-black py-4 font-bold uppercase text-lg border-2 border-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                   <HelpCircle size={20} /> Butuh Bantuan?
                </motion.button>
            </Link>
        </div>
      </motion.div>
    </div>
  );
}
