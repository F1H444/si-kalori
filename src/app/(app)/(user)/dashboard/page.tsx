"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Scale,
  Ruler,
  Calendar,
  User as UserIcon,
  Flame,
  Dumbbell,
  Crown,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, lazy } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";

// Lazy load WeeklyReport for code splitting
const WeeklyReport = lazy(() => import("@/components/WeeklyReport"));

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

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

interface UserProfile {
  id: string;
  full_name: string | null;
  daily_calorie_target: number;
  weight: number;
  height: number;
  age: number;
  gender: string;
  goal: string;
  activity_level: string;
  is_premium?: boolean;
  premium_expired_at?: string | null;
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<LoadingOverlay message="MENYIAPKAN PANEL..." isFullPage={false} />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("⚠️ Dashboard data fetching timed out, forcing loading to false...");
        setLoading(false);
      }
    }, 10000); // 10 seconds safety

    const fetchUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error("Auth error or no user:", authError);
          if (isMounted) router.push("/login");
          return;
        }

        // Parallelize initial checks with timeout protection
        const [profileRes, adminRes] = await Promise.all([
          supabase.from("users").select("*").eq("id", user.id).single(),
          supabase.from("admins").select("role").eq("user_id", user.id).maybeSingle()
        ]);

        const isAdmin = !!adminRes.data || user.email?.toLowerCase() === "admin@sikalori.com";

        if (isAdmin && isMounted) {
          console.log("🛡️ [Dashboard] Admin detected, redirecting to admin panel...");
          router.push("/admin");
          return;
        }

        const data = profileRes.data;
        if (!data || profileRes.error || !data.has_completed_onboarding) {
          if (isMounted) router.push("/onboarding");
          return;
        }

        // Parallelize premium detail checks
        let isPremium = !!data.is_premium;
        let premium_expired_at = data.premium_expired_at || null;

        try {
          // Use a shorter internal timeout for non-critical premium checks
          const premiumCheck = Promise.all([
            supabase.from("premium").select("expired_at, status").eq("user_id", user.id).maybeSingle(),
            supabase.from("premium_subscriptions").select("expired_at, status").eq("user_id", user.id).maybeSingle()
          ]);
          
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
          const [premRes, subRes] = await Promise.race([premiumCheck, timeoutPromise]) as any;

          const premiumData = premRes?.data || subRes?.data;

          if (premiumData) {
            premium_expired_at = premiumData.expired_at;
            const now = new Date();
            const expireDate = new Date(premiumData.expired_at);
            if (premiumData.status === "active" && expireDate > now) {
              isPremium = true;
            }
          }
        } catch (e) {
          console.warn("Optional premium check skipped or delayed:", e);
        }

        if (isMounted) {
          setProfile({ ...data, is_premium: isPremium, premium_expired_at });
          // Non-blocking update
          supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id).then();
        }
      } catch (err) {
        console.error("Dashboard Speed Error:", err);
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimeout);
          setLoading(false);
        }
      }
    };
    fetchUserData();
    return () => { 
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [router]);

  // --- TAMPILAN LOADING BARU ---
  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[500px]">
      <LoadingOverlay message="MENYIAPKAN PANEL..." isFullPage={false} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-mono p-4 md:p-10 selection:bg-secondary">
      <motion.main
        className="max-w-7xl mx-auto space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER UTAMA */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-4 border-black pb-8 relative"
        >
          {/* Payment Status Overlay */}
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
            {paymentStatus === "success" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500 text-white px-4 py-1 border-2 border-black font-black uppercase italic text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-auto"
              >
                ✓ PEMBAYARAN BERHASIL! Selamat Datang di Premium.
              </motion.div>
            )}
            {paymentStatus === "pending" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-400 text-black px-4 py-1 border-2 border-black font-black uppercase italic text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] pointer-events-auto"
              >
                ! PEMBAYARAN SEDANG DIPROSES. Cek lagi nanti ya.
              </motion.div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserIcon size={16} className="text-secondary" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                Dashboard
              </p>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Halo, {profile?.full_name?.split(" ")[0] || "USER"}.
            </h1>
          </div>

          <Link href="/scan" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-secondary border-4 border-black font-black text-xl italic shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase flex items-center justify-center gap-3 group text-black"
            >
              Scan Makanan &amp; Minuman
            </motion.button>
          </Link>
        </motion.div>

        {/* SECTION 1: TARGET KALORI & METRIK UTAMA */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Kartu Kalori Besar */}
          <motion.div
            variants={scaleVariants}
            className="lg:col-span-8 bg-white border-4 border-black p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] md:shadow-[12px_12px_0px_0px_rgba(34,197,94,1)] flex flex-col justify-between min-h-[350px] md:min-h-[450px]"
          >
            <div className="flex justify-between items-start">
              <div className="bg-primary text-white p-3 md:p-4 shadow-[4px_4px_0px_0px_#F97316]">
                <Flame size={32} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  Objektif Fokus
                </p>
                <p className="text-xl md:text-3xl font-black uppercase italic leading-none">
                  {profile?.goal === "lose"
                    ? "Turunin Berat Badan"
                    : profile?.goal === "gain"
                      ? "Nambah Berat Badan"
                      : "Jaga Berat Badan"}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-gray-400 italic underline">
                Target Energi Kamu
              </p>
              <div className="flex items-baseline gap-2 md:gap-4 overflow-hidden">
                <motion.h2
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 80 }}
                  className="text-[6rem] sm:text-[8rem] md:text-[13rem] font-black tracking-tighter leading-[0.8]"
                >
                  {profile?.daily_calorie_target}
                </motion.h2>
                <span className="text-xl md:text-3xl font-black italic uppercase text-secondary tracking-tighter">
                  Kcal
                </span>
              </div>
            </div>
          </motion.div>

          {/* Kolom Metrik Fisik */}
          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
            <motion.div
              variants={itemVariants}
              className="flex-1 bg-green-50 border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Scale size={14} /> Berat Badan
                </p>
              </div>
              <p className="text-5xl md:text-6xl font-black tracking-tighter">
                {profile?.weight}
                <span className="text-xl italic ml-2 opacity-20">kg</span>
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex-1 bg-blue-50 border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Ruler size={14} /> Tinggi Badan
                </p>
              </div>
              <p className="text-5xl md:text-6xl font-black tracking-tighter">
                {profile?.height}
                <span className="text-xl italic ml-2 opacity-20">cm</span>
              </p>
            </motion.div>

            {/* Premium Status Card */}
            {profile?.is_premium ? (
              <motion.div
                variants={itemVariants}
                className="flex-1 bg-secondary border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2">
                    <Crown size={14} /> Premium Aktif
                  </p>
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
                    1 Bulan
                  </h3>
                  {profile.premium_expired_at && (
                    <p className="text-[10px] font-bold text-black/60 uppercase mt-2 tracking-widest">
                      Berakhir: {new Date(profile.premium_expired_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="flex-1 bg-gray-100 border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Crown size={14} /> Berlangganan
                  </p>
                </div>
                <Link href="/premium">
                  <button className="w-full py-2 bg-black text-white font-black text-xs uppercase tracking-tighter shadow-[4px_4px_0px_0px_#F97316]">
                    Upgrade ke Premium
                  </button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Weekly Report for Premium Users */}
          {profile?.is_premium && (
            <motion.div variants={itemVariants} className="lg:col-span-12 mt-8">
              <Suspense fallback={<div className="h-48 bg-gray-50 border-4 border-black border-dashed animate-pulse" />}>
                <WeeklyReport userId={profile.id} />
              </Suspense>
            </motion.div>
          )}
        </motion.div>

        {/* SECTION 2: DATA BIOLOGIS & AKTIVITAS */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10"
        >
          {/* Umur */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="border-4 border-black p-6 md:p-8 bg-red-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-6">
              <Calendar size={24} />
              <span className="text-[10px] font-black uppercase text-gray-400">
                Usia
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
              {profile?.age}{" "}
              <span className="text-lg italic opacity-30">Tahun</span>
            </h3>
          </motion.div>

          {/* Jenis Kelamin */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="border-4 border-black p-6 md:p-8 bg-indigo-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-6">
              <UserIcon size={24} />
              <span className="text-[10px] font-black uppercase text-gray-400">
                Gender
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              {profile?.gender === "male" ? "Laki-laki" : "Perempuan"}
            </h3>
          </motion.div>

          {/* Aktivitas */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="sm:col-span-2 lg:col-span-1 border-4 border-black p-6 md:p-8 bg-primary text-black shadow-[6px_6px_0px_0px_#2563EB] flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-center mb-6">
              <Dumbbell size={24} className="text-black" />
              <span className="text-[10px] font-black uppercase text-black/40">
                Intensitas
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight">
                {profile?.activity_level === "sedentary"
                  ? "Jarang Gerak"
                  : profile?.activity_level === "light"
                    ? "Olahraga Ringan"
                    : profile?.activity_level === "moderate"
                      ? "Cukup Aktif"
                      : profile?.activity_level === "active"
                        ? "Sangat Aktif"
                        : profile?.activity_level === "veryActive" || profile?.activity_level === "very_active"
                          ? "Atletis"
                          : profile?.activity_level || "Tidak diisi"}
              </h3>
              <p className="text-[10px] font-bold uppercase mt-2 opacity-60">
                {profile?.activity_level === "sedentary" ? "Minimal aktivitas fisik harian." : 
                 profile?.activity_level === "light" ? "Olahraga 1-3 kali seminggu." :
                 profile?.activity_level === "moderate" ? "Olahraga 3-5 kali seminggu." :
                 profile?.activity_level === "active" ? "Olahraga 6-7 kali seminggu." :
                 profile?.activity_level === "veryActive" || profile?.activity_level === "very_active" ? "Latihan fisik berat setiap hari." :
                 "Lengkapi profil anda."}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.main>
    </div>
  );
}
