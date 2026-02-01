"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Star, 
  TrendingUp, 
  Check, 
  Crown,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import Script from "next/script";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -2 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 12,
      delay: 0.4,
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
      damping: 15,
    },
  },
};

const checkItemVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: {
    opacity: 1,
    x: 0,
  },
};

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from("users")
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

  useEffect(() => {
    // Check if Snap is already loaded periodically
    const interval = setInterval(() => {
      if ((window as any).snap) {
        setScriptLoaded(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = async () => {
    if (!user) {
       // Save intended destination
       if (typeof window !== 'undefined') {
         sessionStorage.setItem('redirect_after_login', '/premium');
       }
       window.location.href = "/login";
       return;
    }

    if (!scriptLoaded || !(window as any).snap) {
      alert("Sistem pembayaran sedang diinisialisasi, mohon tunggu 2-3 detik.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order
      const response = await fetch("/api/payment", { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat pesanan pembayaran.");
      }

      if (!data.token) {
        throw new Error("Token pembayaran tidak valid dari server.");
      }

      // 2. Open Snap Popup
      (window as any).snap.pay(data.token, {
        onSuccess: async function (result: any) {
          console.log("Midtrans Success:", result);
          setLoading(true); // Show loader during verification
          
          try {
            const verifyReq = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_id: result.order_id }),
            });

            if (verifyReq.ok) {
              setIsPremium(true);
              window.location.href = "/dashboard?payment=success";
            } else {
              window.location.href = "/dashboard?payment=pending";
            }
          } catch (vErr) {
            console.error("Verification error:", vErr);
            window.location.href = "/dashboard?payment=pending";
          }
        },
        onPending: function (result: any) {
          console.log("Midtrans Pending:", result);
          window.location.href = "/dashboard?payment=pending";
        },
        onError: function (result: any) {
          console.error("Midtrans Error:", result);
          alert("Pembayaran Gagal. Silakan coba lagi.");
          setLoading(false);
        },
        onClose: function () {
          setLoading(false);
        },
      });
    } catch (err: any) {
      console.error("Payment Process Error:", err);
      alert(err.message || "Terjadi kesalahan saat memulai pembayaran.");
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Tanpa Batas Scan",
      desc: "Scan makanan sepuasnya tanpa kuota harian.",
      color: "bg-yellow-500",
    },
    {
      icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Analisis AI Expert",
      desc: "Saran gizi mendalam yang dipersonalisasi.",
      color: "bg-red-500",
    },
    {
      icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Laporan Mingguan",
      desc: "Grafik progres kesehatan lebih mendetail.",
      color: "bg-green-500",
    },
  ];

  const checkItems = [
    "Akses Seluruh Fitur AI",
    "Update Berkala Tanpa Biaya",
    "Tanpa Iklan Pengganggu",
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-28 pb-10 px-4 sm:px-6 relative z-10">
        <motion.div
          className="max-w-6xl w-full mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* KOLOM KIRI: Judul & Fitur */}
            <motion.div
              variants={containerVariants}
              className="space-y-6 sm:space-y-10"
            >
              <motion.div variants={headerVariants}>
                <motion.div
                  variants={itemVariants}
                  className="inline-block bg-black text-white px-4 py-1 mb-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  <span className="font-black text-xs sm:text-sm uppercase tracking-widest">
                    SI KALORI PLUS
                  </span>
                </motion.div>
                <motion.h1
                  variants={headerVariants}
                  className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.85] text-black uppercase"
                >
                  UPGRADE
                  <br />
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
                      <h3 className="text-xl sm:text-2xl font-black uppercase leading-none mb-1">
                        {f.title}
                      </h3>
                      <p className="text-sm sm:text-base font-bold text-gray-600 uppercase italic">
                        {f.desc}
                      </p>
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
                transition={{
                  delay: 0.5,
                  type: "spring" as const,
                  stiffness: 100,
                }}
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
                  <span className="text-2xl sm:text-3xl font-black uppercase italic mr-1">
                    Rp
                  </span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.6,
                      type: "spring" as const,
                      stiffness: 80,
                    }}
                    className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter italic"
                  >
                    16
                  </motion.span>
                  <span className="text-2xl sm:text-3xl font-black uppercase italic">
                    .000<span className="text-sm lowercase">/bln</span>
                  </span>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  className="space-y-4 mb-10"
                >
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
                  whileHover={{ 
                    scale: 1.02,
                    x: -4,
                    y: -4,
                    boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)"
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    x: 4,
                    y: 4,
                    boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)"
                  }}
                  onClick={handleUpgrade}
                  disabled={loading || isPremium || !scriptLoaded}
                  className={`w-full py-5 sm:py-7 font-black text-xl sm:text-3xl uppercase italic border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-4 ${
                    isPremium
                      ? "bg-green-500 cursor-default"
                      : "bg-black text-white"
                  } ${!scriptLoaded || loading ? "opacity-70 cursor-wait" : "hover:bg-primary hover:text-black"}`}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                      />
                      <span>Memproses...</span>
                    </div>
                  ) : isPremium ? (
                    "SUDAH PREMIUM"
                  ) : !scriptLoaded ? (
                    "Inisialisasi..."
                  ) : (
                    "Bayar Sekarang"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
    </div>
  );
}
