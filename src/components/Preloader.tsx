"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLoading } from "@/context/LoadingContext";

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const { setIsLoading } = useLoading();

  useEffect(() => {
    // Check if user has already seen the preloader in this session
    const hasSeenLoader = sessionStorage.getItem("sikalori_preloader_seen");
    
    if (hasSeenLoader) {
      setLoading(false);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
      setIsLoading(false);
      sessionStorage.setItem("sikalori_preloader_seen", "true");
    }, 800); 

    return () => clearTimeout(timer);
  }, [setIsLoading]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loader"
          // Animasi keluar: Seluruh container meluncur ke atas dengan cepat
          exit={{ 
            y: "-100%",
            transition: { 
              duration: 0.6, 
              ease: [0.76, 0, 0.24, 1] // Power4 ease (sangat smooth)
            } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-full h-full border-[1px] border-white/5 rounded-full"
            />
            <motion.div 
              animate={{ 
                rotate: -360,
                scale: [1, 1.5, 1],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/2 -right-1/2 w-full h-full border-[1px] border-white/5 rounded-full"
            />
          </div>

          {/* Konten Tengah */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                rotate: [-1, 1, -1],
                transition: { 
                  y: { type: "spring", damping: 12 },
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }
              }}
              className="px-10 py-6 bg-[#FFDE59] border-4 border-black shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] rounded-3xl"
            >
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-black flex items-center gap-2">
                SI <span className="text-secondary">KALORI</span>
              </h1>
            </motion.div>

            {/* Progress Wrapper */}
            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="w-[180px] h-[8px] bg-white/10 rounded-full overflow-hidden border-2 border-white/5">
                <motion.div 
                   initial={{ width: "0%" }}
                   animate={{ width: "100%" }}
                   transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}
                   className="h-full bg-[#22C55E]"
                />
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/40 font-black uppercase text-[10px] tracking-[0.4em]"
              >
                Memuat Pengalaman...
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}