"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { User, Shield, LayoutDashboard, Users, LogOut, Search, TrendingUp, DollarSign, Activity, Crown, Menu, X, BarChart3, FileText, Settings as SettingsIcon, Check, Bell, ChevronDown, Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

interface UserData {
  id: string;
  full_name: string | null;
  email: string;
  picture?: string;
  provider?: string;
  created_at: string;
  last_login?: string | null;
  scan_count?: number;
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Use searchParams for activeTab, default to 'overview'
  const activeTab = searchParams.get("tab") || "overview";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [settings, setSettings] = useState({
    siteName: "SI KALORI",
    maintenanceMode: false,
    autoApproveUsers: true,
    emailNotifications: true,
    showAnalytics: true,
  });

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error Details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      setUsers(data || []);
    } catch (error: any) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_auth", "true");
        fetchUsers();
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

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    localStorage.setItem('admin_settings', JSON.stringify({ ...settings, [key]: value }));
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings', error);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedAuth = sessionStorage.getItem("admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [fetchUsers]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to realtime changes on profiles table
    console.log("Initializing realtime subscription for 'profiles' table...");
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Realtime change detected!', payload.eventType, payload.new);
          // Refresh users data when any change occurs
          fetchUsers();
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Realtimes connected successfully!");
        }
        if (status === "CHANNEL_ERROR") {
          console.error("Realtime connection failed. Check if Realtime is enabled in Supabase for table 'profiles'.");
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, fetchUsers]);



