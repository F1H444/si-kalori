"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Loader2,
  Meh,
  Info,
  Calendar,
  X
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import type { ScanLog } from "@/types/user";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 15,
    },
  },
};


export default function RiwayatPage() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  
  // Modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    logId: string | null;
    logName: string;
  }>({
    isOpen: false,
    logId: null,
    logName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User tidak ditemukan");
        return;
      }

      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error: unknown) {
      console.error("Error fetching logs:", error instanceof Error ? error.message : error);                                                                                         

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchLogs();
  }, []);

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      logId: id,
      logName: name,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      logId: null,
      logName: "",
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.logId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("food_logs")
        .delete()
        .eq("id", deleteModal.logId);
      
      if (error) throw error;
      setLogs(logs.filter(log => log.id !== deleteModal.logId));
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting log:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.food_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups: { [key: string]: ScanLog[] }, log) => {
    const date = log.scan_time 
      ? new Date(log.scan_time).toISOString().split('T')[0] 
      : 'TANGGAL KOSONG';
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  const totalCalories = logs.reduce((acc, log) => {
    const nut = typeof log.nutrition === 'string' ? JSON.parse(log.nutrition) : log.nutrition;
    return acc + (Number(nut?.calories) || 0);
  }, 0);


  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 font-mono text-black">
        <div className="bg-white border-[8px] border-black p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
          <p className="font-black text-2xl uppercase tracking-tighter">MENGAMBIL DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 font-mono text-black">
      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-black/60 cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white border-4 border-black p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full"
            >
              {/* Close Button */}
              <button
                onClick={closeDeleteModal}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500 border-4 border-black mx-auto mb-4 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                  Hapus Riwayat?
                </h3>
              </div>

              {/* Modal Body */}
              <div className="bg-gray-100 border-4 border-black p-4 mb-6">
                <p className="text-sm font-bold text-gray-600 uppercase mb-1">
                  Item yang akan dihapus:
                </p>
                <p className="text-xl font-black uppercase tracking-tight truncate">
                  {deleteModal.logName}
                </p>
              </div>

              <p className="text-center font-bold text-gray-600 mb-6">
                Data yang dihapus tidak bisa dikembalikan.
              </p>

              {/* Modal Actions */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="flex-1 bg-white text-black border-4 border-black p-4 font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
                >
                  Batal
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white border-4 border-black p-4 font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <motion.header 
        className="max-w-6xl mx-auto mb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div variants={headerVariants} className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black uppercase leading-[0.8] tracking-tighter">
              RIWAYAT<br /><span className="text-blue-600 italic">KONSUMSI</span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="relative w-full md:w-[400px]">
            <input 
              type="text" 
              placeholder="CARI DATA..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-4 border-black p-5 font-black text-xl uppercase placeholder:text-gray-300 focus:outline-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 text-black" />
          </motion.div>
        </div>
      </motion.header>

      <motion.div 
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatBox label="Total Menu" value={logs.length} color="bg-white" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatBox label="Total Kalori" value={`${totalCalories}`} color="bg-yellow-400" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatBox label="Status Akun" value="Aktif" color="bg-black text-white" />
        </motion.div>
      </motion.div>


      {/* LIST AREA */}
      <div className="max-w-6xl mx-auto space-y-6">
        <AnimatePresence>
          {sortedDates.length === 0 ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-8 border-black p-20 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <Meh size={80} className="mx-auto mb-4 text-black" />
              <p className="text-2xl font-black uppercase tracking-tighter text-black">Belum ada data nih</p>
              <p className="mt-2 opacity-60 text-black uppercase font-bold text-xs">Yuk, scan makanan atau minumanmu sekarang!</p>
            </motion.div>
          ) : (
            sortedDates.map((date) => {
              const dayLogs = groupedLogs[date];
              const dailyCalories = dayLogs.reduce((acc, log) => {
                const nut = typeof log.nutrition === 'string' ? JSON.parse(log.nutrition) : log.nutrition;
                return acc + (Number(nut?.calories) || 0);
              }, 0);

              return (
                <div key={date} className="space-y-6">
                  <div className="flex items-center gap-4 sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-4 -mx-4 px-4">
                    <div className="bg-blue-600 text-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <h3 className="text-xl font-black uppercase tracking-tighter">
                        {date === 'TANGGAL KOSONG' 
                          ? 'TANPA TANGGAL' 
                          : new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </h3>
                    </div>
                    <div className="flex-1 h-1 bg-black hidden md:block" />
                    <div className="bg-yellow-400 border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                       <p className="text-xs font-black uppercase leading-none mb-1">Total Kalori</p>
                       <p className="text-lg font-black uppercase leading-none">{dailyCalories} KCAL</p>
                    </div>
                  </div>

                  <div className="space-y-6 pb-12">
                    {dayLogs.map((log) => {
                      const nutrition = typeof log.nutrition === 'string' ? JSON.parse(log.nutrition) : log.nutrition;
                      
                      return (
                        <motion.div
                          key={log.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group overflow-hidden"
                        >
                          <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                              
                              {/* Image Thumbnail (If Exists) */}
                              {log.image_url && (
                                <div className="relative w-full md:w-32 h-48 md:h-32 border-4 border-black shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                  <Image 
                                    src={log.image_url} 
                                    alt={log.food_name} 
                                    fill 
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              )}

                              {/* Left Side: Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
                                    ID_{log.id.split('-')[0]}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-400 italic">
                                    <Calendar size={12} /> {log.scan_time ? new Date(log.scan_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'JAM KOSONG'}
                                  </span>
                                </div>
                                
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter truncate italic group-hover:text-blue-600 transition-colors">
                                  {log.food_name}
                                </h2>
                                
                                <div className="mt-4 flex flex-wrap gap-3">
                                  <div className="flex items-center gap-2 bg-gray-100 border-2 border-black px-3 py-1">
                                    <Info size={14} />
                                    <p className="text-[10px] font-black uppercase italic leading-none truncate max-w-[200px] md:max-w-md">
                                      {log.ai_analysis || "Belum ada analisis"}
                                    </p>
                                  </div>
                                  <div className="bg-green-400 border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                                    {log.meal_type === 'Scan AI' ? 'ANALISIS AI' : log.meal_type || 'UMUM'}
                                  </div>
                                </div>
                              </div>

                              {/* Middle Side: Quick Stats */}
                              <div className="grid grid-cols-2 gap-2 w-full md:w-auto shrink-0">
                                <MiniStat label="KCAL" value={nutrition?.calories || 0} color="bg-white" />
                                <MiniStat label="PROT" value={nutrition?.protein || 0} color="bg-blue-400" />
                                <MiniStat label="CARB" value={nutrition?.carbs || 0} color="bg-orange-400" />
                                <MiniStat label="FAT" value={nutrition?.fat || 0} color="bg-pink-400" />
                              </div>

                              {/* Right Side: Action */}
                              <button 
                                onClick={() => openDeleteModal(log.id, log.food_name)}
                                className="bg-red-500 text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:bg-black transition-all shrink-0 w-full md:w-auto flex items-center justify-center"
                              >
                                <Trash2 size={24} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Komponen Pendukung
function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`${color} border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between`}>
       <div className="min-w-0">
         <p className="text-xs font-black uppercase opacity-60 mb-1">{label}</p>
         <p className="text-4xl font-black uppercase tracking-tighter truncate">{value}</p>
       </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {

  return (
    <div className={`${color} border-2 border-black p-2 min-w-[70px] text-center`}>
      <p className="text-[8px] font-black uppercase mb-1 opacity-60">{label}</p>
      <p className="text-sm font-black uppercase leading-none">{value}</p>
    </div>
  );
}