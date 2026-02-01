"use client";

import { motion } from "framer-motion";

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = "Memuat..." }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#FFDE59] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Neo-brutalist Spinner */}
      <div className="relative mb-10">
        <div className="w-24 h-24 border-8 border-black border-t-white rounded-full animate-spin shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
        <div className="absolute inset-0 border-4 border-black rounded-full opacity-20 animate-ping"></div>
      </div>
      
      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-black leading-none">
          {message}
        </h2>
        <div className="bg-black text-white px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] text-xs tracking-[0.3em] inline-block">
          SIKALORI AI ENGINE
        </div>
      </motion.div>
    </div>
  );
}
