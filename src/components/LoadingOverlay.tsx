"use client";

import { motion } from "framer-motion";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
  isFullPage?: boolean;
}

export default function LoadingOverlay({ 
  message = "MENYIAPKAN DATA...", 
  className = "",
  isFullPage = true 
}: LoadingOverlayProps) {
  const containerClasses = isFullPage 
    ? "fixed inset-0 z-[1000] bg-white" 
    : "relative min-h-[400px] w-full flex-1 bg-white";

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center p-6 select-none ${className}`}>
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Modern Neo-Brutalist Spinner */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-10">
          {/* Static outer ring */}
          <div className="absolute inset-0 border-[3px] border-black rounded-full opacity-10" />
          
          {/* Animated partial ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-[3px] border-transparent border-t-black rounded-full"
          />
          
          {/* Inner pulsating circle */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-4 sm:inset-6 bg-yellow-400 rounded-full border-2 border-black"
          />

          {/* Drifting dots */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear",
                delay: i * 0.75 
              }}
              className="absolute inset-0 flex items-start justify-center p-1"
            >
              <div className="w-2 h-2 bg-black rounded-full shadow-[2px_2px_0px_0px_#FFC700]" />
            </motion.div>
          ))}
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-black leading-tight"
          >
            {message}
          </motion.h2>
          
          <div className="flex items-center justify-center gap-4">
            <div className="h-[2px] w-8 bg-black opacity-20" />
            <motion.p 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-black italic"
            >
              SIKALORI ENGINE v2.0
            </motion.p>
            <div className="h-[2px] w-8 bg-black opacity-20" />
          </div>
        </div>

        {/* Decorative Floating Elements (Premium Feel) */}
        <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-16 -left-16 w-8 h-8 bg-black flex items-center justify-center -rotate-12 shadow-[4px_4px_0px_0px_#FFC700]"
        >
            <div className="w-4 h-[2px] bg-white" />
        </motion.div>
        
        <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-12 -right-16 w-10 h-10 border-4 border-black rotate-12 flex items-center justify-center"
        >
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
        </motion.div>
      </div>

      {/* Progress Line (Fake but adds to 'Clean & Good' feel) */}
      <div className="mt-20 w-48 sm:w-64 h-1 bg-gray-100 border border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-1/2 bg-yellow-400"
        />
      </div>
    </div>
  );
}
