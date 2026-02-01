"use client";

import { motion } from "framer-motion";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
  isFullPage?: boolean;
}

export default function LoadingOverlay({ 
  message = "MENYIAPKAN PENGALAMAN...", 
  className = "",
  isFullPage = true 
}: LoadingOverlayProps) {
  const containerClasses = isFullPage 
    ? "fixed inset-0 z-[1000] bg-white" 
    : "relative min-h-[400px] w-full flex-1 bg-white";

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center p-6 select-none overflow-hidden ${className}`}>
      {/* 1. LAYER BACKGROUND: ULTRA-CLEAN GRID */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(to right, #000 1.5px, transparent 1.5px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Decorative corner numbers (Brutalist style) */}
        <span className="absolute top-8 left-8 text-[10px] font-black opacity-20 italic">01 // INIT_ENGINE</span>
        <span className="absolute bottom-8 right-8 text-[10px] font-black opacity-20 italic">v2.4.0 // STABLE</span>
      </div>

      {/* 2. CENTRAL COMPONENT: THE "CORE" */}
      <div className="relative flex flex-col items-center">
        {/* High-Impact Visual Spinner */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-12">
          {/* Main Rotating Square (Neo-Brutalist) */}
          <motion.div
            animate={{ 
              rotate: 360,
              borderRadius: ["0%", "20%", "0%"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 border-[8px] border-black shadow-[12px_12px_0px_0px_#FFDE59]"
          />
          
          {/* Inner Pulsing Core */}
          <motion.div
            animate={{ 
              scale: [0.8, 1.1, 0.8],
              rotate: -360
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-8 bg-black flex items-center justify-center border-4 border-[#FFDE59]"
          >
             <motion.div 
               animate={{ opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 1, repeat: Infinity }}
               className="w-4 h-4 bg-[#FFDE59] rounded-full"
             />
          </motion.div>

          {/* Orbiting Tech Labels */}
          <motion.div
            animate={{ rotate: 180 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-10 border-2 border-dashed border-black/10 rounded-full"
          />
        </div>

        {/* 3. TYPOGRAPHY: BOLD & CLEAN */}
        <div className="text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-black text-[#FFDE59] px-4 py-1 mb-4 font-black text-xs uppercase italic tracking-[0.3em]"
          >
            Sistem Sedang Memuat
          </motion.div>
          
          <h2 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter text-black leading-none mb-4">
            {message}
          </h2>

          {/* Marquee Style Footer */}
          <div className="w-full h-8 border-y-2 border-black flex items-center overflow-hidden bg-[#FFDE59]">
             <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="whitespace-nowrap flex gap-10 font-black text-[10px] uppercase italic text-black"
             >
                {[...Array(10)].map((_, i) => (
                    <span key={i}>OPTIMIZING NUTRITION DATABASE // ANALYZING SCAN ENGINE // SECURE PAYMENT GATEWAY // </span>
                ))}
             </motion.div>
          </div>
        </div>
      </div>

      {/* 4. DECORATIVE SIDEBAR (PREMIUM FEEL) */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-1 pr-4">
         {[...Array(20)].map((_, i) => (
             <div key={i} className={`h-1 w-8 bg-black ${i % 4 === 0 ? 'opacity-100 w-12' : 'opacity-10'}`} />
         ))}
      </div>
    </div>
  );
}
