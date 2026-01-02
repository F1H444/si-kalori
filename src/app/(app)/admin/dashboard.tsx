"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Check } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface UserData {
  id: string;
  full_name: string | null;
  email: string;
  picture?: string;
  provider?: string;
  created_at: string;
  last_login?: string | null;
  scan_count?: number;
  gender?: string;
  goal?: string;
  activity_level?: string;
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

  const [settings, setSettings] = useState({
    siteName: "SI KALORI",
    maintenanceMode: false,
    autoApproveUsers: true,
    emailNotifications: true,
    showAnalytics: true,
  });

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch Profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;
      setUsers(profiles || []);

      // Fetch Total Scans from food_logs & scan_logs (Robust Detection)
      setDetectingScans(true);
      let countResult = 0;
      
      const { count: foodLogsCount, error: foodError } = await supabase
        .from("food_logs")
        .select("*", { count: 'exact', head: true });
      
      if (foodError) console.warn("Diagnosa food_logs:", foodError.message);
      else countResult = foodLogsCount || 0;

      // Fallback check to scan_logs if food_logs is 0
      if (countResult === 0) {
        const { count: scanLogsCount } = await supabase
          .from("scan_logs")
          .select("*", { count: 'exact', head: true });
        countResult = scanLogsCount || 0;
      }

      setTotalScans(countResult);

    } catch (error: unknown) {
      console.error("Gagal mengambil data user", error);
    } finally {
      setDetectingScans(false);
      setLoading(false);
    }
  }, []);

  const updateSettings = (key: string, value: string | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('admin_settings', JSON.stringify(newSettings));
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Gagal memuat pengaturan', error);
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
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  // Realtime Subscription for Food Logs (Scans)
  useEffect(() => {
    const channel = supabase
      .channel('food-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_logs'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);


  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeToday = users.filter(u => {
      if (!u.last_login) return false;
      const lastLogin = new Date(u.last_login);
      const today = new Date();
      return (
        lastLogin.getDate() === today.getDate() &&
        lastLogin.getMonth() === today.getMonth() &&
        lastLogin.getFullYear() === today.getFullYear()
      );
    }).length;

    return { totalUsers, activeToday };
  }, [users]);

  const demographics = useMemo(() => {
    const goals = { lose: 0, maintain: 0, gain: 0, other: 0 };
    const genders = { male: 0, female: 0, unknown: 0 };
    
    users.forEach(u => {
      // Goals
      if (u.goal === 'lose') goals.lose++;
      else if (u.goal === 'maintain') goals.maintain++;
      else if (u.goal === 'gain') goals.gain++;
      else goals.other++;

      // Gender
      if (u.gender === 'male') genders.male++;
      else if (u.gender === 'female') genders.female++;
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
        month: date.toLocaleString('id-ID', { month: 'short' }),
        year: date.getFullYear(),
        monthIndex: date.getMonth()
      });
    }
    return months.map(({ month, year, monthIndex }) => {
      const count = users.filter(u => {
        if (!u.created_at) return false;
        const joinDate = new Date(u.created_at);
        return joinDate.getMonth() === monthIndex && joinDate.getFullYear() === year;
      }).length;
      return { label: month, value: count, year };
    });
  }, [users]);

  const recentActivity = useMemo(() => {
    return users
      .filter(u => !!u.created_at)
      .map(u => ({
        user: u.full_name || "Pengguna Anonim",
        action: "bergabung",
        time: u.created_at,
        avatar: u.picture
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);
  }, [users]);

  const analyticsData = useMemo(() => {
    const avgScansPerUser = users.length > 0
      ? (totalScans / users.length).toFixed(1)
      : 0;
    return { avgScansPerUser };
  }, [users, totalScans]);

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="bg-black p-8 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] inline-block">
                <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
                <p className="text-white font-black text-xl uppercase tracking-tighter">Memuat Dashboard...</p>
              </div>
            </div>
        </div>
      );
  }

  const tabLabels: Record<string, string> = {
    overview: "Dashboard",
    users: "Daftar Pengguna",
    analytics: "Analitik",
    settings: "Pengaturan"
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden" suppressHydrationWarning>
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
      <main className="flex-1 flex flex-col relative z-10 w-full">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black uppercase mb-2 tracking-tight">{tabLabels[activeTab] || activeTab}</h1>
            <p className="text-gray-600 font-bold uppercase text-sm italic">Panel Kontrol & Monitoring</p>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="TOTAL PENGGUNA"
                  value={stats.totalUsers}
                  color="bg-white"
                  delay={0}
                  mounted={mounted}
                />
                <StatCard
                  title="AKTIF HARI INI"
                  value={stats.activeToday}
                  color="bg-[#FFDE59]"
                  delay={100}
                  mounted={mounted}
                />
                <StatCard
                  title="TOTAL SCAN MAKANAN"
                  value={totalScans}
                  color="bg-blue-400"
                  delay={200}
                  mounted={mounted}
                />
              </div>

              {/* Grid 2: Charts & Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Graph */}
                <div className="lg:col-span-8 bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <div className="flex items-center justify-between mb-10 border-b-4 border-black pb-4">
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">Pertumbuhan User / 6 Bln</h3>
                    <div className="flex gap-2 text-[10px] font-black uppercase">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-black"></div> Pengguna Baru</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4 h-64 px-4">
                    {growthData.map((data, i) => {
                      const maxValue = Math.max(...growthData.map(d => d.value), 1);
                      const heightPercent = (data.value / maxValue) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                          <div className="relative w-full h-48 flex items-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ delay: i * 0.1, duration: 0.5 }}
                              className="w-full bg-black border-2 border-black relative group-hover:bg-[#FFDE59] transition-colors"
                            >
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-xs font-black hidden group-hover:block whitespace-nowrap z-20">
                                {data.value} Pengguna
                              </div>
                            </motion.div>
                          </div>
                          <span className="text-[10px] font-black tracking-widest uppercase">{data.label} / {data.year.toString().slice(-2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* System Health Section */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                    <h3 className="text-xl font-black italic mb-4 border-b border-white/20 pb-2 uppercase tracking-tighter text-yellow-400">Monitoring Sistem</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[10px] uppercase">Database (Supabase)</span>
                        <span className="px-2 py-0.5 bg-green-500 text-black text-[9px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">Stabil</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[10px] uppercase">AI Engine (Groq)</span>
                        <span className="px-2 py-0.5 bg-green-500 text-black text-[9px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]">Stabil</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-black italic mb-6 uppercase tracking-tighter">Target Pengguna</h3>
                    <div className="space-y-5">
                      <DistributionBar label="Turunkan Berat Badan" value={demographics.goals.lose} total={users.length} color="bg-red-400" />
                      <DistributionBar label="Jaga Berat Badan" value={demographics.goals.maintain} total={users.length} color="bg-yellow-400" />
                      <DistributionBar label="Naikkan Berat Badan" value={demographics.goals.gain} total={users.length} color="bg-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-4 underline-offset-4">Aktivitas Terbaru</h3>
                    <button className="text-[9px] font-black border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-all uppercase">Lihat Semua</button>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border-2 border-black hover:bg-yellow-50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shrink-0">
                           <span className="text-white font-black text-xs uppercase">{activity.user.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase truncate max-w-[150px]">{activity.user}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">{activity.action}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-gray-400 shrink-0">
                          {new Date(activity.time).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    )) : (
                      <p className="text-sm font-bold text-gray-400 text-center py-8 border-2 border-black border-dashed uppercase">Tidak ada aktivitas terdeteksi</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                   <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Gender</h3>
                   <div className="flex gap-4 h-48 items-end justify-around pb-4 border-b-2 border-dashed border-black">
                      <GenderPillar label="Pria" value={demographics.genders.male} total={users.length} color="bg-blue-500" />
                      <GenderPillar label="Wanita" value={demographics.genders.female} total={users.length} color="bg-pink-500" />
                   </div>
                   <div className="mt-4 flex justify-between px-2">
                      <span className="text-[10px] font-black uppercase opacity-50">Total User : {users.length}</span>
                      <span className="text-[10px] font-black uppercase text-blue-600">Realtime</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Search & Filter */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="CARI PENGGUNA..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-4 border-black font-black focus:outline-none focus:bg-yellow-50 transition-all uppercase placeholder:text-gray-300 italic"
                    />
                  </div>
                  <div className="bg-black text-white px-6 py-3 border-4 border-black font-black whitespace-nowrap uppercase italic tracking-tighter flex items-center justify-center">
                    Total: {filteredUsers.length} Pengguna
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-black text-white border-b-8 border-black">
                        <th className="text-left p-6 font-black uppercase tracking-widest text-[10px] italic">Kolom / Identitas</th>
                        <th className="text-left p-6 font-black uppercase tracking-widest text-[10px] italic">Kolom / Kontak</th>
                        <th className="text-left p-6 font-black uppercase tracking-widest text-[10px] italic">Kolom / Bergabung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b-4 border-black hover:bg-[#FFDE59]/10 transition-colors group"
                        >
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-black flex items-center justify-center border-4 border-black group-hover:bg-[#FFDE59] transition-colors shrink-0">
                                <span className="text-white group-hover:text-black font-black text-lg uppercase">{user.full_name?.charAt(0) || "?"}</span>
                              </div>
                              <span className="font-black text-lg italic tracking-tighter uppercase truncate max-w-[150px]">{user.full_name || "Tanpa Nama"}</span>
                            </div>
                          </td>
                          <td className="p-6 font-black text-sm uppercase tracking-tight">{user.email}</td>
                          <td className="p-6 font-black text-sm tracking-tighter">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <label className="block text-[10px] font-black mb-3 uppercase tracking-[0.4em] group-hover:text-yellow-500 transition-colors italic">App / Identitas</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => updateSettings('siteName', e.target.value)}
                      className="w-full p-8 border-4 border-black font-black text-3xl italic tracking-tighter focus:outline-none focus:bg-yellow-50 transition-all uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                  </div>

                  {/* Toggle Settings */}
                  <div className="space-y-8 pt-10 border-t-8 border-black">
                    <h4 className="font-black italic tracking-tighter text-3xl mb-10 uppercase bg-black text-white inline-block px-4 py-1">Preferensi / Logika</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ToggleSetting
                        label="MODE / MAINTENANCE"
                        description="Kunci akses untuk pembaruan sistem"
                        checked={settings.maintenanceMode}
                        onChange={(val) => updateSettings('maintenanceMode', val)}
                      />
                      <ToggleSetting
                        label="AUTO / APPROVE"
                        description="Validasi instan untuk pengguna baru"
                        checked={settings.autoApproveUsers}
                        onChange={(val) => updateSettings('autoApproveUsers', val)}
                      />
                      <ToggleSetting
                        label="NOTIF / EMAIL"
                        description="Kirim notifikasi sistem otomatis"
                        checked={settings.emailNotifications}
                        onChange={(val) => updateSettings('emailNotifications', val)}
                      />
                      <ToggleSetting
                        label="PUBLIK / ANALITIK"
                        description="Tampilkan data performa ke admin"
                        checked={settings.showAnalytics}
                        onChange={(val) => updateSettings('showAnalytics', val)}
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

function StatCard({ title, value, color, delay, mounted }: { title: string; value: string | number; color: string; delay: number; mounted: boolean }) {
  return (
    <div
      className={`${color} border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 transition-all duration-500 hover:shadow-none hover:translate-x-2 hover:translate-y-2 group h-full flex flex-col justify-between ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-6xl font-black italic tracking-tighter mb-6 overflow-hidden truncate">{value}</div>
      <div className="text-[10px] font-black tracking-[0.2em] border-t-4 border-black pt-4 uppercase leading-none">{title}</div>
    </div>
  );
}

function DistributionBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
        <span className="text-[10px] font-black">{value} ({percent.toFixed(0)}%)</span>
      </div>
      <div className="h-5 border-4 border-black bg-gray-100 overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percent}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function GenderPillar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-2 h-full flex-1">
       <div className="relative w-full h-full flex items-end justify-center">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${percent}%` }}
            className={`w-full max-w-[40px] border-x-4 border-t-4 border-black ${color} shadow-[4px_0px_0px_0px_rgba(0,0,0,0.1)]`}
          />
          <div className="absolute -top-6 text-[9px] font-black uppercase">{value}</div>
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-5 border-4 border-black hover:bg-yellow-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
      <div className="flex-1 pr-4">
        <div className="font-black text-sm mb-1 uppercase tracking-tight italic">{label}</div>
        <div className="text-[9px] text-gray-500 font-bold uppercase leading-tight">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-16 h-8 border-4 border-black transition-all flex-shrink-0 ${
          checked ? 'bg-green-500' : 'bg-gray-200'
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

