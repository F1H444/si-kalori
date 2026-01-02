"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link untuk navigasi cepat
import { Loader2, ShieldCheck, Zap, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const syncProfileToDatabase = useCallback(async (user: User) => {
    try {
      const { data: profile, error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "User SiKalori",
          picture: user.user_metadata?.avatar_url,
          last_login: new Date().toISOString(),
        }, { onConflict: "id" })
        .select("daily_target")
        .single();

      if (upsertError) throw new Error(upsertError.message);

      localStorage.setItem("user_session", JSON.stringify({
        name: user.user_metadata?.full_name,
        email: user.email,
        picture: user.user_metadata?.avatar_url,
      }));

      if (!profile?.daily_target) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Critical Sync Error:", error.message || String(err));
      router.replace("/onboarding");
    }
  }, [router]);

  interface GoogleCredentialResponse {
    credential: string;
  }

  const handleGoogleResponse = useCallback(async (response: GoogleCredentialResponse) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) throw error;
      if (data.user) await syncProfileToDatabase(data.user);
    } catch (error: unknown) {
      console.error("Auth Error:", (error as Error).message || String(error));
      alert("Gagal masuk dengan Google.");
      setLoading(false);
    }
  }, [syncProfileToDatabase]);

  useEffect(() => {
    const loadGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "947157028356-ijdk5tmms7acg41nqc2vtk1shtirmlk8.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById("google-button-container"),
          { theme: "filled_black", size: "large", width: "350", text: "continue_with", shape: "square" }
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
  }, [handleGoogleResponse]);

  return (
    <div className="min-h-screen bg-[#FFDE59] flex flex-col items-center justify-center p-6 font-mono relative">
      
      {/* Tombol Kembali (Navigasi Cepat ke /) */}
      <div className="w-full max-w-[450px] mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[450px] bg-white border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Lock size={12} /> Secure Access
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter leading-none mb-4 text-black uppercase">
            SIKALORI
          </h1>
          <p className="font-bold text-lg leading-tight uppercase text-black">
            Pantau nutrisi harianmu dalam satu ketukan.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div 
              id="google-button-container" 
              className={`w-full border-4 border-black p-2 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer ${loading ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {/* SDK Button */}
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-3 py-2">
                <Loader2 className="animate-spin text-black" size={20} />
                <span className="font-black text-[10px] uppercase italic tracking-widest text-black">
                  Memuat Data Anda...
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 border-t-4 border-black pt-8">
            <div className="flex items-center gap-4 bg-gray-100 border-4 border-black p-4">
              <div className="bg-yellow-400 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Zap size={20} className="text-black" />
              </div>
              <span className="text-[11px] font-black uppercase leading-tight text-black">
                Analisis AI Secepat Kilat
              </span>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-100 border-4 border-black p-4">
              <div className="bg-green-400 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck size={20} className="text-black" />
              </div>
              <span className="text-[11px] font-black uppercase leading-tight text-black">
                Sistem Terenkripsi Cloud
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t-4 border-black text-center">
          <p className="text-[9px] font-black uppercase text-gray-500 leading-relaxed">
            © SIKALORI - Smart Nutrition Tracker.<br />
            Powered by Next.js 15 & Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}