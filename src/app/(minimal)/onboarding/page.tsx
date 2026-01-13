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
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-center w-full gap-4 sm:gap-10">
        <button
          onClick={decrement}
          className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90"
        >
          <Minus size={32} />
        </button>

        <div className="flex flex-col items-center min-w-[120px]">
          <div className="flex items-baseline gap-1">
            <span className="text-7xl sm:text-9xl font-black tracking-tighter tabular-nums">
              {value}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-400 uppercase italic">
              {unit}
            </span>
          </div>
        </div>

        <button
          onClick={increment}
          className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90"
        >
          <Plus size={32} />
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer mt-12 accent-black"
      />
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
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user already finished onboarding
      const { data: profile } = await supabase
        .from("users")
        .select("daily_target")
        .eq("id", user.id)
        .single();

      if (profile?.daily_target) {
        router.replace("/dashboard");
        return;
      }

      setIsCheckingAuth(false);
    };
    checkAuth();
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
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalSteps = 7; // Goal, Gender, Age, Weight, Height, Activity, Summary

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

      // Kirim ke tabel profiles
      const { error } = await supabase.from("users").upsert([
        {
          id: user.id, // uuid
          full_name: user.user_metadata.full_name || "User", // text
          gender: formData.gender, // text
          age: formData.age, // int4
          weight: formData.weight, // int4
          height: formData.height, // int4
          activity_level: formData.activityLevel, // text
          goal: formData.goal, // text
          daily_target: dailyTargetValue, // int4 (Pastikan kolom ini ada di Supabase!)
        },
      ]);

      if (error) throw error;

      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error:", err.message);
      alert("Gagal menyimpan profil: " + err.message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-white text-black font-mono flex flex-col">
      {/* Progress Bar Atas */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gray-100 z-50">
        <motion.div
          className="h-full bg-black"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      <main className="flex-1 flex flex-col p-6 pt-16 items-center justify-center max-w-4xl mx-auto w-full">
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
                  className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase"
                >
                  Apa target utama kamu?
                </motion.h2>
                <motion.div variants={containerVariants} className="grid gap-4">
                  {Object.entries(goalLabels).map(([key, label]) => (
                    <motion.button
                      key={key}
                      variants={itemVariants}
                      onClick={() =>
                        updateData("goal", key as OnboardingFormData["goal"])
                      }
                      className={`p-6 border-4 border-black text-2xl font-black flex justify-between items-center transition-all ${
                        formData.goal === key
                          ? "bg-[#FFDE59]"
                          : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1"
                      }`}
                    >
                      {label.toUpperCase()}
                      {formData.goal === key && <Check strokeWidth={4} />}
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
                  className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase"
                >
                  Jenis Kelamin
                </motion.h2>
                <motion.div
                  variants={containerVariants}
                  className="flex gap-4 justify-center"
                >
                  {["male", "female"].map((g) => (
                    <motion.button
                      key={g}
                      variants={itemVariants}
                      onClick={() =>
                        updateData("gender", g as OnboardingFormData["gender"])
                      }
                      className={`flex-1 p-8 border-4 border-black text-2xl font-black uppercase transition-all ${
                        formData.gender === g
                          ? "bg-[#FFDE59]"
                          : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1"
                      }`}
                    >
                      {g === "male" ? "LAKI-LAKI" : "PEREMPUAN"}
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
                  className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase"
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
                  className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase"
                >
                  Berat Badan
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

            {/* Step 5: Height */}
            {currentStep === 4 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase"
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

            {/* Step 6: Activity Level */}
            {currentStep === 5 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase"
                >
                  Tingkat Aktivitas
                </motion.h2>
                <motion.div variants={containerVariants} className="grid gap-4">
                  {Object.entries(activityLabels).map(([key, label]) => (
                    <motion.button
                      key={key}
                      variants={itemVariants}
                      onClick={() =>
                        updateData(
                          "activityLevel",
                          key as OnboardingFormData["activityLevel"],
                        )
                      }
                      className={`p-4 border-4 border-black text-xl font-black flex justify-between items-center transition-all ${
                        formData.activityLevel === key
                          ? "bg-[#FFDE59]"
                          : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1"
                      }`}
                    >
                      {label.toUpperCase()}
                      {formData.activityLevel === key && (
                        <Check strokeWidth={4} />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Step 7: Summary & Final Result */}
            {currentStep === 6 && (
              <motion.div
                variants={containerVariants}
                className="space-y-8 text-center"
              >
                <motion.div variants={itemVariants}>
                  <Sparkles className="mx-auto w-16 h-16 text-[#FFDE59]" />
                </motion.div>
                <motion.h2
                  variants={itemVariants}
                  className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase"
                >
                  Rencana Harian Kamu
                </motion.h2>
                <motion.div
                  variants={itemVariants}
                  className="p-8 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white text-left font-black uppercase space-y-4"
                >
                  <div>
                    <p className="text-sm text-gray-500">
                      Target Kalori Harian
                    </p>
                    <p className="text-5xl text-black">
                      {
                        calculateAllMetrics(
                          formData.weight,
                          formData.height,
                          formData.age,
                          formData.gender,
                          formData.activityLevel,
                          formData.goal,
                        ).recommendedCalories
                      }{" "}
                      KCAL
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t-4 border-black pt-4 text-black">
                    <p>
                      Target:{" "}
                      {formData.goal === "lose"
                        ? "Turun BB"
                        : formData.goal === "gain"
                          ? "Nambah BB"
                          : "Jaga BB"}
                    </p>
                    <p>Usia: {formData.age}th</p>
                    <p>Berat: {formData.weight}kg</p>
                    <p>Tinggi: {formData.height}cm</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigasi Footer */}
      <footer className="p-6 border-t-8 border-black bg-white sticky bottom-0">
        <div className="flex gap-4 max-w-2xl mx-auto">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="p-6 border-4 border-black hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeft size={28} strokeWidth={3} />
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={loading}
            className="flex-1 h-20 bg-black text-white font-black text-2xl flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {currentStep === totalSteps - 1 ? "MULAI SEKARANG" : "LANJUT"}
                <ArrowRight size={28} strokeWidth={3} />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
