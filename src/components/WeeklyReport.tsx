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
    <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-black uppercase mb-6 italic border-b-4 border-black pb-2 inline-block">Laporan Mingguan</h3>
      
      <div className="flex items-end justify-between gap-2 h-48 mt-4">
        {data.map((day, idx) => {
          const heightPercent = (day.calories / maxCal) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex flex-col items-center">
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-0.5 font-bold">
                  {day.calories}
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  className="w-full bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <span className="text-[10px] font-black uppercase italic">{day.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
