"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import AdminLogin from "./login";
import AdminDashboard from "./dashboard";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function AdminPageContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const authTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("⚠️ Admin auth check timed out, forcing loading to false...");
        setIsLoading(false);
      }
    }, 10000);

    const checkAdminAuth = async () => {
      // 1. Pelayanan pertama: Cek session storage (cepat)
      const savedAuth = sessionStorage.getItem("admin_auth");
      if (savedAuth === "true") {
        if (isMounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
          clearTimeout(authTimeout);
        }
        return;
      }

      // 2. Pelayanan kedua: Cek Supabase session (untuk user yang sudah login di sikalori)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Verifikasi admin via API
          const verifyResponse = await fetch("/api/admin/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id, email: user.email }),
          });
          
          if (verifyResponse.ok && isMounted) {
            const verifyResult = await verifyResponse.json();
            if (verifyResult.isAdmin) {
              sessionStorage.setItem("admin_auth", "true");
              sessionStorage.setItem("admin_user", JSON.stringify(user));
              setIsAuthenticated(true);
            }
          }
        }
      } catch (err) {
        console.error("Admin auto-auth error:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(authTimeout);
        }
      }
    };

    checkAdminAuth();
    return () => { 
      isMounted = false;
      clearTimeout(authTimeout);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <span className="ml-3 font-black uppercase text-sm">Menyiapkan Sesi...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#F0F0F0] overflow-hidden font-mono">
      <div className="shrink-0">
        <Sidebar forceShow={true} />
      </div>
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
        <AdminDashboard activeTab={activeTab} />
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
        <span className="ml-3 font-black uppercase text-sm">Menghubungkan ke Server...</span>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
