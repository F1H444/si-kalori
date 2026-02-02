"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface DailyCalorie {
  date: string;
  calories: number;
}

export default function WeeklyReport({ userId }: { userId: string }) {
  const [data, setData] = useState<DailyCalorie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split("T")[0];
        }).reverse();

        const { data: logs, error } = await supabase
          .from("food_logs")
          .select("created_at, nutrition")
          .eq("user_id", userId)
          .gte("created_at", last7Days[0]);

        if (error) throw error;

        const dailyMap = new Map<string, number>();
        last7Days.forEach((date) => dailyMap.set(date, 0));

        logs.forEach((log) => {
          const date = new Date(log.created_at).toISOString().split("T")[0];
          if (dailyMap.has(date)) {
            const nut = typeof log.nutrition === "string" ? JSON.parse(log.nutrition) : log.nutrition;
            dailyMap.set(date, (dailyMap.get(date) || 0) + (Number(nut?.calories) || 0));
          }
        });

        const chartData = last7Days.map((date) => ({
          date: new Date(date).toLocaleDateString("id-ID", { weekday: "short" }),
          calories: dailyMap.get(date) || 0,
        }));

        setData(chartData);
      } catch (err) {
        console.error("Error fetching weekly report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [userId]);

  if (loading) return (
    <div className="h-48 flex items-center justify-center border-4 border-black bg-white">
      <p className="font-black animate-pulse uppercase italic">Generating Report...</p>
    </div>
  );

  const maxCal = Math.max(...data.map(d => d.calories), 2500);

  return (
    <div className="border-4 border-black p-4 md:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
        <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">Laporan Mingguan</h3>
        <div className="bg-black text-white text-[10px] px-2 py-1 font-bold uppercase tracking-widest">
          Premium Access
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-1 sm:gap-4 h-56 mt-4 w-full min-w-[300px]">
        {data.map((day, idx) => {
          const heightPercent = Math.max((day.calories / maxCal) * 100, 5); // Min height 5%
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
              <div className="relative w-full flex flex-col items-center justify-end">
                {/* Tooltip on Hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 font-bold shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] z-10 whitespace-nowrap">
                  {day.calories} kcal
                </div>
                
                {/* The Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 50 }}
                  className="w-full sm:w-[80%] bg-yellow-400 border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:bg-primary transition-colors cursor-pointer"
                />
              </div>
              <span className="text-[9px] sm:text-xs font-black uppercase italic tracking-tighter">{day.date}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase italic">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 border-2 border-black" />
          <span>Kalori Harian</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-black border-2 border-black" />
          <span>Target: {maxCal} kcal</span>
        </div>
      </div>
    </div>
  );
}
