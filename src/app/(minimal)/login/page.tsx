"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Zap, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

declare global {
  interface Window {
    google: any;
  }
}

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // Ganti dengan Client ID Google Anda jika berbeda
          client_id: "947157028356-ijdk5tmms7acg41nqc2vtk1shtirmlk8.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById("google-button-container"),
          { 
            theme: "filled_black", 
            size: "large", 
            width: "320", 
            text: "continue_with",
            shape: "square" 
          }
        );
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = loadGoogle;
    document.body.appendChild(script);

    return () => {
      const scriptTag = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptTag) document.body.removeChild(scriptTag);
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) throw error;

      if (data.user) {
        await syncProfileToDatabase(data.user);
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      alert("Gagal masuk dengan Google. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const syncProfileToDatabase = async (user: any) => {
    try {
      // Menyimpan data user ke tabel profiles agar tersimpan di database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'User SiKalori',
          picture: user.user_metadata?.avatar_url,
          last_login: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;

      // Local storage untuk session Navbar
      localStorage.setItem('user_session', JSON.stringify({
        name: user.user_metadata?.full_name,
        email: user.email,
        picture: user.user_metadata?.avatar_url,
      }));

      router.push("/dashboard");
    } catch (err) {
      console.error("Sync Error:", err);
      // Tetap arahkan ke dashboard karena auth Supabase sudah berhasil
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFDE59] flex flex-col items-center justify-center p-6 font-mono relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} 
      />

      <div className="relative z-10 w-full max-w-[450px] bg-white border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Lock size={12} /> Secure Access
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter leading-none mb-4 text-black">
            SIKALORI
          </h1>
          <p className="font-bold text-lg leading-tight uppercase text-black">
            Pantau nutrisi harianmu dalam satu ketukan.
          </p>
        </div>

        <div className="space-y-8">
          {/* Fitur Highlights */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-4 bg-gray-100 border-4 border-black p-4 transition-transform hover:-rotate-1">
              <div className="bg-yellow-400 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Zap size={20} className="text-black" />
              </div>
              <span className="text-[11px] font-black uppercase leading-tight">Analisis AI Secepat Kilat</span>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-100 border-4 border-black p-4 transition-transform hover:rotate-1">
              <div className="bg-green-400 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck size={20} className="text-black" />
              </div>
              <span className="text-[11px] font-black uppercase leading-tight">Database Terenkripsi</span>
            </div>
          </div>

          {/* Google Button Container */}
          <div className="space-y-4">
            <div 
              id="google-button-container" 
              className="w-full border-4 border-black p-2 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
            >
              {/* Google Button akan muncul di sini */}
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-black" size={20} />
                <span className="font-black text-xs uppercase italic tracking-widest">Memproses Autentikasi...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t-4 border-black text-center">
          <p className="text-[9px] font-black uppercase text-gray-400 leading-relaxed">
            Tanpa pendaftaran formulir. Masuk aman menggunakan akun Google Anda. 
            Data Anda otomatis tersinkronisasi ke Cloud.
          </p>
        </div>
      </div>
    </div>
  );
}