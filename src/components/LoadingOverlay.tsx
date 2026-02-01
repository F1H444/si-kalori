"use client";

import { motion } from "framer-motion";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
  isFullPage?: boolean;
}

export default function LoadingOverlay({ 
  message = "MEMUAT DATA...", 
  className = "",
  isFullPage = true 
}: LoadingOverlayProps) {
  const containerClasses = isFullPage 
    ? "fixed inset-0 z-[1000] bg-white/95 backdrop-blur-md" 
    : "relative min-h-[400px] w-full flex-1 bg-white";

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center p-6 select-none ${className}`}>
      <div className="flex flex-col items-center">
        {/* Simple & Clean Spinner */}
        <div className="relative w-16 h-16 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-[3px] border-gray-100 border-t-black rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[15px] bg-yellow-400 rounded-full border-2 border-black"
          />
        </div>

        {/* Clean Typography */}
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-black uppercase tracking-widest text-black mb-2"
          >
            {message}
          </motion.h2>
          <div className="h-1 w-12 bg-black mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
}
