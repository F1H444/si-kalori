"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
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
  daily_target?: number | null;
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
        user.daily_target
          ? `${user.daily_target.toLocaleString()} kalori`
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

  if (loading) {
    return (
      <div className="fixed inset-0 z-[99] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="bg-black p-8 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] inline-block">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
            <p className="text-white font-black text-xl uppercase tracking-tighter">
              Memuat Dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black uppercase mb-2 tracking-tight">
              {tabLabels[activeTab] || activeTab}
            </h1>
            <p className="text-gray-600 font-bold uppercase text-sm italic">
              Panel Kontrol & Monitoring
            </p>
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
                  color="bg-[#FFDE59]"
                  delay={100}
                  mounted={mounted}
                  icon={<UserCheck className="w-8 h-8" />}
                />
                <StatCard
                  title="Total Scan Makanan"
                  value={totalScans}
                  color="bg-blue-400"
                  delay={200}
                  mounted={mounted}
                  icon={<BarChart3 className="w-8 h-8" />}
                />
                <StatCard
                  title="Pengguna Premium"
                  value={stats.premiumUsers}
                  color="bg-green-400"
                  delay={300}
                  mounted={mounted}
                  icon={<Crown className="w-8 h-8" />}
                />
                <StatCard
                  title="Revenue (Est)"
                  value={`${(stats.estimatedRevenue / 1000).toFixed(0)}K`}
                  color="bg-purple-400"
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
              {/* Search & Filter */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex flex-col gap-6">
                  {/* Search and Export Row */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari pengguna berdasarkan nama atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-4 border-4 border-black font-bold text-base focus:outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <button
                      onClick={exportToCSV}
                      className="bg-green-400 text-black px-8 py-4 border-4 border-black font-black text-base whitespace-nowrap flex items-center justify-center gap-3 hover:bg-green-300 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1"
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                      Export CSV
                    </button>
                  </div>  

                  {/* Filter Section */}
                  <div className="border-4 border-black p-5 bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Filter className="w-5 h-5" />
                      <span className="text-base font-black">Filter Data:</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Premium Status Filter */}
                      <div>
                        <label className="text-sm font-black mb-3 flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Status Membership
                        </label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setFilterPremium("all")}
                            className={`flex-1 px-4 py-3 border-3 border-black font-bold text-sm transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
                              filterPremium === "all"
                                ? "bg-black text-white"
                                : "bg-white text-black"
                            }`}
                          >
                            Semua
                          </button>
                          <button
                            onClick={() => setFilterPremium("premium")}
                            className={`flex-1 px-4 py-3 border-3 border-black font-bold text-sm transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2 ${
                              filterPremium === "premium"
                                ? "bg-yellow-400 text-black"
                                : "bg-white text-black"
                            }`}
                          >
                            <Crown className="w-4 h-4" />
                            Premium
                          </button>
                          <button
                            onClick={() => setFilterPremium("free")}
                            className={`flex-1 px-4 py-3 border-3 border-black font-bold text-sm transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
                              filterPremium === "free"
                                ? "bg-gray-300 text-black"
                                : "bg-white text-black"
                            }`}
                          >
                            Free
                          </button>
                        </div>
                      </div>

                      {/* Gender Filter */}
                      <div>
                        <label className="text-sm font-black mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Gender
                        </label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setFilterGender("all")}
                            className={`flex-1 px-4 py-3 border-3 border-black font-bold text-sm transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
                              filterGender === "all"
                                ? "bg-black text-white"
                                : "bg-white text-black"
                            }`}
                          >
                            Semua
                          </button>
                          <button
                            onClick={() => setFilterGender("male")}
                            className={`flex-1 px-4 py-3 border-3 border-black font-bold text-sm transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2 ${
                              filterGender === "male"
                                ? "bg-blue-400 text-white"
                                : "bg-white text-black"
                            }`}
                          >
                            <User className="w-4 h-4" />
                            Pria
                          </button>
                          <button
                            onClick={() => setFilterGender("female")}
                            className={`flex-1 px-4 py-3 border-3 border-black font-bold text-sm transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2 ${
                              filterGender === "female"
                                ? "bg-pink-400 text-white"
                                : "bg-white text-black"
                            }`}
                          >
                            <User className="w-4 h-4" />
                            Wanita
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Result Counter */}
                    <div className="mt-5 pt-5 border-t-2 border-black">
                      <div className="bg-black text-white px-5 py-3 border-2 border-black font-black text-base inline-flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Menampilkan {filteredUsers.length} dari {users.length}{" "}
                        Pengguna
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-black text-white border-b-8 border-black">
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Identitas
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Kontak
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Status
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Gender
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Umur
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            BB / TB
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Aktivitas
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Goal
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Target Kalori
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <LogIn className="w-4 h-4" />
                            Provider
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Last Login
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Bergabung
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Total Scan
                          </div>
                        </th>
                        <th className="text-left p-5 font-black text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Aksi
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="p-12 text-center">
                            <div className="border-4 border-dashed border-black p-8 bg-yellow-50">
                              <p className="font-black text-xl mb-3">
                                Tidak Ada Pengguna
                              </p>
                              <p className="font-bold text-base text-gray-600">
                                {searchQuery ||
                                filterPremium !== "all" ||
                                filterGender !== "all"
                                  ? "Tidak ditemukan pengguna dengan filter tersebut"
                                  : "Belum ada pengguna terdaftar dalam sistem"}
                              </p>
                              <p className="font-bold text-sm text-gray-400 mt-4">
                                Total Users: {users.length} | Filtered:{" "}
                                {filteredUsers.length}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b-4 border-black hover:bg-[#FFDE59]/10 transition-colors group"
                          >
                            {/* Identitas */}
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-black flex items-center justify-center border-4 border-black group-hover:bg-[#FFDE59] transition-colors shrink-0">
                                  <span className="text-white group-hover:text-black font-black text-lg uppercase">
                                    {user.full_name?.charAt(0) || "?"}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <span className="font-black text-base block truncate max-w-[150px]">
                                    {user.full_name || "Tanpa Nama"}
                                  </span>
                                  <span className="text-xs font-bold text-gray-500">
                                    ID: {user.id.slice(0, 8)}...
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Kontak */}
                            <td className="p-5 font-bold text-sm">
                              <div className="max-w-[200px] truncate">
                                {user.email}
                              </div>
                            </td>

                            {/* Status Premium */}
                            <td className="p-5">
                              {user.is_premium ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 border-3 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <Crown className="w-4 h-4" />
                                    Premium
                                  </span>
                                  {user.premium_expired_at && (
                                    <p className="text-[10px] font-black text-red-500 uppercase mt-1">
                                      Habis: {new Date(user.premium_expired_at).toLocaleDateString('id-ID')}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-block bg-gray-200 text-gray-700 px-4 py-2 border-2 border-gray-400 font-bold text-sm">
                                  Free
                                </span>
                              )}
                            </td>

                            {/* Gender */}
                            <td className="p-5 font-bold text-sm">
                              {user.gender === "male" ? (
                                <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 border-2 border-blue-600 text-sm font-bold">
                                  <User className="w-4 h-4" />
                                  Pria
                                </span>
                              ) : user.gender === "female" ? (
                                <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-2 border-2 border-pink-600 text-sm font-bold">
                                  <User className="w-4 h-4" />
                                  Wanita
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>

                            {/* Umur */}
                            <td className="p-5 font-black text-sm">
                              {user.age ? (
                                <span className="text-black">
                                  {user.age} tahun
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* BB/TB */}
                            <td className="p-5 font-bold text-sm">
                              {user.weight || user.height ? (
                                <div className="space-y-1">
                                  {user.weight && (
                                    <div className="text-black flex items-center gap-1">
                                      <Scale className="w-3 h-3" />
                                      {user.weight} kg
                                    </div>
                                  )}
                                  {user.height && (
                                    <div className="text-gray-600 flex items-center gap-1">
                                      <Ruler className="w-3 h-3" />
                                      {user.height} cm
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* Aktivitas */}
                            <td className="p-5 font-bold text-sm">
                              {user.activity_level ? (
                                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 border-2 border-green-600">
                                  <Activity className="w-4 h-4" />
                                  {user.activity_level === "sedentary" &&
                                    "Ringan"}
                                  {user.activity_level === "lightly_active" &&
                                    "Sedang"}
                                  {user.activity_level ===
                                    "moderately_active" && "Aktif"}
                                  {user.activity_level === "very_active" &&
                                    "Sangat Aktif"}
                                  {user.activity_level === "extra_active" &&
                                    "Extra Aktif"}
                                  {![
                                    "sedentary",
                                    "lightly_active",
                                    "moderately_active",
                                    "very_active",
                                    "extra_active",
                                  ].includes(user.activity_level) &&
                                    user.activity_level}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* Goal */}
                            <td className="p-5 font-bold text-sm">
                              {user.goal === "lose" ? (
                                <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 border-2 border-red-600">
                                  <TrendingDown className="w-4 h-4" />
                                  Turun
                                </span>
                              ) : user.goal === "maintain" ? (
                                <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-2 border-2 border-yellow-600">
                                  <Minus className="w-4 h-4" />
                                  Jaga
                                </span>
                              ) : user.goal === "gain" ? (
                                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 border-2 border-green-600">
                                  <TrendingUp className="w-4 h-4" />
                                  Naik
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* Target Kalori */}
                            <td className="p-5 font-black text-sm">
                              {user.daily_target ? (
                                <span className="text-black flex items-center gap-1">
                                  <Zap className="w-4 h-4 text-orange-500" />
                                  {user.daily_target.toLocaleString()} kal
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* Provider */}
                            <td className="p-5 font-bold text-sm">
                              {user.provider ? (
                                <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-2 border-2 border-purple-600">
                                  <LogIn className="w-4 h-4" />
                                  {user.provider === "google" && "Google"}
                                  {user.provider === "email" && "Email"}
                                  {!["google", "email"].includes(
                                    user.provider,
                                  ) && user.provider}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* Last Login */}
                            <td className="p-5 font-bold text-sm">
                              {user.last_login ? (
                                <div className="space-y-1">
                                  <div className="text-black">
                                    {new Date(
                                      user.last_login,
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {new Date(
                                      user.last_login,
                                    ).toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>

                            {/* Bergabung */}
                            <td className="p-5 font-bold text-sm whitespace-nowrap">
                              {new Date(user.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>

                            {/* Total Scan */}
                            <td className="p-5 font-black text-sm">
                              {user.scan_count ? (
                                <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 border-3 border-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                  <Camera className="w-4 h-4" />
                                  {user.scan_count} scan
                                </span>
                              ) : (
                                <span className="text-gray-400 flex items-center gap-2">
                                  <Camera className="w-4 h-4" />0 scan
                                </span>
                              )}
                            </td>

                            {/* Tombol Aksi */}
                            <td className="p-5">
                              <button
                                onClick={() => togglePremium(user.id, user.is_premium || false)}
                                className={`px-4 py-2 font-black text-xs uppercase border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all whitespace-nowrap ${
                                  user.is_premium 
                                    ? "bg-red-50 text-red-600 hover:bg-red-100" 
                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                }`}
                              >
                                {user.is_premium ? "Cabut Premium" : "Beri Premium"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
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
      className={`${color} border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 transition-all duration-500 hover:shadow-none hover:translate-x-2 hover:translate-y-2 group h-full flex flex-col justify-between ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        {icon && <div className="opacity-50">{icon}</div>}
      </div>
      <div className="text-5xl font-black mb-4 overflow-hidden truncate">
        {value}
      </div>
      <div className="text-sm font-black border-t-4 border-black pt-4 leading-tight">
        {title}
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
