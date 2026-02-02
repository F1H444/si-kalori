"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";
import { 
  User as UserIcon, 
  Mail, 
  Scale, 
  Ruler, 
  Calendar, 
  ChevronRight, 
  Save, 
  ArrowLeft,
  Loader2 
} from "lucide-react";
import { calculateAllMetrics } from "@/lib/health-calculations";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
};

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    weight: 0,
    height: 0,
    age: 0,
    gender: "",
    activity_level: "",
    goal: ""
  });

  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("⚠️ Edit Profile data fetching timed out, forcing loading to false...");
        setLoading(false);
      }
    }, 10000); // 10 seconds safety

    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          if (isMounted) {
            setLoading(false);
            router.push("/login");
          }
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (isMounted) {
          if (data) {
            setProfile({
              full_name: data.full_name || "",
              weight: data.weight || 0,
              height: data.height || 0,
              age: data.age || 0,
              gender: data.gender || "",
              activity_level: data.activity_level || "",
              goal: data.goal || ""
            });
          } else {
            console.error("Profile not found:", error);
          }
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimeout);
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => { 
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Recalculate daily calorie target
    const metrics = calculateAllMetrics(
        profile.weight,
        profile.height,
        profile.age,
        profile.gender as any,
        profile.activity_level as any,
        profile.goal as any
    );

    const { error } = await supabase
      .from("users")
      .update({
        ...profile,
        daily_calorie_target: metrics.recommendedCalories
      })
      .eq("id", user.id);

    if (error) {
      alert("Gagal memperbarui profil: " + error.message);
    } else {
      router.push("/dashboard");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[500px] bg-yellow-50">
      <LoadingOverlay message="MEMUAT PROFIL..." isFullPage={false} />
    </div>
  );

  return (
    <div className="min-h-screen bg-yellow-50 text-black font-mono p-4 md:p-10">
      <motion.div 
        className="max-w-3xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.button
          variants={itemVariants}
          onClick={() => router.back()}
          className="flex items-center gap-2 font-black uppercase text-sm mb-10 hover:text-yellow-500 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </motion.button>

        <motion.div variants={itemVariants} className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                Edit <br />
                <span className="inline-block bg-[#FFC700] text-black px-6 py-2 mt-4 border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] italic text-4xl sm:text-6xl">
                    PROFIL ANDA.
                </span>
            </h1>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-12">
          {/* Identity Section */}
          <motion.div variants={itemVariants} className="space-y-8 p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-6">
              <UserIcon size={24} className="text-yellow-500" />
              <h2 className="text-2xl font-black uppercase italic">Identitas Diri</h2>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-black uppercase tracking-wider">Nama Lengkap</label>
              <input 
                type="text" 
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                className="w-full bg-transparent border-b-8 border-black p-0 py-4 text-2xl font-bold focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Masukkan nama lengkap..."
                required
              />
            </div>
          </motion.div>

          {/* Physical Metrics Section */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
            <div className="p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(34,197,94,1)]">
                <div className="flex items-center gap-3 mb-8">
                  <Scale size={20} className="text-green-500" />
                  <h3 className="text-xl font-black uppercase italic">Berat & Tinggi</h3>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                        <span className="font-black uppercase text-xs">Berat (kg)</span>
                        <input 
                            type="number" 
                            value={profile.weight}
                            onChange={(e) => setProfile({...profile, weight: Number(e.target.value)})}
                            className="bg-transparent text-right font-black text-2xl w-24 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                        <span className="font-black uppercase text-xs">Tinggi (cm)</span>
                        <input 
                            type="number" 
                            value={profile.height}
                            onChange={(e) => setProfile({...profile, height: Number(e.target.value)})}
                            className="bg-transparent text-right font-black text-2xl w-24 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
                <div className="flex items-center gap-3 mb-8">
                  <Calendar size={20} className="text-blue-500" />
                  <h3 className="text-xl font-black uppercase italic">Usia & Gender</h3>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                        <span className="font-black uppercase text-xs">Usia (thn)</span>
                        <input 
                            type="number" 
                            value={profile.age}
                            onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
                            className="bg-transparent text-right font-black text-2xl w-24 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                        <span className="font-black uppercase text-xs">Gender</span>
                        <select 
                            value={profile.gender}
                            onChange={(e) => setProfile({...profile, gender: e.target.value})}
                            className="bg-transparent text-right font-black text-lg focus:outline-none uppercase text-black"
                        >
                            <option value="male" className="text-black">Laki-laki</option>
                            <option value="female" className="text-black">Perempuan</option>
                        </select>
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div variants={itemVariants} className="p-8 border-4 border-black bg-black text-white shadow-[8px_8px_0px_0px_rgba(250,204,21,1)]">
              <div className="flex items-center gap-3 border-b-4 border-yellow-500 pb-4 mb-8">
                  <ChevronRight size={24} className="text-yellow-500" />
                  <h2 className="text-2xl font-black uppercase italic">Gaya Hidup & Target</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-gray-500">Tingkat Aktivitas</label>
                    <select 
                        value={profile.activity_level}
                        onChange={(e) => setProfile({...profile, activity_level: e.target.value})}
                        className="w-full bg-transparent border-b-4 border-yellow-500 py-2 font-black text-lg focus:outline-none uppercase text-white"
                    >
                        <option value="sedentary" className="text-black">Jarang Gerak</option>
                        <option value="light" className="text-black">Olahraga Ringan</option>
                        <option value="moderate" className="text-black">Cukup Aktif</option>
                        <option value="active" className="text-black">Sangat Aktif</option>
                        <option value="veryActive" className="text-black">Atletis</option>
                    </select>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-gray-500">Target Utama</label>
                    <select 
                        value={profile.goal}
                        onChange={(e) => setProfile({...profile, goal: e.target.value})}
                        className="w-full bg-transparent border-b-4 border-yellow-500 py-2 font-black text-lg focus:outline-none uppercase text-white"
                    >
                        <option value="lose" className="text-black">Turunin Berat Badan</option>
                        <option value="maintain" className="text-black">Jaga Berat Badan</option>
                        <option value="gain" className="text-black">Nambah Berat Badan</option>
                    </select>
                </div>
              </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-6">
            <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#FFC700] text-black border-4 border-black p-6 font-black text-2xl uppercase italic shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-95"
            >
                {saving ? "Menyimpan..." : (
                  <>Simpan Perubahan <Save size={28} /></>
                )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
