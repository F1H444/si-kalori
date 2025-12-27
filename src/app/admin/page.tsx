"use client";
import { useState, useEffect, useMemo } from "react";
import { User, Shield, LayoutDashboard, Users, LogOut, Search, TrendingUp, DollarSign, Activity, Crown, Menu, X, BarChart3, FileText, Settings as SettingsIcon, Check, Bell, ChevronDown, Zap, Eye, EyeOff } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: string;
  joinedAt: string;
  lastLogin: string;
  scanCount?: number;
  isPremium?: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [settings, setSettings] = useState({
    siteName: "SI KALORI",
    premiumPrice: 16000,
    maintenanceMode: false,
    autoApproveUsers: true,
    emailNotifications: true,
    showAnalytics: true,
  });

  useEffect(() => {
    setMounted(true);
    const savedAuth = sessionStorage.getItem("admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      fetchUsers();
      setLoginError("");
    } else {
      setLoginError("Invalid password! Try again.");
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

  const togglePremium = async (email: string) => {
    try {
      const res = await fetch("/api/users/toggle-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Gagal update status premium");
      }
    } catch (error) {
      console.error("Error toggling premium", error);
    }
  };

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.isPremium).length;
    const totalRevenue = premiumUsers * 16000;
    const activeToday = users.filter(u => {
      const lastLogin = new Date(u.lastLogin);
      const today = new Date();
      return lastLogin.toDateString() === today.toDateString();
    }).length;
    return { totalUsers, premiumUsers, totalRevenue, activeToday };
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
        const joinDate = new Date(u.joinedAt);
        return joinDate.getMonth() === monthIndex && joinDate.getFullYear() === year;
      }).length;
      return { label: month, value: count };
    });
  }, [users]);

  const recentActivity = useMemo(() => {
    return users
      .map(u => ({
        user: u.name,
        action: "joined platform",
        time: u.joinedAt,
        avatar: u.picture
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6);
  }, [users]);

  const analyticsData = useMemo(() => {
    const avgScansPerUser = users.length > 0
      ? (users.reduce((sum, u) => sum + (u.scanCount || 0), 0) / users.length).toFixed(1)
      : 0;
    const conversionRate = stats.totalUsers > 0
      ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)
      : 0;
    return { avgScansPerUser, conversionRate };
  }, [users, stats]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
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

            <h1 className="text-4xl font-black text-center mb-2 tracking-tight">ADMIN PORTAL</h1>
            <p className="text-center text-gray-600 font-bold mb-8">Secure Access Required</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError("");
                    }}
                    className="w-full p-4 pr-12 border-4 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    placeholder="Enter secret key..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 transition-colors"
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
                className="w-full bg-black text-white p-4 font-black text-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all uppercase"
              >
                🔓 Unlock Dashboard
              </button>
            </form>

            <div className="mt-6 pt-6 border-t-4 border-black">
              <a
                href="/"
                className="flex items-center justify-center gap-2 text-sm font-bold hover:underline"
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

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
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

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r-4 border-black relative z-10">
        <div className="p-6 border-b-4 border-black bg-black">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 border-2 border-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-black text-xl tracking-tight">SI KALORI</h2>
              <p className="text-purple-100 text-xs font-bold">ADMIN PANEL</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard />} label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <NavItem icon={<Users />} label="Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <NavItem icon={<BarChart3 />} label="Analytics" active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")} />
          <NavItem icon={<SettingsIcon />} label="Settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </nav>

        <div className="p-4 border-t-4 border-black">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 bg-red-500 text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all"
          >
            <LogOut className="w-5 h-5" />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r-4 border-black flex flex-col animate-slide-in">
            <div className="p-6 border-b-4 border-black bg-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 border-2 border-black">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-white font-black text-xl">SI KALORI</h2>
                    <p className="text-purple-100 text-xs font-bold">ADMIN PANEL</p>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <NavItem icon={<LayoutDashboard />} label="Overview" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Users />} label="Users" active={activeTab === "users"} onClick={() => { setActiveTab("users"); setIsSidebarOpen(false); }} />
              <NavItem icon={<BarChart3 />} label="Analytics" active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setIsSidebarOpen(false); }} />
              <NavItem icon={<SettingsIcon />} label="Settings" active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); setIsSidebarOpen(false); }} />
            </nav>

            <div className="p-4 border-t-4 border-black">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 bg-red-500 text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <LogOut className="w-5 h-5" />
                LOGOUT
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b-4 border-black p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black uppercase">{activeTab}</h1>
              <p className="text-xs text-gray-600 font-bold">Dashboard Control</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 border-2 border-black bg-yellow-300 hover:bg-yellow-400 transition-colors"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black uppercase mb-2 tracking-tight">{activeTab}</h1>
            <p className="text-gray-600 font-bold">Control panel & monitoring system</p>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={<Users className="w-6 h-6" />}
                  color="bg-blue-500"
                  delay={0}
                  mounted={mounted}
                />
                <StatCard
                  title="Premium Users"
                  value={stats.premiumUsers}
                  icon={<Crown className="w-6 h-6" />}
                  color="bg-yellow-500"
                  delay={100}
                  mounted={mounted}
                />
                <StatCard
                  title="Total Revenue"
                  value={`Rp ${(stats.totalRevenue / 1000).toFixed(0)}K`}
                  icon={<DollarSign className="w-6 h-6" />}
                  color="bg-green-500"
                  delay={200}
                  mounted={mounted}
                />
                <StatCard
                  title="Active Today"
                  value={stats.activeToday}
                  icon={<Activity className="w-6 h-6" />}
                  color="bg-red-500"
                  delay={300}
                  mounted={mounted}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth Chart */}
                <div className="lg:col-span-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black uppercase">User Growth</h3>
                      <p className="text-sm text-gray-600 font-bold">Last 6 months trend</p>
                    </div>
                    <div className="bg-green-500 p-2 border-2 border-black">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3 h-48">
                    {growthData.map((data, i) => {
                      const maxValue = Math.max(...growthData.map(d => d.value), 1);
                      const heightPercent = (data.value / maxValue) * 100;
                      const heightPx = Math.max((heightPercent / 100) * 180, 20);
                      const colors = ['bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-red-500'];

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="relative w-full">
                            <div
                              className={`w-full ${colors[i % colors.length]} border-2 border-black transition-all duration-500 group-hover:opacity-80 cursor-pointer`}
                              style={{
                                height: `${heightPx}px`,
                                animationDelay: `${i * 100}ms`,
                              }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 text-xs font-bold whitespace-nowrap">
                                {data.value} users
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-black">{data.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black uppercase">Activity</h3>
                      <p className="text-sm text-gray-600 font-bold">Recent events</p>
                    </div>
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="space-y-3">
                    {recentActivity.map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 border-2 border-black hover:bg-yellow-50 transition-all group cursor-pointer"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        {activity.avatar ? (
                          <img src={activity.avatar} alt="" className="w-10 h-10 border-2 border-black object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black truncate">{activity.user}</p>
                          <p className="text-xs text-gray-600 font-bold">{activity.action}</p>
                        </div>
                      </div>
                    ))}
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
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-black font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    />
                  </div>
                  <div className="bg-black text-white px-6 py-3 border-2 border-black font-black whitespace-nowrap">
                    TOTAL: {filteredUsers.length} USERS
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black text-white border-b-4 border-black">
                        <th className="text-left p-4 font-black uppercase text-sm">User</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Email</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Status</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Joined</th>
                        <th className="text-left p-4 font-black uppercase text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, i) => (
                        <tr
                          key={user.id}
                          className="border-b-2 border-black hover:bg-yellow-50 transition-colors"
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {user.picture ? (
                                <img src={user.picture} alt="" className="w-10 h-10 border-2 border-black object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <span className="font-bold">{user.name}</span>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-sm">{user.email}</td>
                          <td className="p-4">
                            {user.isPremium ? (
                              <span className="inline-flex items-center gap-2 bg-yellow-300 text-black px-3 py-1 border-2 border-black font-black text-xs">
                                <Crown className="w-4 h-4" />
                                PREMIUM
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 bg-gray-200 text-black px-3 py-1 border-2 border-black font-black text-xs">
                                FREE
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-sm">{new Date(user.joinedAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <button
                              onClick={() => togglePremium(user.email)}
                              className={`px-4 py-2 font-black text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0 active:translate-y-0 transition-all ${
                                user.isPremium
                                  ? "bg-white text-black hover:bg-gray-100"
                                  : "bg-black text-white hover:bg-gray-800"
                              }`}
                            >
                              {user.isPremium ? "DOWNGRADE" : "UPGRADE"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Conversion Rate */}
                <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black uppercase">Conversion Rate</h3>
                      <p className="text-sm text-gray-600 font-bold">Free → Premium</p>
                    </div>
                    <div className="bg-green-500 p-3 border-2 border-black">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl font-black mb-2">{analyticsData.conversionRate}%</div>
                  <div className="w-full bg-gray-200 h-4 border-2 border-black">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000"
                      style={{ width: `${analyticsData.conversionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Avg Scans */}
                <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black uppercase">Avg. Scans</h3>
                      <p className="text-sm text-gray-600 font-bold">Per user average</p>
                    </div>
                    <div className="bg-blue-500 p-3 border-2 border-black">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl font-black mb-2">{analyticsData.avgScansPerUser}</div>
                  <p className="text-sm text-gray-600 font-bold">scans per user</p>
                </div>
              </div>

              {/* User Distribution */}
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                <h3 className="text-xl font-black uppercase mb-6">User Distribution</h3>
                <div className="space-y-6">
                  {/* Free Users */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black">FREE USERS</span>
                      <span className="font-black">{stats.totalUsers - stats.premiumUsers}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-8 border-2 border-black relative overflow-hidden">
                      <div
                        className="h-full bg-gray-500 transition-all duration-1000 flex items-center justify-end pr-2"
                        style={{ width: `${stats.totalUsers > 0 ? ((stats.totalUsers - stats.premiumUsers) / stats.totalUsers) * 100 : 0}%` }}
                      >
                        <span className="text-white font-black text-xs">
                          {stats.totalUsers > 0 ? ((stats.totalUsers - stats.premiumUsers) / stats.totalUsers * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Users */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        PREMIUM USERS
                      </span>
                      <span className="font-black">{stats.premiumUsers}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-8 border-2 border-black relative overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all duration-1000 flex items-center justify-end pr-2"
                        style={{ width: `${stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0}%` }}
                      >
                        <span className="text-white font-black text-xs">
                          {stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                  <SettingsIcon className="w-7 h-7" />
                  System Configuration
                </h3>

                <div className="space-y-6">
                  {/* Site Name */}
                  <div>
                    <label className="block text-sm font-black mb-2 uppercase">Application Name</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => updateSettings('siteName', e.target.value)}
                      className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    />
                  </div>

                  {/* Premium Price */}
                  <div>
                    <label className="block text-sm font-black mb-2 uppercase">Premium Price (Rp)</label>
                    <input
                      type="number"
                      value={settings.premiumPrice}
                      onChange={(e) => updateSettings('premiumPrice', parseInt(e.target.value))}
                      className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    />
                  </div>

                  {/* Toggle Settings */}
                  <div className="space-y-4 pt-4 border-t-4 border-black">
                    <h4 className="font-black uppercase text-sm mb-4">System Preferences</h4>
                    <ToggleSetting
                      label="Maintenance Mode"
                      description="Enable to show maintenance page to users"
                      checked={settings.maintenanceMode}
                      onChange={(val) => updateSettings('maintenanceMode', val)}
                    />
                    <ToggleSetting
                      label="Auto Approve Users"
                      description="Automatically approve new user registrations"
                      checked={settings.autoApproveUsers}
                      onChange={(val) => updateSettings('autoApproveUsers', val)}
                    />
                    <ToggleSetting
                      label="Email Notifications"
                      description="Send email notifications for important events"
                      checked={settings.emailNotifications}
                      onChange={(val) => updateSettings('emailNotifications', val)}
                    />
                    <ToggleSetting
                      label="Show Analytics"
                      description="Display analytics data on dashboard"
                      checked={settings.showAnalytics}
                      onChange={(val) => updateSettings('showAnalytics', val)}
                    />
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

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 font-black border-2 border-black transition-all ${
        active
          ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          : "bg-white text-black hover:bg-yellow-50 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, icon, color, delay, mounted }: { title: string; value: string | number; icon: React.ReactNode; color: string; delay: number; mounted: boolean }) {
  return (
    <div
      className={`bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 border-2 border-black`}>
          {icon}
        </div>
      </div>
      <div className="text-4xl font-black mb-2">{value}</div>
      <div className="text-sm text-gray-600 font-bold uppercase">{title}</div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-2 border-black hover:bg-yellow-50 transition-colors">
      <div className="flex-1">
        <div className="font-black mb-1">{label}</div>
        <div className="text-sm text-gray-600 font-bold">{description}</div>
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