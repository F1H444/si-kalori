"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export default function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  const baseClass = "bg-yellow-100/50 animate-pulse border-4 border-black/5";
  const variantClass = 
    variant === "circle" ? "rounded-full" : 
    variant === "text" ? "rounded-md h-4 w-full" : 
    "rounded-xl";

  return (
    <div className={`${baseClass} ${variantClass} ${className}`} />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-blue-50 border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <Skeleton variant="circle" className="w-8 h-8" />
        <Skeleton variant="text" className="w-16 h-4" />
      </div>
      <Skeleton variant="text" className="w-3/4 h-12 mb-4" />
      <Skeleton variant="text" className="w-1/2 h-4" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-yellow-50 text-black font-mono p-4 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b-4 border-black pb-8">
          <div className="space-y-4 w-full sm:w-1/2">
            <Skeleton variant="text" className="w-32 h-4" />
            <Skeleton variant="text" className="w-full h-16" />
          </div>
          <Skeleton className="w-full sm:w-64 h-16" />
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Card Skeleton */}
          <div className="lg:col-span-8 bg-green-50 border-4 border-black p-6 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] min-h-[450px] flex flex-col justify-between">
            <div className="flex justify-between">
              <Skeleton className="w-16 h-16" />
              <div className="text-right space-y-2">
                <Skeleton variant="text" className="w-24 h-3 ml-auto" />
                <Skeleton variant="text" className="w-48 h-8 ml-auto" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton variant="text" className="w-40 h-4" />
              <div className="flex items-baseline gap-4">
                <Skeleton className="w-64 h-32" />
                <Skeleton className="w-20 h-8" />
              </div>
            </div>
          </div>

          {/* Side Metrics Skeleton */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <SkeletonCard className="flex-1" />
            <SkeletonCard className="flex-1" />
          </div>
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard className="bg-black/5" />
        </div>
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="min-h-screen bg-yellow-50 p-4 md:p-10 font-mono text-black">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 w-full md:w-1/2">
            <Skeleton className="w-full h-24" />
            <Skeleton className="w-3/4 h-24" />
          </div>
          <Skeleton className="w-full md:w-[400px] h-16" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
          <Skeleton className="h-24 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
          <Skeleton className="h-24 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
        </div>

        {/* List Section Skeleton */}
        <div className="space-y-8">
          {/* Day Group Header */}
          <div className="flex items-center gap-4 py-4">
            <Skeleton className="w-48 h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
            <div className="flex-1 h-1 bg-black/5 hidden md:block" />
            <Skeleton className="w-32 h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
          </div>

          {/* Log Item Skeletons */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`${i % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'} border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
              <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                <Skeleton className="w-full md:w-32 h-32 shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                <div className="flex-1 w-full space-y-4">
                  <div className="flex gap-2">
                    <Skeleton variant="text" className="w-16 h-4" />
                    <Skeleton variant="text" className="w-24 h-4" />
                  </div>
                  <Skeleton variant="text" className="w-3/4 h-12" />
                  <div className="flex gap-2">
                    <Skeleton className="w-32 h-8" />
                    <Skeleton className="w-24 h-8" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="w-16 h-12" />
                  ))}
                </div>
                <Skeleton className="w-full md:w-16 h-16 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
