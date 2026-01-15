"use client";

import { useState, useEffect } from "react";
import { 
  Camera, Zap, TrendingUp, Check, Play, 
  Apple, Droplets, Leaf, Utensils, Flame, 
  Pizza, Grape, Coffee, Cookie, Beef, Fish, Cherry, Egg 
} from "lucide-react";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLoading } from "@/context/LoadingContext";
import { TextScramble } from "@/components/ui/text-scramble";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isLoading: globalLoading } = useLoading();
  const [localAuthLoading, setLocalAuthLoading] = useState(true);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const rotateGrid = useTransform(scrollY, [0, 500], [0, 5]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
      setLocalAuthLoading(false);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const stats = [
    { num: "1Jt+", label: "Menu & Produk" },
    { num: "98%", label: "Akurasi AI" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleCTAClick = () => {
    isLoggedIn ? router.push("/dashboard") : router.push("/login");
  };

  // Variasi untuk animasi melayang (floating)
  const floatingAnimation = (delay: number = 0) => ({
    initial: { y: 0 },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: delay,
      },
    },
  });

  return (
    <>
      <div className="relative bg-white overflow-hidden min-h-[90svh] flex items-center px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 max-w-7xl mx-auto pt-32 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* --- KOLOM KIRI: Teks & Stats --- */}
            <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
              <motion.h1 
                variants={itemVariants}
                animate={!globalLoading ? "visible" : "hidden"}
              >
                <div className="block text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] text-black mb-4">
                  <TextScramble text="KELOLA" delay={0.1} />
                </div>
                <div className="block text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] text-black mb-6">
                  <TextScramble text="KALORI" delay={0.3} />
                </div>
                <div className="inline-block bg-black text-white px-6 py-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] relative">
                  <span className="text-xl sm:text-2xl font-black">DENGAN CERDAS</span>
                </div>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl text-gray-700 max-w-lg font-medium leading-relaxed">
                Pantau nutrisi, buat rencana makan, dan capai tujuan kesehatanmu dengan teknologi AI Sikalori.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleCTAClick} 
                  disabled={localAuthLoading || globalLoading}
                  className="px-8 py-4 bg-green-500 text-white font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                >
                  {localAuthLoading ? "MEMUAT..." : (isLoggedIn ? "KE DASHBOARD" : "MULAI SEKARANG")}
                </button>
                <button className="px-8 py-4 bg-white text-black font-black border-4 border-black hover:bg-black hover:text-white transition-all">
                  PELAJARI LANJUT
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-8 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="border-l-4 border-black pl-4">
                    <div className="text-4xl font-black text-black leading-none mb-1">{stat.num}</div>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* --- KOLOM KANAN: Visual Food Orbit --- */}
            <motion.div 
              className="relative h-[550px] sm:h-[650px] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={!globalLoading ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8 }}
            >
              {/* Central Element (Plate) */}
              <motion.div 
                {...floatingAnimation(0)}
                className="relative z-30 w-52 h-52 sm:w-64 sm:h-64 bg-white rounded-full border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] flex items-center justify-center p-4"
              >
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                  {/* Food on Plate */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring" }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Fried Egg (Telor Ceplok) - Center Only */}
                      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-yellow-400/20 rounded-full border-4 border-black/10 flex items-center justify-center">
                        <Egg className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-500 fill-yellow-400 rotate-12" strokeWidth={2.5} />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Spoon & Fork next to plate (Using Utensils but styled) */}
                <motion.div 
                   {...floatingAnimation(0.5)}
                   className="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 bg-white p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-15deg]"
                >
                  <Utensils className="w-8 h-8 text-black" />
                </motion.div>
                <motion.div 
                   {...floatingAnimation(0.7)}
                   className="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 bg-white p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[15deg] scale-x-[-1]"
                >
                  <Utensils className="w-8 h-8 text-black" />
                </motion.div>

                {/* Calorie Badge on Plate */}
                <div className="absolute -bottom-4 right-0 z-40 bg-yellow-400 border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="text-xs font-black uppercase tracking-widest text-black leading-none pb-1">Nutrisi</div>
                  <div className="text-xl font-black text-black leading-none">450 Kkal</div>
                </div>
              </motion.div>

              {/* Orbiting Items - THE TIGHT PERFECT CIRCULAR ORBIT */}
              
              {/* 12:00 - Cookie (Moved Down) */}
              <motion.div 
                {...floatingAnimation(0.2)}
                className="absolute top-[12%] sm:top-[15%] left-1/2 -translate-x-1/2 z-40 bg-amber-700 p-2.5 sm:p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-6"
              >
                <Cookie className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>

              {/* 01:12 - Cherry (Moved Down/In) */}
              <motion.div 
                {...floatingAnimation(0.8)}
                className="absolute top-[18%] left-[72%] sm:left-[70%] -translate-x-1/2 -translate-y-1/2 z-40 bg-pink-500 p-2.5 sm:p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12"
              >
                <Cherry className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>

              {/* 02:24 - Apple (Standard Outer) */}
              <motion.div 
                {...floatingAnimation(1.4)}
                className="absolute top-[40%] right-[-2%] sm:right-[2%] -translate-y-1/2 z-40 bg-red-400 p-3 sm:p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl rotate-12"
              >
                <Apple className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* 03:36 - Coffee (Standard Outer) */}
              <motion.div 
                {...floatingAnimation(2.0)}
                className="absolute bottom-[35%] right-[2%] sm:right-[6%] z-40 bg-amber-900 p-3 sm:p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3"
              >
                <Coffee className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* 04:48 - Water (Moved Up/In) */}
              <motion.div 
                {...floatingAnimation(2.6)}
                className="absolute bottom-[8%] right-[22%] sm:bottom-[12%] sm:right-[25%] z-40 bg-blue-400 p-3 sm:p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full -rotate-12"
              >
                <Droplets className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
              </motion.div>

              {/* 06:00 - Fish (Moved Up) */}
              <motion.div 
                {...floatingAnimation(0.5)}
                className="absolute bottom-[2%] sm:bottom-[5%] left-1/2 -translate-x-1/2 z-50 bg-cyan-500 p-3.5 sm:p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-6"
              >
                <Fish className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* 07:12 - Leaf (Moved Up/In) */}
              <motion.div 
                {...floatingAnimation(1.1)}
                className="absolute bottom-[8%] left-[22%] sm:bottom-[12%] sm:left-[25%] z-40 bg-green-500 p-3.5 sm:p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-12"
              >
                <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* 08:24 - Beef (Standard Outer) */}
              <motion.div 
                {...floatingAnimation(1.7)}
                className="absolute bottom-[35%] left-[2%] sm:left-[6%] z-50 bg-red-600 p-3.5 sm:p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-6"
              >
                <Beef className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* 09:36 - Pizza (Standard Outer) */}
              <motion.div 
                {...floatingAnimation(2.3)}
                className="absolute top-[40%] left-[-2%] sm:left-[2%] -translate-y-1/2 z-40 bg-orange-400 p-3 sm:p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-12"
              >
                <Pizza className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>

              {/* 10:48 - Grape (Moved Down/In) */}
              <motion.div 
                {...floatingAnimation(2.9)}
                className="absolute top-[18%] left-[28%] sm:left-[30%] -translate-x-1/2 -translate-y-1/2 z-10 bg-purple-600 p-2.5 sm:p-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-12"
              >
                <Grape className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}