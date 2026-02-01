"use client";

import { motion } from "framer-motion";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
  isFullPage?: boolean;
}

export default function LoadingOverlay({ 
  message = "Memuat...", 
  className = "",
  isFullPage = true 
}: LoadingOverlayProps) {
  const containerClasses = isFullPage 
    ? "fixed inset-0 z-[100] bg-[#FFDE59]" 
    : "absolute inset-0 z-[50] bg-[#FFDE59]/80 backdrop-blur-sm rounded-3xl";

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center p-6 text-center overflow-hidden ${className}`}>
      {/* Neo-brutalist Spinner Wrapper */}
      <div className="relative mb-10 w-24 h-24">
        {/* Main Spinning Element - Separated from shadow to prevent double rotation */}
        <div className="absolute inset-0 border-8 border-black border-t-white rounded-full animate-spin"></div>
        {/* Static Shadow Element */}
        <div className="absolute inset-0 border-8 border-transparent rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -z-10"></div>
        {/* Decorative Pulse */}
        <div className="absolute inset-0 border-4 border-black rounded-full opacity-10 animate-ping"></div>
      </div>
      
      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <h2 className={`${isFullPage ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl"} font-black uppercase tracking-tighter italic text-black leading-none`}>
          {message}
        </h2>
        <div className="bg-black text-white px-6 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] text-[10px] sm:text-xs tracking-[0.3em] inline-block">
          SIKALORI AI ENGINE
        </div>
      </motion.div>
    </div>
  );
}
