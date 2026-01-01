"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Target,
  Scale,
  Zap,
  Ruler,
  Calendar,
  Fingerprint,
  User as UserIcon,
  Flame,
  Dumbbell
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  id: string;
  full_name: string | null;
  daily_target: number;
  weight: number;
  height: number;
  age: number;
  gender: string;
  goal: string;
  activity_level: string;
}

export default function UserDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error:", error);
        router.push("/onboarding");
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchUserData();
  }, [router]);

  // --- TAMPILAN LOADING BARU (NEO-BRUTALIST CIRCLE) ---
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono p-6">
      <div className="relative flex items-center justify-center">
        {/* Lingkaran Statis Belakang */}
        <div className="w-24 h-24 rounded-full border-[6px] border-black opacity-10"></div>
        {/* Lingkaran Animasi Depan */}
        <div className="absolute w-24 h-24 rounded-full border-[6px] border-black border-t-yellow-400 animate-[spin_0.8s_linear_infinite]"></div>
        {/* Titik Tengah */}
        <div className="absolute w-4 h-4 bg-black rounded-full shadow-[2px_2px_0px_0px_rgba(250,204,21,1)]"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-mono p-4 md:p-10 selection:bg-yellow-400">
      <main className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER UTAMA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-4 border-black pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint size={16} className="text-yellow-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Dashboard</p>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Halo, {profile?.full_name?.split(' ')[0] || 'USER'}.
            </h1>
          </div>
          
          <Link href="/scan" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-yellow-400 border-4 border-black font-black text-xl italic shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase flex items-center justify-center gap-3 group text-black">
              Scan Makanan & Minuman
            </button>
          </Link>
        </div>

        {/* SECTION 1: TARGET KALORI & METRIK UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kartu Kalori Besar */}
          <div className="lg:col-span-8 bg-white border-4 border-black p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[350px] md:min-h-[450px]">
            <div className="flex justify-between items-start">
              <div className="bg-black text-white p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]">
                <Flame size={32} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Objektif Fokus</p>
                <p className="text-xl md:text-3xl font-black uppercase italic leading-none">
                  {profile?.goal === 'lose' ? 'Turunin Berat Badan' : profile?.goal === 'gain' ? 'Nambah Berat Badan' : 'Jaga Berat Badan'}
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-gray-400 italic underline">Target Energi Kamu</p>
              <div className="flex items-baseline gap-2 md:gap-4 overflow-hidden">
                <h2 className="text-[6rem] sm:text-[8rem] md:text-[13rem] font-black tracking-tighter leading-[0.8]">
                  {profile?.daily_target}
                </h2>
                <span className="text-xl md:text-3xl font-black italic uppercase text-yellow-500 tracking-tighter">Kcal</span>
              </div>
            </div>
          </div>

          {/* Kolom Metrik Fisik */}
          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
            <div className="flex-1 bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Scale size={14} /> Berat Badan
                </p>
              </div>
              <p className="text-5xl md:text-6xl font-black tracking-tighter">{profile?.weight}<span className="text-xl italic ml-2 opacity-20">kg</span></p>
            </div>

            <div className="flex-1 bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Ruler size={14} /> Tinggi Badan
                </p>
              </div>
              <p className="text-5xl md:text-6xl font-black tracking-tighter">{profile?.height}<span className="text-xl italic ml-2 opacity-20">cm</span></p>
            </div>
          </div>
        </div>

        {/* SECTION 2: DATA BIOLOGIS & AKTIVITAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
          
          {/* Umur */}
          <div className="border-4 border-black p-6 md:p-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <Calendar size={24} />
              <span className="text-[10px] font-black uppercase text-gray-400">Usia</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
              {profile?.age} <span className="text-lg italic opacity-30">Tahun</span>
            </h3>
          </div>

          {/* Jenis Kelamin */}
          <div className="border-4 border-black p-6 md:p-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <UserIcon size={24} />
              <span className="text-[10px] font-black uppercase text-gray-400">Gender</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              {profile?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
            </h3>
          </div>

          {/* Aktivitas */}
          <div className="sm:col-span-2 lg:col-span-1 border-4 border-black p-6 md:p-8 bg-black text-white shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-center mb-6">
              <Dumbbell size={24} className="text-yellow-400" />
              <span className="text-[10px] font-black uppercase text-gray-500">Intensitas</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-tight">
              {profile?.activity_level.replace(/_/g, ' ') === 'sedentary' ? 'Jarang Gerak' : 
               profile?.activity_level.replace(/_/g, ' ') === 'light' ? 'Olahraga Ringan' : 
               profile?.activity_level.replace(/_/g, ' ') === 'moderate' ? 'Cukup Aktif' : 
               profile?.activity_level.replace(/_/g, ' ') === 'active' ? 'Sangat Aktif' : 
               profile?.activity_level.replace(/_/g, ' ') === 'very_active' ? 'Atletis' : 
               profile?.activity_level.replace(/_/g, ' ')}
            </h3>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="pt-10 border-t-2 border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-40 italic">
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">ID Sistem: {profile?.id.substring(0,12).toUpperCase()}</p>
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">Sikalori Dashboard — 2025</p>
        </footer>

      </main>
    </div>
  );
}