"use client";

import { X, Check, Zap, Star, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-yellow-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 sm:p-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
                        >
                            <X size={24} strokeWidth={3} />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-yellow-400 border-4 border-white rounded-full mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Crown size={32} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black uppercase leading-none mb-2">
                                Limit Harian Habis!
                            </h2>
                            <p className="font-bold text-black/80">
                                Anda telah mencapai batas 10 scan hari ini.
                            </p>
                        </div>

                        {/* Premium Card */}
                        <div className="bg-white border-4 border-black p-6 mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-black px-3 py-1 border-l-4 border-b-4 border-black">
                                POPULAR
                            </div>

                            <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                                <Zap className="fill-yellow-400 text-black" />
                                Premium Plan
                            </h3>

                            <ul className="space-y-3 mb-6">
                                {[
                                    "Unlimited Scan Makanan",
                                    "Analisis Nutrisi Detail",
                                    "Tracking Progress Mingguan",
                                    "Prioritas Support 24/7",
                                    "Bebas Iklan Selamanya"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-bold">
                                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center flex-shrink-0">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="text-center p-4 bg-gray-100 border-2 border-black mb-4">
                                <span className="block text-sm font-bold text-gray-500 line-through">Rp 49.000</span>
                                <span className="text-3xl font-black">Rp 15.000</span>
                                <span className="text-sm font-bold">/bulan</span>
                            </div>

                            <button
                                onClick={() => router.push("/payment")}
                                className="w-full py-4 bg-black text-white font-black text-xl border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                UPGRADE SEKARANG
                            </button>
                        </div>

                        <p className="text-center text-xs font-bold opacity-60">
                            *Pembayaran aman & garansi uang kembali 7 hari.
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