const stats = useMemo(() => {
    const totalUsers = users.length;
    
    // Perbaikan logika Active Today agar membandingkan Tanggal, Bulan, dan Tahun
    const activeToday = users.filter(u => {
      if (!u.last_login) return false;
      
      const lastLogin = new Date(u.last_login);
      const today = new Date();
      
      // Memastikan perbandingan dilakukan pada hari yang sama di waktu lokal
      return (
        lastLogin.getDate() === today.getDate() &&
        lastLogin.getMonth() === today.getMonth() &&
        lastLogin.getFullYear() === today.getFullYear()
      );
    }).length;

    return { totalUsers, activeToday };
  }, [users]);

  const growthData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
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
        user: u.full_name || "Unknown User",
        action: "joined platform",
        time: u.created_at,
        avatar: u.picture
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);
  }, [users]);

  const analyticsData = useMemo(() => {
    const avgScansPerUser = users.length > 0
      ? (users.reduce((sum, u) => sum + (u.scan_count || 0), 0) / users.length).toFixed(1)
      : 0;
    return { avgScansPerUser };
  }, [users]);

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
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

            <h1 className="text-4xl font-black text-center mb-2 tracking-tight uppercase">Admin Portal</h1>
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
                  <>🔓 Unlock Dashboard</>
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

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-black p-8 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] inline-block">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
            <p className="text-white font-black text-xl uppercase">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Mobile Header logic can be handled by global layout if needed, or removed if global sidebar handles mobile */}
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black uppercase mb-2 tracking-tight">{activeTab}</h1>
            <p className="text-gray-600 font-bold uppercase text-sm">Control Panel & Monitoring System</p>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="TOTAL USERS"
                  value={stats.totalUsers}
                  color="bg-white"
                  delay={0}
                  mounted={mounted}
                />

                <StatCard
                  title="ACTIVE TODAY"
                  value={stats.activeToday}
                  color="bg-[#FFDE59]"
                  delay={300}
                  mounted={mounted}
                />
              </div>

              {/* Grid 2: Charts & Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Graph */}
                <div className="lg:col-span-8 bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <div className="flex items-center justify-between mb-10 border-b-4 border-black pb-4">
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">User Growth / 6MO</h3>
                    <div className="flex gap-2 text-xs font-black uppercase">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-black"></div> New Users</span>
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
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-sm font-black hidden group-hover:block whitespace-nowrap">
                                {data.value} USERS
                              </div>
                            </motion.div>
                          </div>
                          <span className="text-xs font-black tracking-widest uppercase">{data.label} / {data.year.toString().slice(-2)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* System Health Section */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                    <h3 className="text-xl font-black italic mb-4 border-b border-white/20 pb-2 uppercase">System Health</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm uppercase">Database (Supabase)</span>
                        <span className="px-2 py-1 bg-green-500 text-black text-[10px] font-black uppercase">Stable</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm uppercase">AI Engine (Groq)</span>
                        <span className="px-2 py-1 bg-green-500 text-black text-[10px] font-black uppercase">Stable</span>
                      </div>

                    </div>
                  </div>

                  <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="text-xl font-black italic mb-4 uppercase">Avg. Metrics</h3>
                    <div className="space-y-4">

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-black uppercase">Avg Scans / User</span>
                          <span className="text-[10px] font-black">{analyticsData.avgScansPerUser}</span>
                        </div>
                        <div className="h-4 border-2 border-black bg-gray-100 overflow-hidden">
                          <div className="h-full bg-[#FFDE59]" style={{ width: `${Math.min(Number(analyticsData.avgScansPerUser) * 10, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Latest Activity */}
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase">Latest Activity</h3>
                  <button className="text-[10px] font-black border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-all uppercase">View All</button>
                </div>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border-2 border-black hover:bg-yellow-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black">
                         <span className="text-white font-black text-xs uppercase">{activity.user.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase">{activity.user}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Joined Platform</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-gray-400">
                        {new Date(activity.time).toLocaleDateString()}
                      </span>
                    </div>
                  )) : (
                    <p className="text-sm font-bold text-gray-400 text-center py-8 border-2 border-black border-dashed uppercase">No Recent Activity Detected</p>
                  )}
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
                      placeholder="SEARCH USERS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-black font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase placeholder:text-gray-300"
                    />
                  </div>
                  <div className="bg-black text-white px-6 py-3 border-2 border-black font-black whitespace-nowrap uppercase">
                    Total: {filteredUsers.length} Users
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black text-white border-b-8 border-black">
                        <th className="text-left p-6 font-black uppercase tracking-widest text-xs">Col / Identity</th>
                        <th className="text-left p-6 font-black uppercase tracking-widest text-xs">Col / Contact</th>
                        <th className="text-left p-6 font-black uppercase tracking-widest text-xs">Col / Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, i) => (
                        <tr
                          key={user.id}
                          className="border-b-4 border-black hover:bg-[#FFDE59]/10 transition-colors group"
                        >
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-black group-hover:bg-[#FFDE59] transition-colors">
                                <span className="text-white group-hover:text-black font-black text-lg uppercase">{user.full_name?.charAt(0) || "?"}</span>
                              </div>
                              <span className="font-black text-lg italic tracking-tighter uppercase">{user.full_name || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="p-6 font-black text-sm uppercase tracking-tight">{user.email}</td>
                          <td className="p-6 font-black text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
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
                <h3 className="text-4xl font-black italic tracking-tighter mb-10 border-b-4 border-black pb-4 flex items-center gap-4 uppercase">
                  Config / System
                </h3>

                <div className="space-y-10">
                  {/* Site Name */}
                  <div className="group">
                    <label className="block text-xs font-black mb-3 uppercase tracking-[0.3em] group-hover:text-[#FFDE59] transition-colors">App / Identity</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => updateSettings('siteName', e.target.value)}
                      className="w-full p-6 border-4 border-black font-black text-2xl italic tracking-tighter focus:outline-none focus:bg-yellow-50 transition-all uppercase"
                    />
                  </div>



                  {/* Toggle Settings */}
                  <div className="space-y-6 pt-10 border-t-8 border-black">
                    <h4 className="font-black italic tracking-tighter text-2xl mb-8 uppercase">Preferences / Logic</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ToggleSetting
                        label="MAINTENANCE / LOCK"
                        description="Block Access For Updates"
                        checked={settings.maintenanceMode}
                        onChange={(val) => updateSettings('maintenanceMode', val)}
                      />
                      <ToggleSetting
                        label="AUTO / APPROVE"
                        description="Instant User Validation"
                        checked={settings.autoApproveUsers}
                        onChange={(val) => updateSettings('autoApproveUsers', val)}
                      />
                      <ToggleSetting
                        label="EMAIL / BROADCAST"
                        description="Auto Notification Dispatch"
                        checked={settings.emailNotifications}
                        onChange={(val) => updateSettings('emailNotifications', val)}
                      />
                      <ToggleSetting
                        label="PUBLIC / ANALYTICS"
                        description="Show Data To Admins"
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

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// NavItem removed (unused)

function StatCard({ title, value, color, delay, mounted }: { title: string; value: string | number; color: string; delay: number; mounted: boolean }) {
  return (
    <div
      className={`${color} border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 transition-all duration-300 hover:shadow-none hover:translate-x-2 hover:translate-y-2 group ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-6xl font-black italic tracking-tighter mb-4">{value}</div>
      <div className="text-xs font-black tracking-[0.2em] border-t-4 border-black pt-4 uppercase">{title}</div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-2 border-black hover:bg-yellow-50 transition-colors">
      <div className="flex-1">
        <div className="font-black mb-1 uppercase">{label}</div>
        <div className="text-sm text-gray-600 font-bold uppercase text-xs">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 border-2 border-black transition-all flex-shrink-0 ${
          checked ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white border-2 border-black transition-all ${
            checked ? 'left-7' : 'left-0.5'
          }`}
        >
          {checked && <Check className="w-4 h-4" />}
        </div>
      </button>
    </div>
  );
}