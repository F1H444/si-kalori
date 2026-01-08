"use client";

import Script from "next/script";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Star, Zap, TrendingUp, Loader2, Crown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/navbar";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 12,
    },
  },
};

const featureVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
      delay: 0.3,
    },
  },
};

const checkItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.is_premium) {
          setIsPremium(true);
        }
      }
    };
    checkUser();
  }, []);

  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Snap is already loaded
    if ((window as any).snap) {
      setScriptLoaded(true);
    }
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!scriptLoaded) {
      alert("Sistem pembayaran sedang memuat, cobalah sesaat lagi.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/payment', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 500) {
           throw new Error("Gagal memproses pembayaran. Periksa konfigurasi Key Midtrans.");
        }
        throw new Error(data.error || "Gagal inisialisasi pembayaran");
      }

      if ((window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: async function(result: any) {
            console.log("Payment Result:", result);
            
            // Call Verification API (Bypasses RLS & Checks Midtrans)
            try {
              const verifyReq = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: result.order_id })
              });

              if (verifyReq.ok) {
                setIsPremium(true);
                alert("Pembayaran Berhasil! Akun Anda kini Premium.");
                window.location.href = "/dashboard";
              } else {
                throw new Error("Verifikasi pembayaran gagal di server.");
              }
            } catch (vErr) {
               console.error("Verification Error:", vErr);
               alert("Pembayaran sukses tapi gagal verifikasi. Silakan refresh.");
               window.location.href = "/dashboard"; // Still redirect as it might be a false negative or webhook will catch up
            }
          },
          onPending: function(result: any) {
            alert("Menunggu pembayaran...");
            console.log(result);
          },
          onError: function(result: any) {
            alert("Pembayaran gagal!");
            console.log(result);
          },
          onClose: function() {
            // alert('Pembayaran dibatalkan.');
          }
        });
      } else {
        alert("Gagal memuat sistem pembayaran. Coba refresh halaman.");
      }
    } catch (err: any) {
      console.error("Error:", err);
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  // Ikon disesuaikan dengan konteks fitur (Zap untuk kecepatan, Star untuk AI, TrendingUp untuk laporan)
  const features = [
    {
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Tanpa Batas Scan",
      desc: "Scan makanan sepuasnya tanpa kuota harian.",
      color: "bg-yellow-500"
    },
    {
      icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Analisis AI Expert",
      desc: "Saran gizi mendalam yang dipersonalisasi.",
      color: "bg-red-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Laporan Mingguan",
      desc: "Grafik progres kesehatan lebih mendetail.",
      color: "bg-green-500"
    }
  ];

  const checkItems = ["Akses Seluruh Fitur AI", "Update Berkala Tanpa Biaya", "Tanpa Iklan Pengganggu"];

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Brutal Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center pt-16 pb-10 px-4 relative z-10">
        <motion.div 
          className="max-w-6xl w-full mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* KOLOM KIRI: Judul & Fitur */}
            <motion.div variants={containerVariants} className="space-y-6 sm:space-y-10">
              <motion.div variants={headerVariants}>
                <motion.div
                  variants={itemVariants}
                  className="inline-block bg-black text-white px-4 py-1 mb-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  <span className="font-black text-xs sm:text-sm uppercase tracking-widest">SI KALORI PLUS</span>
                </motion.div>
                <motion.h1 
                  variants={headerVariants}
                  className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.85] text-black uppercase"
                >
                  UPGRADE<br />
                  <span className="text-yellow-500">LEVEL.</span>
                </motion.h1>
              </motion.div>

              <motion.div variants={containerVariants} className="space-y-5">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    variants={featureVariants}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-5 group"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`${f.color} border-2 sm:border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all`}
                    >
                      <div className="text-white">{f.icon}</div>
                    </motion.div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black uppercase leading-none mb-1">{f.title}</h3>
                      <p className="text-sm sm:text-base font-bold text-gray-600 uppercase italic">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* KOLOM KANAN: Pricing Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="bg-white border-[6px] sm:border-[8px] border-black p-8 sm:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
              {/* Akses dekoratif khas Brutalist */}
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 12 }}
                transition={{ delay: 0.5, type: "spring" as const, stiffness: 100 }}
                className="absolute -top-6 -right-6 bg-yellow-400 w-24 h-24 border-4 border-black flex items-end justify-center pb-2"
              >
                 <Crown className="w-10 h-10 text-black" />
              </motion.div>
              
              <div className="relative z-10">
                <motion.h2 
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl font-black uppercase mb-1 italic tracking-tighter"
                >
                  LANGGANAN BULANAN
                </motion.h2>
                <motion.p 
                  variants={itemVariants}
                  className="font-bold mb-8 uppercase text-xs sm:text-sm border-b-4 border-black pb-2 inline-block"
                >
                  Bebas berhenti kapan saja
                </motion.p>
                
                <motion.div 
                  variants={itemVariants}
                  className="mb-10 flex items-baseline"
                >
                  <span className="text-2xl sm:text-3xl font-black uppercase italic mr-1">Rp</span>
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" as const, stiffness: 80 }}
                    className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter italic"
                  >
                    16
                  </motion.span>
                  <span className="text-2xl sm:text-3xl font-black uppercase italic">.000<span className="text-sm lowercase">/bln</span></span>
                </motion.div>

                <motion.div variants={containerVariants} className="space-y-4 mb-10">
                  {checkItems.map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      variants={checkItemVariants}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 font-black uppercase text-xs sm:text-sm italic"
                    >
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className="bg-black text-white p-1 border-2 border-black"
                      >
                        <Check size={16} strokeWidth={4} />
                      </motion.div>
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  disabled={loading || isPremium || !scriptLoaded}
                  className={`w-full py-5 sm:py-7 font-black text-xl sm:text-3xl uppercase italic border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all flex items-center justify-center gap-4 ${
                    isPremium ? 'bg-green-500 cursor-default' : 'bg-black text-white hover:bg-gray-800'
                  } ${!scriptLoaded ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : isPremium ? (
                    'SUDAH PREMIUM'
                  ) : !scriptLoaded ? (
                    'Memuat Sistem...'
                  ) : (
                    'Bayar Sekarang'
                  )}
                </motion.button>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>

      {/* Aksen Geometris Samping */}
       <motion.div 
         initial={{ height: 0 }}
         animate={{ height: 128 }}
         transition={{ delay: 0.8, duration: 0.5 }}
         className="absolute top-1/2 right-0 w-1 bg-black hidden lg:block" 
       />
      
       <Script 
         src="https://app.sandbox.midtrans.com/snap/snap.js"
         data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""} 
         strategy="lazyOnload" 
         onLoad={() => setScriptLoaded(true)}
       />
    </div>
  );
}