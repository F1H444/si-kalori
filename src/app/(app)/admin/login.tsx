"use client";

import { useState } from "react";
import { Shield, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError("");

    // Define the full login process
    const performLogin = async () => {
      console.log("[LOGIN] Starting Supabase Auth...");
      // 1. Authenticate with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        console.error("[LOGIN] Supabase Auth Failed:", authError);
        throw authError; // Re-throw to be caught below
      }
      
      if (!data.user) {
        console.error("[LOGIN] No user data returned.");
        throw new Error("User not found");
      }
      
      console.log("[LOGIN] Supabase Auth Success. User ID:", data.user.id);
      console.log("[LOGIN] Verifying Admin Role via API...");

      // 2. Verify Admin Role via Secure API (Bypasses RLS)
      const verifyResponse = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: data.user.id,
          email: data.user.email  // Send email to avoid extra DB call
        }),
      });
      
      console.log("[LOGIN] API Response Status:", verifyResponse.status);

      if (!verifyResponse.ok) {
         console.error("[LOGIN] API Error Response - Status:", verifyResponse.status);
         const errorData = await verifyResponse.json().catch(() => ({}));
         console.error("[LOGIN] Error details:", errorData);
         throw new Error(errorData.details || "Gagal verifikasi admin via API.");
      }

      const verifyResult = await verifyResponse.json();
      console.log("[LOGIN] API Verify Result:", verifyResult);

      if (!verifyResult.isAdmin) {
        console.warn("[LOGIN] User is not admin. Reason:", verifyResult.reason);
        // If not set as admin, sign out
        await supabase.auth.signOut();
        throw new Error(`Akses ditolak. ${verifyResult.reason || "Akun ini bukan level Administrator."}`);
      }

      console.log("✅ [LOGIN] Admin verified successfully via:", verifyResult.method);

      // Success
      return data.user;
    };

    // Race against a timeout (reduced to 15 seconds for better UX)
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Koneksi lambat. Server membutuhkan waktu terlalu lama untuk merespons.")), 15000)
      );

      const user = await Promise.race([performLogin(), timeoutPromise]);

      console.log("✅ [LOGIN] Success! Setting session...");
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_user", JSON.stringify(user));
      onLoginSuccess();
    } catch (error: any) {
      console.error("❌ [LOGIN] Login error:", error);
      setLoginError(error.message || "Gagal masuk. Cek email dan password.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden font-mono text-black">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-400 p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Shield className="w-12 h-12 text-black" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-center mb-2 tracking-tighter uppercase italic">Admin Portal</h1>
          <p className="text-center text-gray-500 font-bold mb-8 uppercase text-xs tracking-[0.3em]">Authorized Personnel Only</p>

          <form onSubmit={handleAccountLogin} className="space-y-4">
            <div className="space-y-1 text-black">
              <label className="text-[10px] font-black uppercase tracking-widest pl-1">Email Admin</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 pl-12 border-4 border-black font-bold focus:bg-yellow-50 outline-none"
                  placeholder="admin@sikalori.com"
                />
              </div>
            </div>

            <div className="space-y-1 text-black">
              <label className="text-[10px] font-black uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pl-12 pr-12 border-4 border-black font-bold focus:bg-yellow-50 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-red-600 font-black text-[10px] uppercase border-2 border-red-600 p-2 bg-red-50">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-black text-white p-5 font-black text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase flex items-center justify-center gap-2"
            >
              {isAuthenticating ? <Loader2 className="animate-spin" /> : "Verify Access"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-4 border-black text-center">
            <a href="/" className="text-xs font-black uppercase hover:underline">← Back to Homepage</a>
          </div>
        </div>
      </div>
    </div>
  );
}
