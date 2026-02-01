"use client";

import { useState } from "react";
import { Shield, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import bcrypt from "bcryptjs";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [loginMode, setLoginMode] = useState<"account" | "key">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError("");

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!data.user) throw new Error("User not found");

      // 2. Check if user is in 'admins' table
      const { data: adminRecord, error: adminError } = await supabase
        .from("admins")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (adminError || !adminRecord) {
        // If not set as admin, sign out
        await supabase.auth.signOut();
        setLoginError("Akses ditolak. Akun ini bukan level Administrator.");
        return;
      }

      // Success
      sessionStorage.setItem("admin_auth", "true");
      sessionStorage.setItem("admin_user", JSON.stringify(data.user));
      onLoginSuccess();
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "Gagal masuk. Cek email dan password.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError("");

    try {
      const { data, error } = await supabase
        .from("admin_config")
        .select("password_hash")
        .eq("id", "admin_password")
        .single();

      if (error || !data?.password_hash) {
        setLoginError("Konfigurasi Secret Key belum diset di database.");
        return;
      }

      const isValid = await bcrypt.compare(secretKey, data.password_hash);

      if (isValid) {
        sessionStorage.setItem("admin_auth", "true");
        onLoginSuccess();
      } else {
        setLoginError("Secret Key salah!");
      }
    } catch (error) {
      setLoginError("Terjadi kesalahan sistem.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden font-mono">
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

          {/* Toggle Login Mode */}
          <div className="flex border-4 border-black mb-8 p-1 bg-gray-100">
            <button 
                onClick={() => setLoginMode("account")}
                className={`flex-1 py-2 text-xs font-black uppercase transition-all ${loginMode === 'account' ? 'bg-black text-white' : 'hover:bg-white'}`}
            >
                Email Account
            </button>
            <button 
                onClick={() => setLoginMode("key")}
                className={`flex-1 py-2 text-xs font-black uppercase transition-all ${loginMode === 'key' ? 'bg-black text-white' : 'hover:bg-white'}`}
            >
                Secret Key
            </button>
          </div>

          <form onSubmit={loginMode === 'account' ? handleAccountLogin : handleKeyLogin} className="space-y-4">
            {loginMode === 'account' ? (
              <>
                <div className="space-y-1">
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

                <div className="space-y-1">
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
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest pl-1">Master Password Key</label>
                <input
                  type="password"
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full p-4 border-4 border-black font-black text-2xl focus:bg-yellow-50 outline-none tracking-[0.5em]"
                  placeholder="••••••"
                />
              </div>
            )}

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
