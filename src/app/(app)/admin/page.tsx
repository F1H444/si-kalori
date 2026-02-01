"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import AdminLogin from "./login";
import AdminDashboard from "./dashboard";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const savedAuth = sessionStorage.getItem("admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#F0F0F0] overflow-hidden">
      <div className="shrink-0">
        <Sidebar forceShow={true} />
      </div>
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
        <AdminDashboard activeTab={activeTab} />
      </div>
    </div>
  );
}
