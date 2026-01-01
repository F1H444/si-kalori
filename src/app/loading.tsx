import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
        <p className="text-sm font-black uppercase tracking-widest animate-pulse">
          Memuat Data...
        </p>
      </div>
    </div>
  );
}
