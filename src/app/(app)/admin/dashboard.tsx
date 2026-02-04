"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import LoadingOverlay from "@/components/LoadingOverlay";
import {
  Search,
  Loader2,
  Check,
  Download,
  Filter,
  Users,
  Crown,                
  Mail,
  User,
  Calendar,
  Activity,
  Target,
  Zap,
  TrendingDown,
  TrendingUp,
  Minus,
  Scale,
  Ruler,
  LogIn,
  UserPlus,
  FileSpreadsheet,
  UserCheck,
  Flame,
  Weight,
  BarChart3,
  Shield,
  Globe,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Camera,
  Settings,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { NeoDateRangePicker } from "@/components/admin/NeoDateRangePicker";

interface UserData {
  id: string;
  full_name: string | null;
  email: string;
  provider?: string;
  gender?: string | null;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  activity_level?: string | null;
  goal?: string | null;
  daily_calorie_target?: number | null;
  is_premium?: boolean;
  created_at: string;
  last_login?: string | null;
  scan_count?: number;
  premium_expired_at?: string | null;
}

interface AdminDashboardProps {
  activeTab: string;
}

export default function AdminDashboard({ activeTab }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [detectingScans, setDetectingScans] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [filterPremium, setFilterPremium] = useState<
    "all" | "premium" | "free"
  >("all");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">(
    "all",
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [premiumData, setPremiumData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, premiumUsers: 0, estimatedRevenue: 0 });
  const [demographics, setDemographics] = useState({ genders: { male: 0, female: 0 }, goals: { lose: 0, maintain: 0, gain: 0 } });
  const [premiumGrowthData, setPremiumGrowthData] = useState<{ label: string; value: number }[]>([]);
  
  // Default to last 7 days
  const [growthDateRange, setGrowthDateRange] = useState({
    start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // Start from 6 days ago (+ today = 7 days)
    end: new Date()
  });

  const [settings, setSettings] = useState({
    siteName: "SI KALORI",
    maintenanceMode: false,
    autoApproveUsers: true,
    emailNotifications: true,
    showAnalytics: true,
  });

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // 1. Update users table if is_premium column exists
      const { data: cols } = await supabase.from("users").select("*").limit(1).single();
      const availableColumns = cols ? Object.keys(cols) : [];

      if (availableColumns.includes("is_premium")) {
        await supabase
          .from("users")
          .update({ is_premium: newStatus })
          .eq("id", userId);
      }

      // 2. Update/Insert premium tables
      const startDate = new Date();
      const expiredAt = new Date(startDate);
      expiredAt.setDate(startDate.getDate() + 30);

      const premiumData = {
        user_id: userId,
        status: newStatus ? "active" : "canceled",
        plan_type: "monthly",
        start_date: startDate.toISOString(),
        expired_at: expiredAt.toISOString(),
      };

      // Helper function to update or insert without relying on ON CONFLICT constraint
      const smartUpsert = async (tableName: string) => {
        // Try update first
        const { data, error: updateError } = await supabase
          .from(tableName)
          .update(premiumData)
          .eq("user_id", userId)
          .select();
        
        // If no data returned (not found), then insert
        if (!updateError && (!data || data.length === 0)) {
          await supabase.from(tableName).insert(premiumData);
        }
        return updateError;
      };

      // Update 'premium_subscriptions' table directly
      // 'premium' table does not exist in schema
      await smartUpsert("premium_subscriptions");

      // Refresh list
      await fetchUsers(true);
      console.log(`✅ Akses Pro ${newStatus ? 'diberikan' : 'dicabut'} untuk user ${userId}`);
    } catch (err) {
      console.error("Gagal mengubah status premium:", err);
      alert("Waduh, gagal ngubah status premium nih.");
    }
  };

  const fetchUsers = useCallback(async (isSilent = false) => {
    // Safety timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      console.warn("⚠️ Data fetching taking too long, forcing loading to false...");
      if (!isSilent) setLoading(false);
    }, 10000);

    try {
      console.log(`🔍 [AdminDashboard] Fetching data via Secure API...`);
      if (!isSilent) setLoading(true);

      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Gagal mengambil data dari API");
      
      const data = await response.json();
      
      const adminIds = (data.admins || []).map((a: any) => a.id);
      const profiles = data.users || [];
      const premiumDataFetched = data.premium || [];
      const scanCounts = data.scanCounts || {}; // New data from API
      
      setPremiumData(premiumDataFetched);
      setTotalScans(data.totalScans || 0);

      // Filter out admins if you want, or show all. 
      // User said "mengambil data dari users", let's keep the filter if it was intended, 
      // but usually admins want to see everyone including themselves.
      // For now, let's show DEVELOPER current state: 
      // Show all users as requested
      const enrichedProfiles = profiles.map((p: any) => {
        const premInfo = premiumDataFetched.find((pr: any) => pr.user_id === p.id);
        const isPremiumActive = premInfo?.status === "active" && new Date(premInfo.expired_at) > new Date();
        const isAdminUser = adminIds.includes(p.id);
        
        return {
          ...p,
          is_premium: isPremiumActive || p.is_premium,
          premium_expired_at: premInfo?.expired_at || null,
          isAdmin: isAdminUser,
          scan_count: scanCounts[p.id] || 0, // Accurately map scan count
        };
      });

      setUsers(enrichedProfiles as UserData[]);

    } catch (error: any) {
      console.error("❌ [AdminDashboard] Master Fetch Error:", error);
    } finally {
      clearTimeout(loadTimeout);
      setDetectingScans(false);
      if (!isSilent) setLoading(false);
      setLastUpdated(new Date());
      console.log("🏁 [AdminDashboard] Fetch sequence complete.");
    }
  }, []);

  /* REMOVED SETTINGS STATE & HANDLERS */

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, [fetchUsers]);

  // Supabase Realtime Subscription - ENHANCED V2
  useEffect(() => {
    console.log("📡 [AdminDashboard] Initializing Realtime Channels...");

    // Create a single channel for all public changes
    const channel = supabase
      .channel("admin-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          console.log("🚀 [Realtime] User change detected:", payload.eventType);
          fetchUsers(true); // Silent refresh
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_logs" },
        () => {
          console.log("🚀 [Realtime] Food log change detected");
          fetchUsers(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "premium_subscriptions" },
        () => {
          console.log("🚀 [Realtime] Premium subscription change detected");
          fetchUsers(true);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admins" },
        () => {
          console.log("🚀 [Realtime] Admin list change detected");
          fetchUsers(true);
        }
      )
      .subscribe((status) => {
        console.log("📡 [Realtime] Subscription status:", status);
      });

    return () => {
      console.log("🔌 [AdminDashboard] Cleaning up Realtime Channels...");
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  // Calculate stats and demographics
  useEffect(() => {
    const totalMale = users.filter((u) => u.gender === "male").length;
    const totalFemale = users.filter((u) => u.gender === "female").length;
    
    const goalLose = users.filter((u) => u.goal === "lose").length;
    const goalMaintain = users.filter((u) => u.goal === "maintain").length;
    const goalGain = users.filter((u) => u.goal === "gain").length;

    setDemographics({
      genders: { male: totalMale, female: totalFemale },
      goals: { lose: goalLose, maintain: goalMaintain, gain: goalGain },
    });

    const activePremiumCount = premiumData.filter((p) => p.status === "active").length;
    
    setStats({
      totalUsers: users.length,
      activeUsers: users.length,
      premiumUsers: activePremiumCount,
      estimatedRevenue: activePremiumCount * 16000,
    });

    // Premium Growth (Dynamic Date Range)
    const getDaysArray = (start: Date, end: Date) => {
      const arr = [];
      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
      }
      return arr;
    };

    const dateRangeList = getDaysArray(new Date(growthDateRange.start), new Date(growthDateRange.end));
    
    // Safety check: if range is too large (e.g. > 30 days), maybe aggregate? 
    // For now, let's keep it daily but formatted nicely.
    
    const premiumRangeGrowth = dateRangeList.map(date => {
      const label = date.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: 'short' });
      const dateString = date.toISOString().split("T")[0];
      
      const count = premiumData.filter(sub => {
        const subDate = sub.created_at ? new Date(sub.created_at).toISOString().split("T")[0] : "";
        return subDate === dateString && sub.status === "active";
      }).length;

      return { label, value: count };
    });
    setPremiumGrowthData(premiumRangeGrowth);
  }, [users, premiumData, growthDateRange]);

  const growthData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString("id-ID", { month: "short" }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      });
    }
    return months.map(({ month, year, monthIndex }) => {
      const count = users.filter((u) => {
        if (!u.created_at) return false;
        const joinDate = new Date(u.created_at);
        return (
          joinDate.getMonth() === monthIndex && joinDate.getFullYear() === year
        );
      }).length;
      return { label: month, value: count, year };
    });
  }, [users]);

  const recentActivity = useMemo(() => {
    return users
      .filter((u) => !!u.created_at)
      .map((u) => ({
        user: u.full_name || "Pengguna Anonim",
        action: "bergabung",
        time: u.created_at,
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);
  }, [users]);

  const analyticsData = useMemo(() => {
    const avgScansPerUser =
      users.length > 0 ? (totalScans / users.length).toFixed(1) : 0;
    return { avgScansPerUser };
  }, [users, totalScans]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Exclude Admins/Superadmins
      // Assuming 'isAdmin' is set in fetchUsers or we check specific emails if needed
      if ((user as any).isAdmin || user.email === "admin@sikalori.com") return false;

      // Search filter
      const matchesSearch =
        (user.full_name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ) ||
        (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());

      // Premium filter
      const matchesPremium =
        filterPremium === "all" ||
        (filterPremium === "premium" && user.is_premium) ||
        (filterPremium === "free" && !user.is_premium);

      // Gender filter
      const matchesGender =
        filterGender === "all" || user.gender === filterGender;

      return matchesSearch && matchesPremium && matchesGender;
    });
  }, [users, searchQuery, filterPremium, filterGender]);


  const exportToExcel = () => {
    const now = new Date();
    const timestamp = now.toISOString().split("T")[0];

    // Headers with neat formatting
    const headers = [
      "No",
      "ID Pengguna",
      "Nama Lengkap",
      "Email",
      "Status Membership",
      "Gender",
      "Umur (Tahun)",
      "Berat Badan (kg)",
      "Tinggi Badan (cm)",
      "BMI",
      "Level Aktivitas",
      "Target Goal",
      "Target Kalori Harian",
      "Metode Login",
      "Terakhir Login",
      "Tanggal Bergabung",
      "Total Scan Makanan",
    ];

    // Format data rows
    const excelData = filteredUsers.map((user, index) => {
      // Activity Map
      const activityMap: { [key: string]: string } = {
        sedentary: "Ringan (Sedentary)",
        lightly_active: "Sedang (Lightly Active)",
        moderately_active: "Aktif (Moderately Active)",
        very_active: "Sangat Aktif (Very Active)",
        extra_active: "Extra Aktif (Extra Active)",
      };

      // Goal Map
      const goalMap: { [key: string]: string } = {
        lose: "Turunkan Berat Badan",
        maintain: "Jaga Berat Badan",
        gain: "Naikkan Berat Badan",
      };

      // Gender Map
      const genderMap: { [key: string]: string } = {
        male: "Pria",
        female: "Wanita",
      };

      // BMI Calculation
      let bmi = "Tidak tersedia";
      if (user.weight && user.height) {
        const heightInMeters = user.height / 100;
        const bmiValue = user.weight / (heightInMeters * heightInMeters);
        bmi = `${bmiValue.toFixed(1)} (${
          bmiValue < 18.5
            ? "Kurang"
            : bmiValue < 25
              ? "Normal"
              : bmiValue < 30
                ? "Berlebih"
                : "Obesitas"
        })`;
      }

      // Dates
      const lastLogin = user.last_login
        ? new Date(user.last_login).toLocaleString("id-ID", {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
          })
        : "Belum pernah login";

      const joinedDate = new Date(user.created_at).toLocaleString("id-ID", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
      });

      return [
        index + 1,
        user.id,
        user.full_name || "Tidak ada nama",
        user.email,
        user.is_premium ? "Premium" : "Free",
        user.gender ? genderMap[user.gender] || user.gender : "-",
        user.age || "-",
        user.weight || "-",
        user.height || "-",
        bmi,
        user.activity_level ? activityMap[user.activity_level] || user.activity_level : "-",
        user.goal ? goalMap[user.goal] || user.goal : "-",
        user.daily_calorie_target ? `${user.daily_calorie_target} kcal` : "-",
        user.provider || "-",
        lastLogin,
        joinedDate,
        user.scan_count || 0,
      ];
    });

    // Create HTML Table for Excel
    const tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th colspan="17" style="font-size: 14pt; font-weight: bold; text-align: center; height: 40px; background-color: #FFC700; color: #000000; border: 2px solid #000000;">
                DATA PENGGUNA SI KALORI
              </th>
            </tr>
            <tr style="background-color: #000000; color: #ffffff;">
               ${headers.map(h => `<th style="padding:10px; font-weight:bold; border:1px solid #000000; text-align: center; vertical-align: middle;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${excelData.map((row, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                ${row.map(cell => `<td style="padding:8px; border:1px solid #dddddd; vertical-align: middle; mso-number-format:'\@';">${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Download Logic
    const blob = new Blob([tableHTML], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `SI-KALORI_Data-Pengguna_${timestamp}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log("✅ Export Excel berhasil");
  };

  console.log("🔎 Filtered Users:", {
    totalUsers: users.length,
    filteredCount: filteredUsers.length,
    searchQuery,
  });

  if (loading) return <LoadingOverlay message="LAGI MENYIAPKAN DATA..." isFullPage={false} />;

  const tabLabels: Record<string, string> = {
    overview: "Dashboard",
    users: "Daftar Pengguna",
    analytics: "Analitik",
  };

  return (
    <div
      className="h-full bg-white flex flex-col relative w-full overflow-hidden"
      suppressHydrationWarning
    >
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full overflow-y-auto overflow-x-hidden">
        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[6px] border-black pb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 border-2 border-green-500 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-green-700 uppercase">Live Sync</span>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  Sistem Kontrol Pusat
                </p>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                {tabLabels[activeTab] || activeTab}.
              </h1>
            </div>
            <div className="hidden md:block text-right">
              <div className="flex items-center justify-end gap-2 mb-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Terakhir update: {lastUpdated.toLocaleTimeString('id-ID')}
                </p>
              </div>
              <p className="text-sm font-black text-black">ADMINISTRATOR PANEL</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">SIKALORI v2.0</p>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              
              {/* Insight Text */}
              <div className="bg-yellow-100 border-l-8 border-yellow-500 p-6 shadow-sm">
                <h3 className="font-black text-xl uppercase mb-2 flex items-center gap-2">
                    <Activity className="w-6 h-6" /> Analisis Singkat
                </h3>
                <p className="font-medium text-gray-700 leading-relaxed text-sm md:text-base">
                  Saat ini platform memiliki <span className="font-black text-black">{stats.totalUsers} pengguna</span>. 
                  Mayoritas pengguna adalah <span className="font-bold bg-white text-black px-1 border border-black transform -rotate-1 inline-block">{(demographics.genders.male >= demographics.genders.female ? "Pria" : "Wanita")}</span> dengan tujuan utama <span className="font-bold bg-white text-black px-1 border border-black transform rotate-1 inline-block">{(demographics.goals.lose >= demographics.goals.maintain ? "Menurunkan Berat Badan" : "Menjaga Berat Badan")}</span>.
                  Tingkat konversi ke Premium berada di angka <span className="font-bold bg-green-200 px-1 border border-black text-black">{((stats.premiumUsers / (stats.totalUsers || 1)) * 100).toFixed(1)}%</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Pengguna"
                  value={stats.totalUsers}
                  color="bg-white"
                  delay={0}
                  mounted={mounted}
                  icon={<Users className="w-8 h-8" />}
                />
                <StatCard
                  title="Total Scan Makanan"
                  value={totalScans}
                  color="bg-green-500"
                  delay={200}
                  mounted={mounted}
                  icon={<BarChart3 className="w-8 h-8" />}
                />
                <StatCard
                  title="Member Pro"
                  value={stats.premiumUsers}
                  color="bg-blue-500"
                  delay={300}
                  mounted={mounted}
                  icon={<Crown className="w-8 h-8" />}
                />
                <StatCard
                  title="Estimasi Cuan"
                  value={`Rp${(stats.estimatedRevenue / 1000).toFixed(0)}rb`}
                  color="bg-purple-500"
                  delay={400}
                  mounted={mounted}
                  icon={<Flame className="w-8 h-8" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Tren Pertumbuhan (6 Bulan)
                  </h3>
                  <div className="h-64 px-2">
                    <div className="h-48 relative flex gap-3 items-end justify-between">
                      {growthData.map((data, i) => {
                        const maxValue = Math.max(...growthData.map((d) => d.value), 1);
                        const heightPx = data.value === 0 
                          ? 30  // Show small bar (30px) for 0 values
                          : Math.max((data.value / maxValue) * 192, 30); // Max 192px (h-48), min 30px
                        
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-3 h-full">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPx}px` }}
                              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                              className="w-full bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
                            >
                              <span className="text-white font-black text-lg">
                                {data.value}
                              </span>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-3 justify-between mt-3 px-1">
                      {growthData.map((data, i) => (
                        <div key={i} className="flex-1 text-center">
                          <span className="text-xs font-black uppercase">
                            {data.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Target Diet Mereka
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <DistributionBar
                        label="Turunkan Berat Badan"
                        value={demographics.goals.lose}
                        total={users.length}
                        color="bg-red-400"
                      />
                      <DistributionBar
                        label="Jaga Berat Badan"
                        value={demographics.goals.maintain}
                        total={users.length}
                        color="bg-yellow-400"
                      />
                      <DistributionBar
                        label="Naikkan Berat Badan"
                        value={demographics.goals.gain}
                        total={users.length}
                        color="bg-green-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <Activity className="w-6 h-6" />
                      Aktivitas Terbaru
                    </h3>
                    <button className="text-xs font-black border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all">
                      Lihat Semua
                    </button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border-2 border-black hover:bg-yellow-50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-black shrink-0">
                              <span className="text-white font-black text-base uppercase">
                                {activity.user.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-black truncate max-w-[150px]">
                                {activity.user}
                              </p>
                              <p className="text-xs font-bold text-gray-500 leading-none">
                                {activity.action}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-gray-500 shrink-0">
                            {new Date(activity.time).toLocaleDateString(
                              "id-ID",
                            )}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-base font-bold text-gray-400 text-center py-8 border-2 border-black border-dashed">
                        Tidak ada aktivitas terdeteksi
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Proporsi Gender
                  </h3>
                  <div className="flex gap-4 h-48 items-end justify-around pb-4 border-b-2 border-dashed border-black">
                    <GenderPillar
                      label="Pria"
                      value={demographics.genders.male}
                      total={users.length}
                      color="bg-blue-500"
                    />
                    <GenderPillar
                      label="Wanita"
                      value={demographics.genders.female}
                      total={users.length}
                      color="bg-pink-500"
                    />
                  </div>
                  <div className="mt-4 flex justify-between px-2">
                    <span className="text-sm font-black opacity-50">
                      Total User: {users.length}
                    </span>
                    <span className="text-sm font-black text-blue-600">
                      Realtime
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Users Toolbelt */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <div className="flex flex-col gap-8">
                  {/* Primary Actions Row */}
                  <div className="flex flex-col xl:flex-row gap-6">
                    <div className="flex-1 relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black transition-transform group-focus-within:scale-110">
                        <Search size={22} />
                      </div>
                      <input
                        type="text"
                        placeholder="Ketikan nama atau email user yang dicari..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 border-4 border-black font-black text-lg focus:outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-300 placeholder:italic placeholder:font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-none"
                      />
                    </div>
                    <button
                      onClick={exportToExcel}
                      className="bg-green-500 text-white px-10 py-5 border-4 border-black font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter"
                    >
                      <FileSpreadsheet size={24} />
                      Download Data (.XLS)
                    </button>
                  </div>  

                  {/* Filter Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t-4 border-black border-dashed">
                    {/* Membership Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Crown size={18} className="text-yellow-500" />
                        <span className="text-sm font-black uppercase tracking-widest">Filter Membership</span>
                      </div>
                      <div className="flex gap-2">
                        {["all", "premium", "free"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setFilterPremium(type as any)}
                            className={`flex-1 py-3 border-4 border-black font-black text-xs uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
                              filterPremium === type
                                ? "bg-[#FFC700] text-black"
                                : "bg-white text-black"
                            }`}
                          >
                            {type === 'all' ? 'Semua User' : type === 'premium' ? 'Hanya Member Pro' : 'Member Gratisan'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Gender Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-blue-500" />
                        <span className="text-sm font-black uppercase tracking-widest">Saring Jenis Kelamin</span>
                      </div>
                      <div className="flex gap-2">
                        {["all", "male", "female"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setFilterGender(type as any)}
                            className={`flex-1 py-3 border-4 border-black font-black text-xs uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
                              filterGender === type
                                ? "bg-black text-white"
                                : "bg-white text-black"
                            }`}
                          >
                            {type === 'all' ? 'Gabungan' : type === 'male' ? 'Laki-Laki' : 'Perempuan'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats Counter */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="bg-black text-white px-6 py-2 border-2 border-black font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,199,0,1)]">
                       <User size={14} className="text-yellow-400" />
                       Found {filteredUsers.length} Users
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-black text-white border-b-4 border-black">
                        <th className="text-left p-6 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                          Pengguna
                        </th>
                        <th className="text-left p-6 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                          Aktivitas Scan
                        </th>
                        <th className="text-left p-6 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                          Metrik Fisik
                        </th>
                        <th className="text-left p-6 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                          Target & Gaya Hidup
                        </th>
                        <th className="text-left p-6 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                          Log Akses
                        </th>
                        <th className="text-center p-6 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                          Status Membership
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-black">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-16 text-center">
                            <div className="border-4 border-dashed border-black p-10 bg-yellow-50 max-w-lg mx-auto">
                              <p className="font-black text-2xl mb-2">Pencarian Kosong.</p>
                              <p className="font-bold text-gray-600 uppercase text-xs tracking-widest">
                                Tidak ada pengguna yang cocok dengan filter Anda.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, idx) => (
                          <tr
                            key={user.id}
                            className={`hover:bg-yellow-50 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            {/* IDENTITY: Avatar + Name + Email */}
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-black flex items-center justify-center border-4 border-black group-hover:bg-[#FFC700] transition-all transform group-hover:rotate-3 shrink-0">
                                  <span className="text-white group-hover:text-black font-black text-xl">
                                    {user.full_name?.charAt(0) || "?"}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <div className="font-black text-lg leading-tight truncate max-w-[180px] uppercase">
                                    {user.full_name || "Guest User"}
                                  </div>
                                  <div className="text-xs font-bold text-gray-500 mt-1 truncate max-w-[200px]">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* SCAN_COUNT ONLY */}
                            <td className="p-6">
                                <div className="flex items-center gap-2 text-blue-600 font-black text-sm">
                                  <Camera size={16} />
                                  <span>{user.scan_count || 0} Kali Scan</span>
                                </div>
                            </td>

                            {/* METRIC: BB, TB, Age, Gender */}
                            <td className="p-6">
                               <div className="grid grid-cols-2 gap-3 max-w-[180px]">
                                 <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[8px] font-black text-gray-400 uppercase">BB</p>
                                    <p className="font-black text-sm">{user.weight || '-'} <span className="text-[10px]">kg</span></p>
                                 </div>
                                 <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[8px] font-black text-gray-400 uppercase">TB</p>
                                    <p className="font-black text-sm">{user.height || '-'} <span className="text-[10px]">cm</span></p>
                                 </div>
                                 <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[8px] font-black text-gray-400 uppercase">Usia</p>
                                    <p className="font-black text-sm">{user.age || '-'} <span className="text-[10px]">thn</span></p>
                                 </div>
                                 <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <p className="text-[8px] font-black text-gray-400 uppercase">Gen</p>
                                    <p className="font-black text-sm uppercase">{user.gender?.charAt(0) || '-'}</p>
                                 </div>
                               </div>
                            </td>

                            {/* LIFESTYLE: Goal + Activity */}
                            <td className="p-6">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-black text-white border-2 border-black">
                                    {user.goal === 'lose' ? <TrendingDown size={14} /> : user.goal === 'gain' ? <TrendingUp size={14} /> : <Target size={14} />}
                                  </div>
                                  <span className="font-black text-xs uppercase tracking-tighter">
                                    {user.goal === 'lose' ? 'Turunkan BB' : user.goal === 'gain' ? 'Naikkan BB' : 'Jaga BB'}
                                  </span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 bg-gray-100 p-2 border-2 border-black/10 uppercase italic">
                                  {user.activity_level === 'sedentary' ? 'Kurang Gerak' : 
                                   user.activity_level === 'lightly_active' ? 'Aktif Ringan' : 
                                   user.activity_level === 'moderately_active' ? 'Cukup Aktif' : 
                                   user.activity_level === 'very_active' ? 'Sangat Aktif' : 
                                   user.activity_level === 'extra_active' ? 'Aktif Banget' : 
                                   user.activity_level || 'Belum diisi'}
                                </div>
                              </div>
                            </td>

                            {/* LOG: Provider + Login */}
                            <td className="p-6">
                               <div className="space-y-2">
                                 <div className="flex items-center gap-2 text-xs font-black uppercase">
                                    <LogIn size={14} className="text-purple-600" />
                                    <span>{user.provider || 'unknown'}</span>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Last Active:</p>
                                    <p className="text-xs font-black">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
                                 </div>
                               </div>
                            </td>

                            {/* STATUS MEMBERSHIP */}
                            <td className="p-6 text-center">
                              {user.is_premium ? (
                                <div className="inline-flex items-center gap-2 bg-[#FFC700] text-black px-4 py-2 border-2 border-black font-black text-xs uppercase italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                  <Crown size={14} fill="currentColor" /> Pro Member
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-600 px-4 py-2 border-2 border-400 font-black text-xs uppercase">
                                  Free Tier
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] col-span-1 lg:col-span-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b-4 border-black pb-4">
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Premium Growth</h3>
                    <NeoDateRangePicker 
                      onApply={(start, end) => setGrowthDateRange({ start, end })}
                      defaultStart={growthDateRange.start}
                      defaultEnd={growthDateRange.end}
                    />
                  </div>
                  <div className="h-64 px-4 flex flex-col items-center justify-center">
                    {/* Calculate Total */}
                    {(() => {
                      const totalInPeriod = premiumGrowthData.reduce((acc, curr) => acc + curr.value, 0);
                      
                      return (
                        <div className="text-center">
                          <span className="text-8xl font-black block mb-2">{totalInPeriod}</span>
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                            Member Baru dalam Periode Ini
                          </span>
                        </div>
                      );
                    })()}
                  </div>
               </div>

                  <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                     <h3 className="text-xl font-black uppercase mb-6 border-b-4 border-black pb-2 italic">User Adoption</h3>
                     <div className="space-y-6">
                        <DistributionBar label="New Signups" value={growthData[5].value} total={users.length} color="bg-yellow-400" />
                     </div>
                  </div>
                  <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                     <h3 className="text-xl font-black uppercase mb-6 border-b-4 border-black pb-2 italic">Premium Conversion</h3>
                     <div className="flex items-center justify-center py-4">
                        <div className="relative w-32 h-32 border-8 border-black rounded-full flex items-center justify-center">
                           <div className="text-2xl font-black">{((stats.premiumUsers / (users.length || 1)) * 100).toFixed(1)}%</div>
                        </div>
                     </div>
                     <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Conversion Rate</p>
                  </div>
                  <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                     <h3 className="text-xl font-black uppercase mb-6 border-b-4 border-black pb-2 italic">Aktivitas Scan</h3>
                     <div className="space-y-2">
                        <p className="text-4xl font-black">{totalScans}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Makanan Di-scan</p>
                        <div className="pt-4 border-t-2 border-black border-dashed mt-4">
                           <p className="font-black text-sm uppercase">Rata-rata/User: <span className="text-blue-600 font-black">{analyticsData.avgScansPerUser}</span></p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Settings Tab - REMOVED */}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  delay,
  mounted,
  icon,
}: {
  title: string;
  value: string | number;
  color: string;
  delay: number;
  mounted: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`${color} border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 transition-all duration-300 hover:shadow-none hover:translate-x-1 hover:translate-y-1 group h-full flex flex-col justify-between relative overflow-hidden ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="text-sm font-black uppercase tracking-tight leading-tight max-w-[70%]">
          {title}
        </div>
        {icon && <div className="p-2 bg-black/5 rounded-lg">{icon}</div>}
      </div>
      
      <div className="mt-6 relative z-10">
        <div className="text-5xl font-black tracking-tighter">
          {value}
        </div>
        <div className="w-12 h-2 bg-black mt-2" />
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
        {icon && React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
      </div>
    </div>
  );
}

function DistributionBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-black">{label}</span>
        <span className="text-sm font-black">
          {value} ({percent.toFixed(0)}%)
        </span>
      </div>
      <div className="h-6 border-4 border-black bg-gray-100 overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function GenderPillar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-3 h-full flex-1">
      <div className="relative w-full h-full flex items-end justify-center">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${percent}%` }}
          className={`w-full max-w-[50px] border-x-4 border-t-4 border-black ${color} shadow-[4px_0px_0px_0px_rgba(0,0,0,0.1)]`}
        />
        <div className="absolute -top-8 text-sm font-black">{value}</div>
      </div>
      <span className="text-sm font-black tracking-wide">{label}</span>
    </div>
  );
}

// ... (StatCard, DistributionBar, GenderPillar components remain unchanged)

// (ToggleSetting component is removed as it was only used in settings)
