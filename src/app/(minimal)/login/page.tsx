"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, Zap, Lock, ArrowLeft } from "lucide-react";
import { motion, type Variants } from "framer-motion";
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

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.215, 0.610, 0.355, 1.000] as const,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.610, 0.355, 1.000] as const,
      },
    },
  };

  const backButtonVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  const featureVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.215, 0.610, 0.355, 1.000] as const,
      },
    },
  };

  const syncProfileToDatabase = useCallback(async (user: User) => {
    try {
      const { data: profile, error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || "User SiKalori",
          last_login: new Date().toISOString(),
        }, { onConflict: "id" })
        .select("daily_target")
        .single();

      if (upsertError) throw upsertError;

      if (!profile?.daily_target) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      console.error("Sync Error:", err.message);
      alert(`Gagal sinkronisasi profil: ${err.message}`);
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

      if (error) {
        let errorMsg = error.message;
        if (errorMsg.includes("audience")) {
          errorMsg = "Client ID tidak terdaftar di 'Allowed Client IDs' Supabase.";
        } else if (errorMsg.includes("redirect_uri")) {
          errorMsg = "Redirect URI mismatch. Cek Google Cloud Console.";
        }
        
        alert(`Auth Error: ${errorMsg}`);
        throw error;
      }
      
      if (data.user) {
        await syncProfileToDatabase(data.user);
      }
    } catch (error: any) {
      console.error("Auth Error Detail:", error);
      setLoading(false);
    }
  }, [syncProfileToDatabase]);

  useEffect(() => {
    const googleClientId = "947157028356-ijdk5tmms7acg41nqc2vtk1shtirmlk8.apps.googleusercontent.com";

    const loadGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          ux_mode: "popup", 
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById("google-button-container"),
          { 
            theme: "filled_black", 
            size: "large", 
            width: "350", 
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
  }, [handleGoogleResponse]);

  return (
    <div className="min-h-screen bg-[#FFDE59] flex flex-col items-center justify-center p-6 font-mono relative overflow-hidden">
      


      {/* Back Button */}
      <motion.div 
        className="w-full max-w-[450px] mb-4"
        variants={backButtonVariants}
        initial="hidden"
        animate="visible"
      >
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        className="relative z-10 w-full max-w-[450px] bg-white border-[8px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-10"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Inner Content with Stagger */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <motion.div 
              className="inline-flex items-center gap-2 bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Lock size={12} /> Secure Access
            </motion.div>
            <h1 className="text-7xl font-black italic tracking-tighter leading-none mb-4 text-black uppercase">
              SIKALORI
            </h1>
            <p className="font-bold text-lg leading-tight uppercase text-black">
              Pantau nutrisi harianmu dalam satu ketukan.
            </p>
          </motion.div>

          {/* Form Section */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="space-y-4">
              <motion.div 
                id="google-button-container" 
                className={`w-full border-4 border-black p-2 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer ${loading ? 'opacity-40 pointer-events-none' : ''}`}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {/* SDK Button rendered here */}
              </motion.div>

              {loading && (
                <motion.div 
                  className="flex items-center justify-center gap-3 py-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Loader2 className="animate-spin text-black" size={20} />
                  <span className="font-black text-[10px] uppercase italic tracking-widest text-black">
                    Memuat Data Anda...
                  </span>
                </motion.div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-3 border-t-4 border-black pt-8">
              <motion.div 
                variants={featureVariants}
                className="flex items-center gap-4 bg-gray-100 border-4 border-black p-4"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="bg-yellow-400 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Zap size={20} className="text-black" />
                </motion.div>
                <span className="text-[11px] font-black uppercase leading-tight text-black">
                  Analisis AI Secepat Kilat
                </span>
              </motion.div>
              
              <motion.div 
                variants={featureVariants}
                className="flex items-center gap-4 bg-gray-100 border-4 border-black p-4"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="bg-green-400 p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ShieldCheck size={20} className="text-black" />
                </motion.div>
                <span className="text-[11px] font-black uppercase leading-tight text-black">
                  Sistem Terenkripsi Cloud
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 pt-6 border-t-4 border-black text-center"
          >
            <p className="text-[9px] font-black uppercase text-gray-500 leading-relaxed">
              © SIKALORI - Smart Nutrition Tracker.<br />
              Powered by Next.js 15 & Supabase.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}