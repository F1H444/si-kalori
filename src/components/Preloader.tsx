"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Durasi total loading dipangkas agar tidak mengganggu UX
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          {/* Konten Tengah */}
          <div className="flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: [-2, 2, -2],
                transition: { 
                  scale: { type: "spring", damping: 15, stiffness: 200 },
                  opacity: { duration: 0.4 },
                  rotate: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }
              }}
              className="px-8 py-4 bg-white border-4 border-white shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] rounded-2xl"
            >
              <h1 className="text-4xl md:text-6xl font-black text-black italic tracking-tighter">
                SI KALORI
              </h1>
            </motion.div>

            {/* Progress Bar Cepat */}
            <div className="w-[140px] h-[4px] mt-8 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                 initial={{ width: "0%" }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 1.5, ease: [0.65, 0, 0.35, 1] }}
                 className="h-full bg-yellow-400"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}