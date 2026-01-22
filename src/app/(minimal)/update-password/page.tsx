"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";

export default function UpdatePassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionCheck, setSessionCheck] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Check if user is actually authenticated (link should handle this via hash parsing)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkSession = async () => {
      console.log("DEBUG: Starting session check...");
      
      // 1. First, check if we ALREADY have a session (likely from middleware or previously parsed)
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      console.log("DEBUG: Initial getSession check:", !!initialSession);
      
      if (initialSession) {
        setHasSession(true);
        setSessionCheck(false);
        return;
      }

      // 2. Check for 'code' in URL (PKCE)
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      console.log("DEBUG: Checking code in URL:", !!code);

      if (code) {
        console.log("DEBUG: Exchanging code for session...");
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error("DEBUG: Exchange error:", exchangeError);
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            setHasSession(true);
            setSessionCheck(false);
            return;
          }
          setError(`Gagal memproses kode: ${exchangeError.message}`);
        } else if (data.session) {
          setHasSession(true);
          setSessionCheck(false);
          return;
        }
      }

      // 3. Manual Hash Parsing (Fallback for older recovery links)
      if (window.location.hash) {
          console.log("DEBUG: Hash detected, attempting manual parse...");
          try {
              // Extract params from hash (e.g., #access_token=...&refresh_token=...)
              const hash = window.location.hash.substring(1); // remove #
              const params = new URLSearchParams(hash);
              const accessToken = params.get("access_token");
              const refreshToken = params.get("refresh_token");
              const errorDesc = params.get("error_description");

              if (errorDesc) {
                  setError(`Error dari server: ${errorDesc.replace(/\+/g, ' ')}`);
              } else if (accessToken && refreshToken) {
                  console.log("DEBUG: Found tokens in hash, setting session manually...");
                  const { data, error: setSessionError } = await supabase.auth.setSession({
                      access_token: accessToken,
                      refresh_token: refreshToken,
                  });

                  if (setSessionError) {
                      console.error("DEBUG: Manually setting session failed:", setSessionError);
                  } else if (data.session) {
                      console.log("DEBUG: Manual session set successful!");
                      setHasSession(true);
                      setSessionCheck(false);
                      return;
                  }
              }
          } catch (e) {
              console.error("DEBUG: Error parsing hash manually:", e);
          }
      }

      // 4. Wait for onAuthStateChange or delayed check
      timeoutId = setTimeout(async () => {
        const { data: { session: delayedSession } } = await supabase.auth.getSession();
        console.log("DEBUG: Delayed session check:", !!delayedSession);
        
        if (delayedSession) {
          setHasSession(true);
        } else {
          const hasHash = window.location.hash.includes("access_token");
          console.log("DEBUG: Final check. Hash has access_token:", hasHash);
          if (hasHash) {
             setError("Token terdeteksi tapi gagal diproses otomatis. Silakan refresh halaman atau coba lagi.");
          } else {
             setError("Link reset password tidak valid atau sudah kadaluarsa.");
          }
        }
        setSessionCheck(false);
      }, 3000); 
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("DEBUG: Auth event:", event, !!session);
      if (session) {
        setHasSession(true);
        setSessionCheck(false);
        if (timeoutId) clearTimeout(timeoutId);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Double check session before proceeding
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Sesi auth hilang! Silakan klik link dari email anda kembali.");
      return;
    }

    if (password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
    }

    if (password !== confirmPassword) {
      setError("Password tidak sama");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      // Removed automatic redirect as per user request

    } catch (err: any) {
      setError(err.message || "Gagal mengupdate password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAndLogin = async () => {
    // Explicitly sign out to ensure they have to log in manually
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (sessionCheck) {
     return (
        <div className="min-h-screen bg-[#FFDE59] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-black" size={40} />
                <p className="font-bold uppercase text-xs tracking-widest">Memverifikasi Sesi...</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 text-[10px] font-black underline uppercase"
                >
                  Refresh Jika Lama
                </button>
            </div>
        </div>
     )
  }

  // If no session after check, show error state
  if (!hasSession && !loading && !success) {
      const debugInfo = {
          hasSearch: typeof window !== 'undefined' ? window.location.search.length > 0 : false,
          hasHash: typeof window !== 'undefined' ? window.location.hash.length > 0 : false,
          searchParams: typeof window !== 'undefined' ? Array.from(new URLSearchParams(window.location.search).keys()) : [],
          cookies: typeof document !== 'undefined' ? document.cookie.split(';').map(c => c.split('=')[0].trim()) : [],
          localStorage: typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.includes('supabase')) : [],
      };

      return (
        <div className="min-h-screen bg-[#FFDE59] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center space-y-6"
            >
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border-4 border-black">
                        <AlertTriangle className="text-red-500" size={32} strokeWidth={3} />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase mb-2">Akses Ditolak</h2>
                    <p className="text-sm font-bold text-gray-500">
                        {error || "Link reset password tidak valid atau sudah kadaluarsa."}
                    </p>
                </div>
                
                {/* Debug Panel Section */}
                <div className="bg-gray-100 border-2 border-dashed border-black p-4 text-left font-mono text-[10px] space-y-2 overflow-auto max-h-48">
                    <p className="font-black border-b border-black pb-1 mb-2 uppercase">Debug Information (Required for Fix):</p>
                    <p><span className="font-black">URL Search:</span> {debugInfo.hasSearch ? "YES" : "NO"} ({debugInfo.searchParams.join(', ') || 'none'})</p>
                    <p><span className="font-black">URL Hash:</span> {debugInfo.hasHash ? "YES" : "NO"}</p>
                    <p><span className="font-black">Cookies:</span> {debugInfo.cookies.filter(c => c.includes('auth-token')).length > 0 ? "FOUND AUTH TOKEN" : "NO AUTH TOKEN"}</p>
                    <p><span className="font-black">LS Keys:</span> {debugInfo.localStorage.length > 0 ? debugInfo.localStorage.join(', ') : 'none'}</p>
                    <p className="pt-2 italic text-gray-400">Silakan screenshoot bagian ini dan kirimkan ke saya.</p>
                </div>

                <div className="space-y-3">
                  <button 
                      onClick={() => window.location.reload()}
                      className="block w-full bg-yellow-400 text-black border-4 border-black p-4 font-black uppercase tracking-widest hover:bg-yellow-300 transition-all"
                  >
                      Cek Lagi (Refresh Halaman)
                  </button>
                  <Link 
                      href="/forgot-password"
                      className="block w-full bg-black text-white p-4 font-black uppercase tracking-widest hover:bg-gray-900 transition-all opacity-50 hover:opacity-100"
                  >
                      Minta Link Baru
                  </Link>
                </div>
            </motion.div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#FFDE59] flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden">
        
      <motion.div
        className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10"
        initial="initial"
        animate="animate"
        variants={containerVariants}
      >
        <AnimatePresence>
          {loading && (
            <motion.div
              className="absolute inset-0 z-50 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="animate-spin text-black mb-3" size={40} strokeWidth={3} />
              <p className="font-black uppercase text-xs tracking-widest">
                Mengupdate...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* Header Section */}
        <div className="bg-black text-white p-6 sm:p-8 text-center relative overflow-hidden">
           <div className="absolute top-2 right-2">
            <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 uppercase border border-white">
              Secure
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter leading-none mb-4">
            PASSWORD BARU
          </h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wide leading-tight mx-auto max-w-xs">
            Buat password yang kuat dan mudah diingat.
          </p>
        </div>
 
        {/* Form Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-black box-content">
                <CheckCircle2 className="text-green-600" size={32} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase">Berhasil!</h3>
                <p className="text-sm font-bold text-gray-500">
                  Password berhasil diubah. Silakan masuk kembali menggunakan password baru Anda.
                </p>
              </div>
              <button
                onClick={handleLogoutAndLogin}
                className="w-full bg-black text-white p-4 font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                Masuk Sekarang
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest block pl-1">
                  Password Baru
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 group-focus-within:text-black transition-colors"
                    size={20}
                    strokeWidth={2.5}
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border-2 border-black p-4 pl-12 font-bold focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 rounded-none text-sm sm:text-base"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest block pl-1">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 group-focus-within:text-black transition-colors"
                    size={20}
                    strokeWidth={2.5}
                  />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border-2 border-black p-4 pl-12 font-bold focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 rounded-none text-sm sm:text-base"
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
                variants={itemVariants}
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white p-4 font-black uppercase tracking-widest hover:bg-gray-900 focus:ring-4 focus:ring-yellow-400 transition-all flex items-center justify-center gap-2 group text-sm sm:text-base"
              >
                Ubah Password
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={20}
                  strokeWidth={3}
                />
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
