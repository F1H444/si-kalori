"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Sparkles, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  goalLabels,
  activityLabels,
  dietLabels,
  type OnboardingFormData,
} from "@/types/user";

// --- Komponen Picker Modern (Fix: Auto-Expand Width) ---
const ModernPicker = ({ value, unit, onChange, min = 0, max = 300 }: any) => {
  const increment = () => value < max && onChange(value + 1);
  const decrement = () => value > min && onChange(value - 1);

  // Menghitung lebar dinamis berdasarkan jumlah digit agar tidak terpotong
  // 1 digit: ~1ch, 3 digit: ~3ch. Kita beri sedikit buffer.
  const charCount = value.toString().length;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-center w-full gap-4 sm:gap-10">
        {/* Tombol Kurangi */}
        <button
          onClick={decrement}
          className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all active:scale-90 bg-white shadow-sm"
        >
          <Minus className="w-6 h-6 sm:w-10 sm:h-10" />
        </button>

        {/* Display Angka & Input */}
        <div className="flex flex-col items-center justify-center min-w-[140px] sm:min-w-[280px]">
          <div className="relative flex items-center justify-center">
            <input
              type="number"
              value={value === 0 ? "" : value}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val > max) return onChange(max);
                onChange(isNaN(val) ? 0 : val);
              }}
              placeholder="0"
              style={{ width: `${charCount > 0 ? charCount + 0.5 : 1.5}ch` }}
              className="text-center text-8xl sm:text-[11rem] font-black bg-transparent focus:outline-none appearance-none transition-all duration-200 leading-none tracking-tighter"
            />
          </div>
          <span className="mt-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] text-gray-400">
            {unit}
          </span>
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={increment}
          className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all active:scale-90 bg-white shadow-sm"
        >
          <Plus className="w-6 h-6 sm:w-10 sm:h-10" />
        </button>
      </div>
      
      {/* Slider Visual */}
      <div className="w-full max-w-md mt-16 sm:mt-24">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between mt-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
            <span>{min}</span>
            <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    goal: "maintain",
    weight: 0,
    height: 0,
    age: 0,
    gender: "male",
    activityLevel: "moderate",
    targetWeight: 0,
    dietPreference: "normal",
  });

  const totalSteps = 8;

  const updateField = (field: keyof OnboardingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canProceed = () => {
    const { goal, weight, height, age } = formData;
    if (currentStep === 0) return !!goal;
    if (currentStep === 1) return weight > 0;
    if (currentStep === 2) return height > 0;
    if (currentStep === 3) return age > 0;
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem("user_email");
      
      if (!userEmail) {
        alert("⚠️ Anda harus login terlebih dahulu untuk menyimpan profil!");
        return router.push("/login");
      }
      
      console.log("📤 Saving profile for:", userEmail);
      console.log("📋 Profile data:", formData);
      
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, profileData: formData }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log("✅ Profile saved successfully:", result);
        alert("🎉 Profil berhasil disimpan! BMI, BMR, dan TDEE sudah dihitung otomatis.");
        router.push("/scan");
      } else {
        console.error("❌ Failed to save profile:", result);
        alert(`❌ Gagal menyimpan profil: ${result.error || "Unknown error"}\n\nDetail: ${result.details || "Cek console untuk info lebih lanjut"}`);
      }
    } catch (error) {
      console.error("💥 Error saving profile:", error);
      alert(`💥 Terjadi error: ${error instanceof Error ? error.message : "Unknown error"}\n\nCek console (F12) untuk detail.`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    // Step 0: Goal
    <div key="goal" className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-[0.85] uppercase italic">PILIH<br/>GOALS KAMU</h2>
        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Langkah awal transformasi tubuhmu.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(goalLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => updateField("goal", key)}
            className={`group p-6 rounded-3xl border-2 transition-all duration-300 flex justify-between items-center ${
              formData.goal === key ? "bg-black border-black text-white shadow-xl" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
            }`}
          >
            <span className="text-xl font-black uppercase italic tracking-tighter">{label}</span>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${formData.goal === key ? "bg-white text-black border-white" : "border-gray-200"}`}>
              {formData.goal === key && <Check size={18} strokeWidth={4} />}
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Weight
    <div key="weight" className="space-y-16">
      <h2 className="text-3xl sm:text-4xl font-black text-center uppercase italic tracking-tighter">BERAT BADAN (KG)</h2>
      <ModernPicker value={formData.weight} unit="KILOGRAM" min={0} max={250} onChange={(v: number) => updateField("weight", v)} />
    </div>,

    // Step 2: Height
    <div key="height" className="space-y-16">
      <h2 className="text-3xl sm:text-4xl font-black text-center uppercase italic tracking-tighter">TINGGI BADAN (CM)</h2>
      <ModernPicker value={formData.height} unit="CENTIMETER" min={0} max={250} onChange={(v: number) => updateField("height", v)} />
    </div>,

    // Step 3: Age
    <div key="age" className="space-y-16">
      <h2 className="text-3xl sm:text-4xl font-black text-center uppercase italic tracking-tighter">UMUR KAMU</h2>
      <ModernPicker value={formData.age} unit="TAHUN" min={0} max={100} onChange={(v: number) => updateField("age", v)} />
    </div>,

    // Step 4: Gender
    <div key="gender" className="space-y-10">
      <h2 className="text-3xl sm:text-4xl font-black text-center uppercase italic tracking-tighter">PILIH GENDER</h2>
      <div className="grid grid-cols-2 gap-4">
        {["male", "female"].map((g) => (
          <button
            key={g}
            onClick={() => updateField("gender", g)}
            className={`p-10 sm:p-14 rounded-[3rem] border-2 flex flex-col items-center gap-4 transition-all duration-300 ${
              formData.gender === g ? "bg-black border-black text-white shadow-2xl scale-[1.02]" : "bg-white border-gray-100 text-gray-300 hover:bg-gray-50"
            }`}
          >
            <span className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">{g === "male" ? "Pria" : "Wanita"}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 5: Activity Level
    <div key="activity" className="space-y-8">
      <h2 className="text-3xl sm:text-4xl font-black text-center uppercase italic tracking-tighter">TINGKAT AKTIVITAS</h2>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(activityLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => updateField("activityLevel", key)}
            className={`p-6 rounded-3xl border-2 text-center transition-all ${
              formData.activityLevel === key ? "bg-black text-white border-black shadow-lg" : "bg-white border-gray-100 text-gray-500"
            }`}
          >
            <p className="font-black uppercase tracking-widest text-sm sm:text-base italic">{label}</p>
          </button>
        ))}
      </div>
    </div>,

    // Step 6: Target Weight
    <div key="target" className="space-y-16">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">TARGET BERAT</h2>
        <p className="text-gray-400 font-bold text-[10px] mt-2 tracking-[0.3em] uppercase opacity-60">OPSIONAL</p>
      </div>
      <ModernPicker value={formData.targetWeight} unit="TARGET KG" min={0} max={250} onChange={(v: number) => updateField("targetWeight", v)} />
    </div>,

    // Step 7: Diet Preference
    <div key="diet" className="space-y-8">
      <h2 className="text-3xl sm:text-4xl font-black text-center uppercase italic tracking-tighter">POLA MAKAN</h2>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(dietLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => updateField("dietPreference", key)}
            className={`p-6 rounded-3xl border-2 transition-all ${
              formData.dietPreference === key ? "bg-black text-white border-black" : "bg-white border-gray-100 text-gray-500"
            }`}
          >
            <p className="font-black uppercase text-center tracking-widest text-sm sm:text-base italic">{label}</p>
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-black selection:text-white overflow-x-hidden">
      {/* Top Header Navigation */}
      <nav className="fixed top-0 w-full p-4 sm:p-8 flex justify-between items-center z-50 bg-white/80 backdrop-blur-md">
        <div className="flex gap-1.5 h-1.5 w-32 sm:w-48 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
        <div className="flex items-center gap-3">
           <span suppressHydrationWarning className="text-[10px] font-black tracking-[0.3em] text-gray-400 uppercase">STEP {currentStep + 1}/{totalSteps}</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full pt-28 pb-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Footer Controls */}
      <footer className="fixed bottom-0 w-full p-6 sm:p-10 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-2xl mx-auto flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-2 border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-95 bg-white shadow-sm"
            >
              <ArrowLeft size={28} />
            </button>
          )}
          
          <button
            onClick={nextStep}
            disabled={!canProceed() || loading}
            className={`flex-1 h-16 sm:h-20 rounded-3xl font-black text-xl sm:text-2xl tracking-tighter transition-all flex items-center justify-center gap-3 ${
              canProceed() && !loading
                ? "bg-black text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {currentStep === totalSteps - 1 ? "FINISH" : "CONTINUE"}
                <ArrowRight size={24} />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* CSS Reset for Number Inputs */}
      <style jsx global>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}