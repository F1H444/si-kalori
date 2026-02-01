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
      
      // 1. Update users table
      const { error: userError } = await supabase
        .from("users")
        .update({ is_premium: newStatus })
        .eq("id", userId);

      if (userError) throw userError;

      // 2. Update/Insert premium table
      if (newStatus) {
        // Granting premium (30 days)
        const startDate = new Date();
        const expiredAt = new Date(startDate);
        expiredAt.setDate(startDate.getDate() + 30);

        await supabase.from("premium").upsert(
          {
            user_id: userId,
            status: "active",
            start_date: startDate.toISOString(),
            expired_at: expiredAt.toISOString(),
          },
          { onConflict: "user_id" }
        );
      } else {
        // Revoking premium
        await supabase.from("premium").update({ status: "canceled" }).eq("user_id", userId);
      }

      // Refresh list
      await fetchUsers();
      console.log(`✅ Premium ${newStatus ? 'granted' : 'revoked'} for user ${userId}`);
    } catch (err) {
      console.error("Failed to toggle premium:", err);
      alert("Gagal mengubah status premium.");
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      console.log("🔍 Fetching users from Supabase...");

      // Fetch Profiles
      const { data: profiles, error: profileError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("📊 Supabase Response:", { profiles, profileError });

      if (profileError) {
        console.error("❌ Profile Error:", profileError);
        throw profileError;
      }

      // Fetch Premium Info to get expiration dates
      const { data: premiumData } = await supabase
        .from("premium")
        .select("user_id, expired_at");

      const enrichedProfiles = (profiles || []).map(p => ({
        ...p,
        premium_expired_at: premiumData?.find(pr => pr.user_id === p.id)?.expired_at || null
      }));

      console.log(
        "✅ Users enriched successfully:",
        enrichedProfiles.length,
        "users",
      );
      setUsers(enrichedProfiles);

      // Fetch Total Scans from food_logs & scan_logs (Robust Detection)
      setDetectingScans(true);
      let countResult = 0;

      const { count: foodLogsCount, error: foodError } = await supabase
        .from("food_logs")
        .select("*", { count: "exact", head: true });

      if (foodError) {
        console.warn("⚠️ Diagnosa food_logs:", foodError.message);
      } else {
        countResult = foodLogsCount || 0;
        console.log("📊 Food logs count:", countResult);
      }

      // Fallback check to scan_logs if food_logs is 0
      if (countResult === 0) {
        const { count: scanLogsCount } = await supabase
          .from("scan_logs")
          .select("*", { count: "exact", head: true });
        countResult = scanLogsCount || 0;
        console.log("📊 Scan logs count (fallback):", countResult);
      }

      console.log("📈 Total scans set to:", countResult);
      setTotalScans(countResult);
    } catch (error: unknown) {
      console.error("❌ Gagal mengambil data user:", error);
    } finally {
      setDetectingScans(false);
      setLoading(false);
    }
  }, []);

  const updateSettings = (key: string, value: string | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("admin_settings", JSON.stringify(newSettings));
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem("admin_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Gagal memuat pengaturan", error);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, [fetchUsers]);

  // Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        () => {
          console.log("🔄 Users table changed, refetching...");
          fetchUsers();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  // Realtime Subscription for Food Logs (Scans)
  useEffect(() => {
    const channel = supabase
      .channel("food-logs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_logs",
        },
        () => {
          fetchUsers();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeToday = users.filter((u) => {
      if (!u.last_login) return false;
      const lastLogin = new Date(u.last_login);
      const today = new Date();
      return (
        lastLogin.getDate() === today.getDate() &&
        lastLogin.getMonth() === today.getMonth() &&
        lastLogin.getFullYear() === today.getFullYear()
      );
    }).length;
    const premiumUsers = users.filter((u) => u.is_premium).length;
    const estimatedRevenue = premiumUsers * 16000;

    console.log("📊 Stats calculated:", {
      totalUsers,
      activeToday,
      premiumUsers,
      estimatedRevenue,
    });

    return { totalUsers, activeToday, premiumUsers, estimatedRevenue };
  }, [users]);

  const demographics = useMemo(() => {
    const goals = { lose: 0, maintain: 0, gain: 0, other: 0 };
    const genders = { male: 0, female: 0, unknown: 0 };

    users.forEach((u) => {
      // Goals
      if (u.goal === "lose") goals.lose++;
      else if (u.goal === "maintain") goals.maintain++;
      else if (u.goal === "gain") goals.gain++;
      else goals.other++;

      // Gender
      if (u.gender === "male") genders.male++;
      else if (u.gender === "female") genders.female++;
      else genders.unknown++;
    });

    return { goals, genders };
  }, [users]);

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

  const exportToCSV = () => {
    const now = new Date();
    const timestamp = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");

    // Hitung statistik untuk export
    const totalPremium = users.filter((u) => u.is_premium).length;
    const totalFree = users.filter((u) => !u.is_premium).length;
    const totalMale = users.filter((u) => u.gender === "male").length;
    const totalFemale = users.filter((u) => u.gender === "female").length;
    const totalScansAll = users.reduce(
      (sum, u) => sum + (u.scan_count || 0),
      0,
    );
    const avgScansPerUser =
      users.length > 0 ? (totalScansAll / users.length).toFixed(2) : 0;

    const goalLose = users.filter((u) => u.goal === "lose").length;
    const goalMaintain = users.filter((u) => u.goal === "maintain").length;
    const goalGain = users.filter((u) => u.goal === "gain").length;

    // Headers dengan format yang lebih rapi
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

    // Format data dengan penomoran
    const csvData = filteredUsers.map((user, index) => {
      // Format activity level
      const activityMap: { [key: string]: string } = {
        sedentary: "Ringan (Sedentary)",
        lightly_active: "Sedang (Lightly Active)",
        moderately_active: "Aktif (Moderately Active)",
        very_active: "Sangat Aktif (Very Active)",
        extra_active: "Extra Aktif (Extra Active)",
      };

      // Format goal
      const goalMap: { [key: string]: string } = {
        lose: "Turunkan Berat Badan",
        maintain: "Jaga Berat Badan",
        gain: "Naikkan Berat Badan",
      };

      // Format gender
      const genderMap: { [key: string]: string } = {
        male: "Pria",
        female: "Wanita",
      };

      // Hitung BMI
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

      // Format last login
      const lastLogin = user.last_login
        ? new Date(user.last_login).toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Belum pernah login";

      // Format bergabung
      const joinedDate = new Date(user.created_at).toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      return [
        index + 1,
        user.id,
        user.full_name || "Tidak ada nama",
        user.email,
        user.is_premium ? "Premium ⭐" : "Free",
        user.gender ? genderMap[user.gender] || user.gender : "Tidak diisi",
        user.age || "Tidak diisi",
        user.weight || "Tidak diisi",
        user.height || "Tidak diisi",
        bmi,
        user.activity_level
          ? activityMap[user.activity_level] || user.activity_level
          : "Tidak diisi",
        user.goal ? goalMap[user.goal] || user.goal : "Tidak diisi",
        user.daily_calorie_target
          ? `${user.daily_calorie_target.toLocaleString()} kalori`
          : "Tidak diisi",
        user.provider
          ? user.provider === "google"
            ? "Google"
            : user.provider === "email"
              ? "Email/Password"
              : user.provider
          : "Tidak diketahui",
        lastLogin,
        joinedDate,
        user.scan_count || 0,
      ];
    });

    // Header info dengan border yang lebih menarik
    const borderLine = "═".repeat(100);
    const separator = "─".repeat(100);

    const infoRows = [
      [borderLine],
      [
        "╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗",
      ],
      [
        "║                          📊 LAPORAN DATA PENGGUNA SI KALORI 📊                                   ║",
      ],
      [
        "║                          Sistem Informasi Kalori Makanan Berbasis AI                            ║",
      ],
      [
        "╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝",
      ],
      [borderLine],
      [""],
      ["📅 INFORMASI EXPORT"],
      [separator],
      [
        `Tanggal Export        : ${now.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      ],
      [
        `Waktu Export          : ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`,
      ],
      [`Diekspor oleh         : Admin SI KALORI`],
      [""],
      ["📊 DATA YANG DITAMPILKAN"],
      [separator],
      [`Total Pengguna        : ${users.length} pengguna`],
      [`Data Ditampilkan      : ${filteredUsers.length} pengguna`],
      [
        `Filter Premium        : ${filterPremium === "all" ? "Semua" : filterPremium === "premium" ? "Premium" : "Free"}`,
      ],
      [
        `Filter Gender         : ${filterGender === "all" ? "Semua" : filterGender === "male" ? "Pria" : "Wanita"}`,
      ],
      [
        `Kata Kunci Pencarian  : ${searchQuery || "Tidak ada filter pencarian"}`,
      ],
      [""],
      [borderLine],
      [""],
    ];

    // Footer info dengan statistik lengkap
    const footerRows = [
      [""],
      [borderLine],
      [""],
      ["📈 STATISTIK PENGGUNA"],
      [separator],
      [""],
      ["STATUS MEMBERSHIP:"],
      [
        `  ⭐ Premium           : ${totalPremium} pengguna (${((totalPremium / users.length) * 100).toFixed(1)}%)`,
      ],
      [
        `  🆓 Free              : ${totalFree} pengguna (${((totalFree / users.length) * 100).toFixed(1)}%)`,
      ],
      [""],
      ["DEMOGRAFI GENDER:"],
      [
        `  👨 Pria              : ${totalMale} pengguna (${((totalMale / users.length) * 100).toFixed(1)}%)`,
      ],
      [
        `  👩 Wanita            : ${totalFemale} pengguna (${((totalFemale / users.length) * 100).toFixed(1)}%)`,
      ],
      [
        `  ❓ Tidak Diisi       : ${users.length - totalMale - totalFemale} pengguna`,
      ],
      [""],
      ["TARGET GOAL:"],
      [
        `  📉 Turunkan BB       : ${goalLose} pengguna (${((goalLose / users.length) * 100).toFixed(1)}%)`,
      ],
      [
        `  ⚖️ Jaga BB           : ${goalMaintain} pengguna (${((goalMaintain / users.length) * 100).toFixed(1)}%)`,
      ],
      [
        `  📈 Naikkan BB        : ${goalGain} pengguna (${((goalGain / users.length) * 100).toFixed(1)}%)`,
      ],
      [""],
      ["AKTIVITAS SCAN:"],
      [`  📸 Total Scan        : ${totalScansAll} scan`],
      [`  📊 Rata-rata/User    : ${avgScansPerUser} scan`],
      [
        `  🏆 Scan Tertinggi    : ${Math.max(...users.map((u) => u.scan_count || 0))} scan`,
      ],
      [""],
      [separator],
      [""],
      ["💡 CATATAN:"],
      ["  - Data ini bersifat rahasia dan hanya untuk keperluan internal"],
      ["  - Mohon jaga kerahasiaan informasi pengguna"],
      ["  - Untuk pertanyaan, hubungi admin@sikalori.com"],
      [""],
      [borderLine],
      [""],
      [
        "╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗",
      ],
      [
        "║                     Terima kasih telah menggunakan SI KALORI                                     ║",
      ],
      [
        "║                     © 2024 SI KALORI - All Rights Reserved                                       ║",
      ],
      [
        "║                     Website: www.sikalori.com | Email: info@sikalori.com                         ║",
      ],
      [
        "╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝",
      ],
      [borderLine],
    ];

    // Combine all dengan formatting yang rapi
    const csv = [
      ...infoRows.map((row) => row.join(",")),
      headers.join(","),
      ...csvData.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
      ...footerRows.map((row) => row.join(",")),
    ].join("\n");

    // Add BOM for proper Excel UTF-8 encoding
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `SI-KALORI_Data-Pengguna_${timestamp}_${time}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success notification
    console.log(
      `✅ Export berhasil! File: SI-KALORI_Data-Pengguna_${timestamp}_${time}.csv`,
    );
    console.log(
      `📊 Total data: ${filteredUsers.length} dari ${users.length} pengguna`,
    );
  };

  console.log("🔎 Filtered Users:", {
    totalUsers: users.length,
    filteredCount: filteredUsers.length,
    searchQuery,
  });

  if (loading) return <LoadingOverlay message="MEMUAT DASHBOARD..." />;

  const tabLabels: Record<string, string> = {
    overview: "Dashboard",
    users: "Daftar Pengguna",
    analytics: "Analitik",
    settings: "Pengaturan",
  };

  return (
    <div
      className="h-full bg-white flex relative overflow-hidden w-full"
      suppressHydrationWarning
    >
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[6px] border-black pb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-yellow-400 border-2 border-black rounded-full animate-pulse" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                  Sistem Kontrol Pusat
                </p>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                {tabLabels[activeTab] || activeTab}.
              </h1>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-black text-black">ADMINISTRATOR PANEL</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">SIKALORI v2.0</p>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <StatCard
                  title="Total Pengguna"
                  value={stats.totalUsers}
                  color="bg-white"
                  delay={0}
                  mounted={mounted}
                  icon={<Users className="w-8 h-8" />}
                />
                <StatCard
                  title="Aktif Hari Ini"
                  value={stats.activeToday}
                  color="bg-[#FFC700]"
                  delay={100}
                  mounted={mounted}
                  icon={<UserCheck className="w-8 h-8" />}
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
                  title="Pengguna Premium"
                  value={stats.premiumUsers}
                  color="bg-blue-500"
                  delay={300}
                  mounted={mounted}
                  icon={<Crown className="w-8 h-8" />}
                />
                <StatCard
                  title="Revenue (Est)"
                  value={`${(stats.estimatedRevenue / 1000).toFixed(0)}K`}
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
                    Pertumbuhan Pengguna (6 Bulan)
                  </h3>
                  <div className="flex gap-3 h-64 items-end justify-between">
                    {growthData.map((data, i) => {
                      const maxValue = Math.max(
                        ...growthData.map((d) => d.value),
                        1,
                      );
                      const heightPercent = (data.value / maxValue) * 100;
                      return (
                        <motion.div
                          key={i}
                          className="flex-1 flex flex-col items-center justify-end gap-2"
                          initial={{ height: 0 }}
                          animate={{
                            height: mounted ? `${heightPercent}%` : 0,
                          }}
                          transition={{
                            delay: i * 0.1,
                            duration: 0.5,
                            ease: "easeOut",
                          }}
                        >
                          <div className="w-full bg-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center min-h-[40px]">
                            <span className="text-white font-black text-xl">
                              {data.value}
                            </span>
                          </div>
                          <span className="text-xs font-black uppercase text-center">
                            {data.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xl font-black tracking-tight mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Goal Distribusi
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
                    Gender
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
                        placeholder="Cari berdasarkan nama atau alamat email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 border-4 border-black font-black text-lg focus:outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-300 placeholder:italic placeholder:font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-none"
                      />
                    </div>
                    <button
                      onClick={exportToCSV}
                      className="bg-green-500 text-white px-10 py-5 border-4 border-black font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 uppercase italic tracking-tighter"
                    >
                      <FileSpreadsheet size={24} />
                      Download Data (.CSV)
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
                            {type === 'all' ? 'Semua User' : type === 'premium' ? 'Hanya Pro' : 'Free Member'}
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
                            {type === 'all' ? 'Semua' : type === 'male' ? 'Laki-Laki' : 'Perempuan'}
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
                          Status & Aktivitas
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
                          Aksi
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

                            {/* STATUS & SCAN: Premium Badge + Count */}
                            <td className="p-6">
                              <div className="space-y-3">
                                {user.is_premium ? (
                                  <div className="inline-flex items-center gap-2 bg-[#FFC700] text-black px-3 py-1 border-2 border-black font-black text-[10px] uppercase italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                    <Crown size={12} fill="currentColor" /> Pro Member
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-600 px-3 py-1 border-2 border-gray-400 font-black text-[10px] uppercase">
                                    Free Tier
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-blue-600 font-black text-sm">
                                  <Camera size={16} />
                                  <span>{user.scan_count || 0} Total Scans</span>
                                </div>
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
                                  {user.activity_level?.replace(/_/g, ' ') || 'Belum diisi'}
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

                            {/* ACTION */}
                            <td className="p-6 text-center">
                              <button
                                onClick={() => togglePremium(user.id, user.is_premium || false)}
                                className={`w-full py-3 font-black text-xs uppercase border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
                                  user.is_premium 
                                    ? "bg-red-50 text-red-600" 
                                    : "bg-green-500 text-white"
                                }`}
                              >
                                {user.is_premium ? "Revoke Pro" : "Grant Pro"}
                              </button>
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
                  <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                     <h3 className="text-xl font-black uppercase mb-6 border-b-4 border-black pb-2 italic">User Adoption</h3>
                     <div className="space-y-6">
                        <DistributionBar label="New Signups" value={growthData[5].value} total={users.length} color="bg-yellow-400" />
                        <DistributionBar label="Returning" value={stats.activeToday} total={users.length} color="bg-green-500" />
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
                     <h3 className="text-xl font-black uppercase mb-6 border-b-4 border-black pb-2 italic">Scanning Stats</h3>
                     <div className="space-y-2">
                        <p className="text-4xl font-black">{totalScans}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Food Items Logged</p>
                        <div className="pt-4 border-t-2 border-black border-dashed mt-4">
                           <p className="font-black text-sm uppercase">Avg Scans/User: <span className="text-blue-600">{analyticsData.avgScansPerUser}</span></p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-10">
              <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-10">
                <h3 className="text-4xl font-black italic tracking-tighter mb-10 border-b-8 border-black pb-6 flex items-center gap-4 uppercase underline decoration-8 decoration-yellow-400">
                  Konfig / Sistem
                </h3>

                <div className="space-y-12">
                  {/* Site Name */}
                  <div className="group">
                    <label className="block text-[10px] font-black mb-3 uppercase tracking-[0.4em] group-hover:text-yellow-500 transition-colors italic">
                      App / Identitas
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) =>
                        updateSettings("siteName", e.target.value)
                      }
                      className="w-full p-8 border-4 border-black font-black text-3xl italic tracking-tighter focus:outline-none focus:bg-yellow-50 transition-all uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>

                  {/* Toggle Settings */}
                  <div className="space-y-8 pt-10 border-t-8 border-black">
                    <h4 className="font-black italic tracking-tighter text-3xl mb-10 uppercase bg-black text-white inline-block px-4 py-1">
                      Preferensi / Logika
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ToggleSetting
                        label="MODE / MAINTENANCE"
                        description="Kunci akses untuk pembaruan sistem"
                        checked={settings.maintenanceMode}
                        onChange={(val) =>
                          updateSettings("maintenanceMode", val)
                        }
                      />
                      <ToggleSetting
                        label="AUTO / APPROVE"
                        description="Validasi instan untuk pengguna baru"
                        checked={settings.autoApproveUsers}
                        onChange={(val) =>
                          updateSettings("autoApproveUsers", val)
                        }
                      />
                      <ToggleSetting
                        label="NOTIF / EMAIL"
                        description="Kirim notifikasi sistem otomatis"
                        checked={settings.emailNotifications}
                        onChange={(val) =>
                          updateSettings("emailNotifications", val)
                        }
                      />
                      <ToggleSetting
                        label="PUBLIK / ANALITIK"
                        description="Tampilkan data performa ke admin"
                        checked={settings.showAnalytics}
                        onChange={(val) => updateSettings("showAnalytics", val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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

function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-5 border-4 border-black hover:bg-yellow-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
      <div className="flex-1 pr-4">
        <div className="font-black text-sm mb-1 uppercase tracking-tight italic">
          {label}
        </div>
        <div className="text-[9px] text-gray-500 font-bold uppercase leading-tight">
          {description}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-16 h-8 border-4 border-black transition-all flex-shrink-0 ${
          checked ? "bg-green-500" : "bg-gray-200"
        }`}
      >
        <motion.div
          animate={{ x: checked ? 32 : 0 }}
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white border-2 border-black flex items-center justify-center`}
        >
          {checked && <Check className="w-4 h-4 text-black" strokeWidth={4} />}
        </motion.div>
      </button>
    </div>
  );
}
