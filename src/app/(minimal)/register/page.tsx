"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Key,
  User,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";
import LoadingOverlay from "@/components/LoadingOverlay";

// Declare Google Sign-In types
declare global {
  interface Window {
    google: any;
  }
}

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // --- Animation Variants ---
  const containerVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  };

  const handleGoogleResponse = useCallback(
    async (response: any) => {
      setLoading(true);
      setError("");
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
        });

        if (error) throw error;

        if (data.user) {
          // Sign out immediately so they have to login
          await supabase.auth.signOut();
          router.replace("/login?registered=true");
        }
      } catch (error: any) {
        setLoading(false);
        setError(error.message || "Gagal daftar dengan Google");
      }
    },
    [router],
  );

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // If confirmation is required, data.session will be null
        if (!data.session) {
          alert("Silakan cek email kamu untuk konfirmasi akun.");
          router.replace("/login");
        } else {
          // Sign out immediately so they have to login if session was created
          await supabase.auth.signOut();
          router.replace("/login?registered=true");
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal mendaftar. Coba lagi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "947157028356-ijdk5tmms7acg41nqc2vtk1shtirmlk8.apps.googleusercontent.com";

    const loadGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse,
          ux_mode: "popup",
        });

        const container = document.getElementById("google-button-container");
        if (container) {
          container.innerHTML = "";
          // Use container width for responsiveness
          const width = container.offsetWidth;

          window.google.accounts.id.renderButton(container, {
            theme: "filled_black",
            size: "large",
            width: width, // Use pixel width
            text: "signup_with",
            shape: "square",
          });
        }
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
    <div className="min-h-screen bg-[#FFDE59] flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden">
      
      {/* Back Button Restored */}
      <div className="w-full max-w-md mb-6 relative z-10">
        <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white border-4 border-black px-4 py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
            <ArrowLeft size={16} strokeWidth={3} /> Balik Lagi
        </Link>
      </div>

      <motion.div
        className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10"
        initial="initial"
        animate="animate"
        variants={containerVariants}
      >
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && <LoadingOverlay message="MENDAFTAR..." />}
        </AnimatePresence>

        {/* Header Section */}
        <div className="bg-black text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute top-2 right-2">
                <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 uppercase border border-white">
                    Gratis
                </div>
            </div>

            <Link href="/" className="inline-flex items-center justify-center mb-6 hover:scale-105 transition-transform">
                <span className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-none">
                    SIKALORI
                </span>
            </Link>
            
            <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide leading-tight mx-auto max-w-xs">
              Mulai perjalanan sehatmu hari ini
            </p>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8 space-y-6">
            <form onSubmit={handleEmailRegister} className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest block pl-1">Nama Lengkap</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 group-focus-within:text-black transition-colors" size={20} strokeWidth={2.5} />
                        <input 
                            type="text" 
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nama Kamu"
                            className="w-full bg-gray-50 border-2 border-black p-4 pl-12 font-bold focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 rounded-none text-sm sm:text-base"
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest block pl-1">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 group-focus-within:text-black transition-colors" size={20} strokeWidth={2.5} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="w-full bg-gray-50 border-2 border-black p-4 pl-12 font-bold focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 rounded-none text-sm sm:text-base"
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest block pl-1">Password</label>
                    <div className="relative group">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 group-focus-within:text-black transition-colors" size={20} strokeWidth={2.5} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 border-2 border-black p-4 pl-12 font-bold focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 rounded-none text-sm sm:text-base"
                        />
                    </div>
                </motion.div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-100 border-2 border-red-500 text-red-600 text-xs font-bold text-center uppercase"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    variants={itemVariants}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white p-4 font-black uppercase tracking-widest hover:bg-gray-900 focus:ring-4 focus:ring-yellow-400 transition-all flex items-center justify-center gap-2 group text-sm sm:text-base h-[56px] sm:h-[64px]"
                >
                    {loading ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"
                        />
                    ) : (
                        <>
                            Daftar Sekarang
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} strokeWidth={3} />
                        </>
                    )}
                </motion.button>
            </form>

            <motion.div variants={itemVariants} className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs font-bold text-gray-400 uppercase">Atau</span>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
                <div id="google-button-container" className="w-full min-h-[44px]"></div>
                
                <div className="text-center pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-black underline decoration-2 underline-offset-4 hover:bg-yellow-200 transition-colors">
                            Masuk Di Sini
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
      </motion.div>
      
    </div>
  );
}
