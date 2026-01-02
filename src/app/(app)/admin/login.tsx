"use client";

import { useState } from "react";
import { Shield, Loader2, Link, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import bcrypt from "bcryptjs";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError("");

    try {
      // Fetch password hash from admin_config table
      const { data, error } = await supabase
        .from("admin_config")
        .select("password_hash")
        .eq("id", "admin_password")
        .single();

      if (error) {
        console.error("Error fetching admin config:", error);
        setLoginError("Authentication system error. Please contact administrator.");
        return;
      }

      if (!data || !data.password_hash) {
        setLoginError("Admin configuration not found. Please contact administrator.");
        return;
      }

      // Verify password with bcrypt
      console.log("Attempting password verification...");
      const isValid = await bcrypt.compare(password, data.password_hash);

      if (isValid) {
        console.log("Login successful!");
        sessionStorage.setItem("admin_auth", "true");
        onLoginSuccess();
        setLoginError("");
      } else {
        console.log("Password mismatch.");
        setLoginError("Invalid password! Try again.");
      }
    } catch (error) {
      console.error("Login process error:", error);
      setLoginError("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden" suppressHydrationWarning>
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 transform hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-200">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="bg-black p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-center mb-2 tracking-tight uppercase">Admin Login</h1>
          <p className="text-center text-gray-600 font-bold mb-8 uppercase text-sm">Secure Access Required</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError("");
                  }}
                  disabled={isAuthenticating}
                  className="w-full p-4 pr-12 border-4 border-black font-black text-xl focus:outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-300 placeholder:uppercase disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter Secret Key"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isAuthenticating}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {loginError && (
                <p className="mt-2 text-red-600 font-bold text-sm animate-shake">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-black text-white p-4 font-black text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>Login</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-4 border-black">
            <a
              href="/"
              className="flex items-center justify-center gap-2 text-sm font-bold hover:underline uppercase"
            >
              ← Back to Site
            </a>

          </div>
        </div>
      </div>


    </div>
  );
}
