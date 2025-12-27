"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Facebook, AlertCircle } from "lucide-react";

// --- TYPES ---
interface User {
  name: string;
  email: string;
  picture?: string;
  provider?: string;
}

declare global {
  interface Window {
    google: any;
    fbAsyncInit: any;
    FB: any;
  }
}

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- CONFIGURATION ---
  // Note: This Client ID must be authorized for http://localhost:3000 in Google Cloud Console
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "947157028356-ijdk5tmms7acg41nqc2vtk1shtirmlk8.apps.googleusercontent.com";
  const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "YOUR_FACEBOOK_APP_ID"; // Placeholder

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    if (typeof window !== "undefined" && localStorage.getItem("user_session")) {
      router.push("/");
    }

    // Load Scripts
    loadGoogleScript();
    loadFacebookScript();
  }, [router]);

  // --- SCRIPT LOADERS ---
  const loadGoogleScript = () => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  const loadFacebookScript = () => {
    if (document.getElementById("facebook-jssdk")) return;
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };

  // --- HANDLERS ---

  const handleLoginSuccess = async (user: User, provider: string) => {
    console.log("Login Success:", user);
    try {
      // Save/update user in database
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, provider }),
      });

      if (response.ok) {
        const data = await response.json();
        const savedUser = data.user;

        // UPDATE SESSION with full database profile (including isPremium, etc.)
        localStorage.setItem("user_session", JSON.stringify({ ...savedUser, provider }));
        localStorage.setItem("user_email", savedUser.email); // Required for onboarding page

        // Check if user has completed onboarding
        if (savedUser.hasCompletedOnboarding) {
          // User has completed onboarding, go to scan page
          router.push("/scan");
        } else {
          // New user, redirect to onboarding
          router.push("/onboarding");
        }
      } else {
        // If API call fails, default to homepage
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      // On error, default to homepage
      router.push("/");
    }
  };

  // 1. GOOGLE LOGIN (Token Model for Custom Button)
  const handleGoogleLogin = () => {
    setLoading(true);

    // Check if Google SDK is loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      console.error("Google SDK not loaded. window.google:", window.google);
      alert("Sistem Login Google belum siap. Mohon tunggu sebentar atau refresh halaman.");
      setLoading(false);
      return;
    }

    try {
      console.log("Initializing Google Token Client...");
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse: any) => {
          console.log("Token Response Received:", tokenResponse);
          
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // Fetch User Info using the access token
              console.log("Fetching user info...");
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              
              if (!userInfoRes.ok) {
                throw new Error(`Failed to fetch user info: ${userInfoRes.status}`);
              }

              const userInfo = await userInfoRes.json();
              console.log("User Info Received:", userInfo);

              const user: User = {
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
              };
              await handleLoginSuccess(user, "google");
            } catch (error: any) {
              console.error("Error fetching Google user info:", error);
              alert(`Gagal mengambil data profil Google: ${error.message}`);
            }
          } else {
             console.warn("No access token in response:", tokenResponse);
             if (tokenResponse.error) {
                alert(`Login Google Gagal: ${tokenResponse.error_description || tokenResponse.error}`);
             }
          }
          setLoading(false);
        },
        error_callback: (error: any) => {
          console.error("Google Auth Error Callback:", error);
          alert("Google Login Error: " + (error.message || error.type || "Unknown Error"));
          setLoading(false);
        }
      });

      // Trigger the popup
      console.log("Requesting Access Token...");
      client.requestAccessToken();
    } catch (err: any) {
      console.error("Google Init Exception:", err);
      alert(`Gagal inisialisasi Google Login: ${err.message}`);
      setLoading(false);
    }
  };

  // 2. FACEBOOK LOGIN
  const handleFacebookLogin = () => {
    if (!window.FB) {
      alert("Facebook SDK belum dimuat.");
      return;
    }
    if (FACEBOOK_APP_ID === "YOUR_FACEBOOK_APP_ID") {
      alert("Fitur Facebook Login belum dikonfigurasi (APP ID masih default).");
      return;
    }

    window.FB.login((response: any) => {
      if (response.authResponse) {
        window.FB.api('/me', { fields: 'name, email, picture' }, (userInfo: any) => {
          const user: User = {
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture?.data?.url
          };
          handleLoginSuccess(user, "facebook");
        });
      }
    }, { scope: 'public_profile,email' });
  };



  return (
    <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Patterns */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: 0.1,
        }}
      ></div>

      {/* Login Container */}
      <div
        className={`relative z-10 w-full max-w-md transition-all duration-700 ease-out ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
      >
        {/* Header Text */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="text-6xl font-black text-black mb-2 hover:scale-105 transition-transform cursor-pointer tracking-tighter">
              SI KALORI
            </h1>
          </Link>
          <div className="inline-block bg-black text-white px-4 py-1 transform -rotate-2">
            <p className="text-xl font-black tracking-widest">AKSES CEPAT</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-10">

          {/* INFO ALERT */}


          {/* BUTTONS STACK */}
          <div className="space-y-4">
            {/* 1. GOOGLE BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group w-full flex items-center justify-between bg-white text-black font-black text-lg px-6 py-5 border-4 border-black hover:bg-gray-50 transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{loading ? "LOADING..." : "GOOGLE"}</span>
              </div>
              <ArrowRight
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                strokeWidth={3}
              />
            </button>

            {/* 2. FACEBOOK BUTTON */}
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="group w-full flex items-center justify-between bg-[#1877F2] text-white font-black text-lg px-6 py-5 border-4 border-black transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              <div className="flex items-center gap-4">
                <Facebook className="w-6 h-6 fill-current" strokeWidth={0} />
                <span>FACEBOOK</span>
              </div>
              <ArrowRight
                className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                strokeWidth={3}
              />
            </button>


          </div>

          {/* Footer Text */}
          <div className="mt-8 pt-6 border-t-4 border-black text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Dengan masuk, Anda menyetujui Syarat & Ketentuan serta Kebijakan
              Privasi kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
