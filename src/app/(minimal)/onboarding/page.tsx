"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import LoadingOverlay from "@/components/LoadingOverlay";
import {
  goalLabels,
  activityLabels,
  type OnboardingFormData,
} from "@/types/user";
import { calculateAllMetrics } from "@/lib/health-calculations";

// --- Komponen Picker Modern untuk Angka ---
interface ModernPickerProps {
  value: number;
  unit: string;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

const ModernPicker = ({
  value,
  unit,
  onChange,
  min = 0,
  max = 300,
}: ModernPickerProps) => {
  const increment = () => value < max && onChange(value + 1);
  const decrement = () => value > min && onChange(value - 1);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-2 sm:px-4">
      <div className="flex items-center justify-between w-full gap-4 sm:gap-10">
        <motion.button
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={decrement}
          className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:bg-red-50 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <Minus className="w-8 h-8 sm:w-12 sm:h-12 stroke-[3px]" />
        </motion.button>

        <div className="flex flex-col items-center flex-1">
          <motion.div 
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-baseline gap-2"
          >
            <span className="text-7xl sm:text-[12rem] font-black tracking-tighter tabular-nums leading-none italic">
              {value}
            </span>
            <span className="text-xl sm:text-4xl font-black text-secondary uppercase italic tracking-tighter">
              {unit}
            </span>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={increment}
          className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:bg-green-50 transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <Plus className="w-8 h-8 sm:w-12 sm:h-12 stroke-[3px]" />
        </motion.button>
      </div>
      
      <div className="w-full mt-10 relative px-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-8 bg-transparent appearance-none cursor-pointer accent-black scale-y-150"
          style={{
            WebkitAppearance: 'none',
            background: 'linear-gradient(to right, black 0%, black 100%)',
            backgroundSize: '100% 4px',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 32px;
            width: 32px;
            border-radius: 50%;
            background: #FFDE59;
            border: 4px solid black;
            box-shadow: 4px 4px 0px 0px black;
            cursor: pointer;
            margin-top: -2px;
          }
        `}</style>
      </div>
    </div>
  );
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auth Check
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      const onboardTimeout = setTimeout(() => {
        if (isMounted && isCheckingAuth) {
          console.warn("⚠️ Onboarding auth timeout");
          setIsCheckingAuth(false);
        }
      }, 10000);

      try {
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (isMounted) router.push("/login");
          return;
        }

        const [profileRes, adminRes] = await Promise.all([
          supabase.from("users").select("has_completed_onboarding").eq("id", user.id).single(),
          supabase.from("admins").select("role").eq("user_id", user.id).maybeSingle()
        ]);

        const isAdmin = !!adminRes.data || user.email?.toLowerCase() === "admin@sikalori.com";

        if (isAdmin && isMounted) {
          router.replace("/admin");
          return;
        }

        if (profileRes.data?.has_completed_onboarding) {
          if (isMounted) router.replace("/dashboard");
          return;
        }
      } catch (err) {
        console.error("Auth check error in onboarding:", err);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
          clearTimeout(onboardTimeout);
        }
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, [router]);

  const [formData, setFormData] = useState<OnboardingFormData>({
    goal: "maintain",
    weight: 65,
    height: 170,
    age: 25,
    gender: "male",
    activityLevel: "moderate",
    targetWeight: 60,
    dietPreference: "normal",
  });

  // Loading Screen to prevent flashing
  if (isCheckingAuth) return <LoadingOverlay message="MENGECEK SESI..." />;
  if (loading) return <LoadingOverlay message="MENYIMPAN DATA..." />;

  const totalSteps = 8; // Goal, Gender, Age, Weight, Target, Height, Activity, Summary

  // --- Simpan ke Supabase ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Sesi berakhir. Silakan login kembali.");
        return router.push("/login");
      }

      // Hitung target kalori harian menggunakan library pusat
      const metrics = calculateAllMetrics(
        formData.weight,
        formData.height,
        formData.age,
        formData.gender,
        formData.activityLevel,
        formData.goal,
      );

      const dailyTargetValue = metrics.recommendedCalories;

      // Kirim ke tabel users (Update Schema Baru)
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        full_name: user.user_metadata.full_name || "User Baru",
        email: user.email,
        
        // Data Biologis
        gender: formData.gender,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        
        // Target & Preferensi
        activity_level: formData.activityLevel, // Mapping camelCase -> snake_case
        goal: formData.goal,
        target_weight: formData.targetWeight,
        diet_preference: formData.dietPreference,
        
        // System
        daily_calorie_target: dailyTargetValue,
        has_completed_onboarding: true,
      });

      if (error) throw error;
      
      // Delay sedikit agar terasa mulus
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Gunakan window.location untuk hard navigation agar fresh
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }

    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error:", err.message);
      alert("Gagal menyimpan profil: " + err.message);
      setLoading(false); // Stop loading only on error
    }
  };

  const nextStep = () => {
    if (currentStep === totalSteps - 1) handleSubmit();
    else setCurrentStep((prev) => prev + 1);
  };

  const updateData = <K extends keyof OnboardingFormData>(
    field: K,
    value: OnboardingFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-blue-50 text-black font-mono flex flex-col">
      {/* Progress Bar Atas */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-black"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col p-4 pt-20 sm:p-6 sm:pt-24 items-center justify-center max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ x: -20, opacity: 0 }}
            className="w-full"
          >
            {/* Step 1: Goal */}
            {currentStep === 0 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase"
                >
                  Apa target utama kamu?
                </motion.h2>
                <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                  {Object.entries(goalLabels).map(([key, label]) => (
                    <motion.button
                      key={key}
                      variants={itemVariants}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        updateData("goal", key as OnboardingFormData["goal"])
                      }
                      className={`p-6 border-4 border-black text-left flex flex-col justify-between transition-all min-h-[140px] ${
                        formData.goal === key
                          ? "bg-[#FFDE59] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1"
                          : "bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xl font-black uppercase tracking-tighter leading-none">{label}</span>
                        {formData.goal === key && <Check strokeWidth={6} size={24} className="text-black" />}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">
                        {key === 'lose' ? "Kurangi lemak tubuh secara sehat." : 
                         key === 'maintain' ? "Pertahankan berat badan idealmu." :
                         key === 'gain' ? "Tingkatkan masa otot dan berat badan." :
                         "Mulai gaya hidup sehat sekarang."}
                      </p>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Gender */}
            {currentStep === 1 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase"
                >
                  Jenis Kelamin
                </motion.h2>
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full px-2"
                >
                  {["male", "female"].map((g) => (
                    <motion.button
                      key={g}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        updateData("gender", g as OnboardingFormData["gender"])
                      }
                      className={`p-8 border-4 border-black font-black uppercase text-sm transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                        formData.gender === g
                          ? "bg-[#FFDE59] translate-x-1 translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white hover:bg-gray-50 hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{g === "male" ? "♂" : "♀"}</span>
                      {g === "male" ? "Pria" : "Wanita"}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Age */}
            {currentStep === 2 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase"
                >
                  Usia Kamu
                </motion.h2>
                <motion.div variants={itemVariants}>
                  <ModernPicker
                    value={formData.age}
                    unit="tahun"
                    onChange={(v: number) => updateData("age", v)}
                    min={10}
                    max={100}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Step 4: Weight */}
            {currentStep === 3 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase"
                >
                  Berat Saat Ini
                </motion.h2>
                <motion.div variants={itemVariants}>
                  <ModernPicker
                    value={formData.weight}
                    unit="kg"
                    onChange={(v: number) => updateData("weight", v)}
                    min={30}
                    max={200}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Step 5: Target Weight - NEW */}
            {currentStep === 4 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase"
                >
                  Target Berat
                </motion.h2>
                 <p className="text-gray-500 font-bold uppercase tracking-widest text-xs sm:text-sm">
                    {formData.goal === 'lose' ? "Ayo turunkan berat badanmu!" : 
                     formData.goal === 'gain' ? "Ayo tambah massa tubuhmu!" : 
                     "Jaga berat badan idealmu!"}
                 </p>
                <motion.div variants={itemVariants}>
                  <ModernPicker
                    value={formData.targetWeight || formData.weight} // Fallback to current weight
                    unit="kg"
                    onChange={(v: number) => updateData("targetWeight", v)}
                    min={30}
                    max={200}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Step 6: Height */}
            {currentStep === 5 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase"
                >
                  Tinggi Badan
                </motion.h2>
                <motion.div variants={itemVariants}>
                  <ModernPicker
                    value={formData.height}
                    unit="cm"
                    onChange={(v: number) => updateData("height", v)}
                    min={100}
                    max={250}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Step 7: Activity Level */}
            {currentStep === 6 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase"
                >
                  Tingkat Aktivitas
                </motion.h2>
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2"
                >
                  {Object.entries(activityLabels).map(([key, label]) => (
                    <motion.button
                      key={key}
                      variants={itemVariants}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        updateData(
                          "activityLevel",
                          key as OnboardingFormData["activityLevel"],
                        )
                      }
                      className={`p-6 border-4 border-black text-left flex flex-col justify-between transition-all min-h-[120px] ${
                        formData.activityLevel === key
                          ? "bg-[#FFDE59] translate-x-1 translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xl font-black uppercase tracking-tighter leading-none">{label.split('(')[0]}</span>
                        {formData.activityLevel === key && <Check strokeWidth={6} size={20} className="text-black" />}
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none italic">
                        {label.includes('(') ? label.split('(')[1].replace(')', '') : ""}
                      </p>
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Step 8: Summary & Final Result */}
            {currentStep === 7 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.div variants={itemVariants}>
                  <Sparkles className="mx-auto w-16 h-16 text-yellow-400" />
                </motion.div>
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase"
                >
                  Rencana Harian Kamu
                </motion.h2>
                <motion.div
                  variants={itemVariants}
                  className="p-8 sm:p-12 border-4 sm:border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white text-left font-black uppercase space-y-8 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] sm:text-xs">
                    SIKALORI ANALYSIS
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 italic">
                      Target Kalori Harian
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl sm:text-9xl text-black leading-none">
                        {
                          calculateAllMetrics(
                            formData.weight,
                            formData.height,
                            formData.age,
                            formData.gender,
                            formData.activityLevel,
                            formData.goal,
                          ).recommendedCalories
                        }
                      </span>
                      <span className="text-xl sm:text-4xl text-secondary">KCAL</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t-4 border-black pt-8 text-black">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 leading-none">Objektif</p>
                      <p className="text-sm sm:text-xl leading-none">
                        {formData.goal === "lose"
                          ? "Turun Berat"
                          : formData.goal === "gain"
                            ? "Nambah Berat"
                            : "Jaga Berat"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 leading-none">Profil Fisik</p>
                      <p className="text-sm sm:text-xl leading-none">{formData.age}th • {formData.weight}kg → <span className="text-blue-600">{formData.targetWeight}kg</span></p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] text-gray-400 leading-none">Aktivitas</p>
                      <p className="text-sm sm:text-xl leading-none italic">
                        {activityLabels[formData.activityLevel as keyof typeof activityLabels]?.split('(')[0] || formData.activityLevel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border-2 border-black border-dashed text-[10px] sm:text-xs text-black normal-case font-bold leading-relaxed">
                    *Rencana ini dibuat berdasarkan data fisikmu. Kami merekomendasikan untuk konsisten mencatat makanan setiap hari untuk hasil maksimal.
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="p-4 sm:p-6 border-t-[4px] sm:border-t-8 border-black bg-white sticky bottom-0 z-40">
        <div className="flex gap-3 sm:gap-4 max-w-4xl mx-auto">
          {currentStep > 0 && (
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="p-4 sm:p-6 border-4 border-black hover:bg-gray-50 active:translate-y-1 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={3} />
            </motion.button>
          )}
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            disabled={loading}
            className="flex-1 h-16 sm:h-20 bg-black text-white font-black text-lg sm:text-3xl flex items-center justify-center gap-2 sm:gap-4 shadow-[4px_4px_0px_0px_#FFDE59] sm:shadow-[8px_8px_0px_0px_#FFDE59] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 uppercase italic"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-white border-t-transparent rounded-full"
                />
                <span className="text-sm">MEMPROSES...</span>
              </div>
            ) : (
              <>
                {currentStep === totalSteps - 1 ? "MULAI SEKARANG" : "LANJUT"}
                <ArrowRight size={28} strokeWidth={4} />
              </>
            )}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
