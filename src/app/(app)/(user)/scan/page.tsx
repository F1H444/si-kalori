"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  Type, 
  Loader2, 
  Check, 
  Zap, 
  Info, 
  ArrowLeft,
  History
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LoadingOverlay from "@/components/LoadingOverlay";

// --- TYPES ---
type ScanMode = "select" | "camera" | "upload" | "type" | "result" | "meal_selection";
type MealType = "pagi" | "siang" | "malam" | "snack" | "minuman";

interface NutritionResult {
    name: string;
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    health_score: number;
    description: string;
    healthier_options?: {
        name: string;
        image_keyword?: string;
        calories: number;
        reason: string;
    }[];
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 12,
    },
  },
};

const mealContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const mealItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function ScanPage() {
    const [mode, setMode] = useState<ScanMode>("select");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<NutritionResult | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");
    const [tempInput, setTempInput] = useState<File | string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [showInvalidModal, setShowInvalidModal] = useState(false);
    const [invalidMessage, setInvalidMessage] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => stopCamera();
    }, []);

    // --- KAMERA LOGIC ---
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("Gagal mengakses kamera. Gunakan upload atau tulis manual.");
            setMode("select");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(video, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
                        setPreview(URL.createObjectURL(file));
                        handleMealSelection(file);
                        stopCamera();
                    }
                }, "image/jpeg", 0.8);
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            let file = e.target.files[0];
            
            // Basic compression/resize if file is large (> 1MB)
            if (file.size > 1024 * 1024) {
              try {
                const compressed = await compressImage(file);
                file = compressed;
              } catch (e) {
                console.error("Compression failed", e);
              }
            }
            
            setPreview(URL.createObjectURL(file));
            handleMealSelection(file);
        }
    };

    const compressImage = (file: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new (window as any).Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 512; // Reduced for speed
            const MAX_HEIGHT = 512;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: "image/jpeg" }));
              } else {
                reject(new Error("Canvas to blob failed"));
              }
            }, "image/jpeg", 0.6); // Lower quality for speed
          };
        };
        reader.onerror = (error) => reject(error);
      });
    };

    const handleMealSelection = (input: File | string) => {
        setTempInput(input);
        setMode("meal_selection");
    };

    // --- LOGIKA ANALISA & DATABASE ---
    const handleAnalyze = async (input: File | string, mealType: MealType) => {
        console.log("⚡ [Analyze] Initializing Turbo Flow...");
        setLoading(true);

        try {
            // 0. Preliminary Check
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("❌ No user session found");
                alert("Sesi kamu habis, silakan login kembali.");
                window.location.href = "/login";
                return;
            }

            // 1. Define Concurrent Tasks
            const uploadTask = async () => {
                if (!(input instanceof File)) return null;
                console.log("📤 [Upload] Starting background upload...");
                try {
                    const fileExt = input.name.split('.').pop();
                    const path = `${user.id}/${Date.now()}.${fileExt}`;
                    
                    // Add a 15s timeout for storage upload specifically
                    const uploadPromise = supabase.storage.from('food-images').upload(path, input);
                    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Upload Timeout")), 15000));
                    
                    const { error } = await Promise.race([uploadPromise, timeout]) as any;
                    if (error) throw error;

                    const url = supabase.storage.from('food-images').getPublicUrl(path).data.publicUrl;
                    console.log("✅ [Upload] Success:", url);
                    return url;
                } catch (e) {
                    console.warn("⚠️ [Upload] Background upload failed or timed out:", e);
                    return null; // Don't block the whole flow if upload fails
                }
            };

            const aiTask = async () => {
                console.log("🤖 [AI] Requesting analysis...");
                const formData = new FormData();
                if (typeof input === "string") formData.append("text", input);
                else formData.append("image", input);
                formData.append("userEmail", user.email || "");

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s AI timeout

                try {
                    const response = await fetch("/api/analyze-food", {
                        method: "POST",
                        body: formData,
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: "Gagal membaca error dari server" }));
                        if (response.status === 403) throw new Error("LIMIT_REACHED");
                        if (response.status === 400 && errorData.error === "NOT_FOOD") {
                            setInvalidMessage(errorData.message);
                            throw new Error("NOT_FOOD");
                        }
                        throw new Error(errorData.error || `HTTP Error ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log("✅ [AI] Analysis complete");
                    return data;
                } catch (err: any) {
                    if (err.name === 'AbortError') throw new Error("Koneksi AI Terlalu Lama (Timeout). Coba lagi.");
                    throw err;
                }
            };

            // 2. Parallel Execution
            const [publicUrl, aiData] = await Promise.all([
                uploadTask(),
                aiTask()
            ]);

            // 3. Database Logging (Background)
            console.log("💾 [DB] Saving log...");
            const mealTypeMapping: any = { 
                "pagi": "breakfast", "siang": "lunch", "malam": "dinner", "snack": "snack", "minuman": "snack" 
            };
            
            supabase.from("food_logs").insert([{
                user_id: user.id,
                food_name: aiData.name,
                calories: aiData.calories,
                protein: Number(aiData.protein) || 0,
                carbs: Number(aiData.carbs) || 0,
                fat: Number(aiData.fat) || 0,
                nutrition: aiData,
                ai_analysis: aiData.description,
                image_url: publicUrl, 
                meal_type: mealTypeMapping[mealType] || "snack",
            }]).then(({ error }) => {
                if (error) console.error("❌ [DB] Insert Error:", error);
                else console.log("✅ [DB] Log Saved");
            });

            // 4. Update UI
            setResult(aiData);
            setMode("result");

        } catch (error: any) {
            console.error("🚨 [TurboFlow] Fault:", error);
            
            if (error.message === "LIMIT_REACHED") {
                alert("Kuota harian habis! Silakan upgrade ke Premium untuk scan sepuasnya.");
                window.location.href = "/premium";
            } else if (error.message === "NOT_FOOD") {
                setShowInvalidModal(true);
            } else {
                alert(error.message || "Terjadi masalah teknis. Silakan coba lagi.");
                setMode("select");
            }
        } finally {
            setLoading(false);
            console.log("🏁 [Flow] Done.");
        }
    };

    const resetScan = () => {
        setMode("select");
        setResult(null);
        setTempInput(null);
        setPreview(null);
        setInputText("");
        stopCamera();
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white font-mono text-black relative overflow-hidden pb-20">
            {/* Brutal Accents */}
            <div className="fixed bottom-0 left-0 w-32 h-32 bg-blue-600 border-t-8 border-r-8 border-black -ml-16 -mb-16 z-0" />

            <div className={`relative z-10 mx-auto px-4 pt-24 ${mode === 'result' ? 'max-w-6xl' : 'max-w-2xl'}`}>
                
                <AnimatePresence mode="wait">
                    {/* LOADING OVERLAY */}
                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <LoadingOverlay message="MENGANALISA..." isFullPage={false} />
                        </motion.div>
                    )}

                    {/* SELECT MODE */}
                    {mode === "select" && !loading && (
                        <motion.div 
                            key="select" 
                            variants={containerVariants}
                            initial="hidden" 
                            animate="visible" 
                            className="space-y-8"
                        >
                            <motion.div variants={headerVariants} className="mb-12">
                                <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2">
                                    Scan Kuy! 
                                </h1>
                                <p className="font-bold text-xl uppercase italic bg-yellow-400 inline-block px-2 text-black text-center">Analisis Makanan &amp; Minumanmu</p>
                                <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-40">Pilih cara input di bawah ini</p>
                            </motion.div>

                            <motion.div variants={containerVariants} className="grid gap-6">
                                <motion.div variants={itemVariants}>
                                    <BrutalMenuBtn 
                                        onClick={() => { setMode("camera"); startCamera(); }} 
                                        color="bg-red-500" 
                                        icon={<Camera size={32} />} 
                                        label="KAMERA LANGSUNG" 
                                        desc="Jepret makanan/minuman sekarang"
                                    />
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <BrutalMenuBtn 
                                        color="bg-yellow-400" 
                                        icon={<Upload size={32} />} 
                                        label="DARI GALERI" 
                                        desc="Pilih foto Galeri"
                                        isUpload 
                                        onChange={handleFileUpload}
                                    />
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <BrutalMenuBtn 
                                        onClick={() => setMode("type")} 
                                        color="bg-green-500" 
                                        icon={<Type size={32} />} 
                                        label="KETIK MANUAL" 
                                        desc="Tulis nama menu kamu"
                                    />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* CAMERA MODE */}
                    {mode === "camera" && !loading && (
                        <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                            <div className="w-full aspect-square border-8 border-black bg-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-10">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale-[0.2]" />
                                <canvas ref={canvasRef} className="hidden" />
                                <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none" />
                            </div>
                            
                            <div className="flex gap-6">
                                <button onClick={() => { stopCamera(); setMode("select"); }} className="p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none">
                                    <ArrowLeft size={32} />
                                </button>
                                <button 
                                    onClick={capturePhoto} 
                                    className="w-24 h-24 bg-red-500 border-4 border-black rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center transition-all"
                                >
                                    <div className="w-12 h-12 border-4 border-white rounded-full" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* TYPE MODE */}
                    {mode === "type" && !loading && (
                        <motion.div key="type" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full">
                             <button onClick={() => setMode("select")} className="mb-8 flex items-center gap-2 font-black uppercase text-sm hover:underline">
                                <ArrowLeft size={16} /> Kembali
                            </button>
                            <h2 className="text-5xl font-black uppercase mb-6 italic tracking-tighter text-black">Apa yang kamu<br/>konsumsi?</h2>
                            <textarea 
                                value={inputText} 
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Contoh: 1 Gelas Kopi Susu Gula Aren..."
                                className="w-full p-6 border-8 border-black bg-white text-2xl font-black uppercase focus:bg-yellow-400 outline-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mb-8 min-h-[200px]"
                            />
                            <button 
                                onClick={() => inputText.trim() && handleMealSelection(inputText)}
                                disabled={!inputText.trim()}
                                className="w-full bg-black text-white p-6 text-2xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                            >
                                PILIH JENIS MAKANAN
                            </button>
                        </motion.div>
                    )}

                     {/* MEAL SELECTION MODE */}
                     {mode === "meal_selection" && !loading && (
                        <motion.div 
                            key="meal_selection" 
                            variants={mealContainerVariants}
                            initial="hidden" 
                            animate="visible" 
                            className="max-w-xl mx-auto"
                        >
                            <motion.button 
                                variants={mealItemVariants}
                                onClick={() => setMode("select")} 
                                className="mb-8 flex items-center gap-2 font-black uppercase text-sm hover:underline"
                            >
                                <ArrowLeft size={16} /> Batal
                            </motion.button>
                            
                            {/* Preview Item */}
                            {preview ? (
                                <motion.div variants={mealItemVariants} className="mb-6 border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden aspect-video">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                </motion.div>
                            ) : inputText ? (
                                <motion.div variants={mealItemVariants} className="mb-6 p-6 border-8 border-black shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] bg-white">
                                    <p className="font-black italic uppercase leading-tight text-xl text-blue-600">"{inputText}"</p>
                                </motion.div>
                            ) : null}

                            <motion.div variants={mealItemVariants}>
                                <h2 className="text-4xl md:text-5xl font-black uppercase text-center mb-2 leading-none">Kapan Kamu</h2>
                                <h2 className="text-4xl md:text-5xl font-black uppercase italic text-center mb-8 bg-yellow-400 inline-block w-full">Makan Ini?</h2>
                            </motion.div>
                            
                            <motion.div variants={mealContainerVariants} className="grid gap-4">
                                <motion.div variants={mealItemVariants}>
                                    <MealOption label="Makan Pagi" value="pagi" sub="06:00 - 10:00" color="bg-orange-300" onClick={() => tempInput && handleAnalyze(tempInput, 'pagi')} />
                                </motion.div>
                                <motion.div variants={mealItemVariants}>
                                    <MealOption label="Makan Siang" value="siang" sub="11:00 - 15:00" color="bg-yellow-400" onClick={() => tempInput && handleAnalyze(tempInput, 'siang')} />
                                </motion.div>
                                <motion.div variants={mealItemVariants}>
                                    <MealOption label="Makan Malam" value="malam" sub="18:00 - 21:00" color="bg-blue-400" onClick={() => tempInput && handleAnalyze(tempInput, 'malam')} />
                                </motion.div>
                                <motion.div variants={mealItemVariants}>
                                    <MealOption label="Camilan / Snack" value="snack" sub="Kapan aja boleh" color="bg-pink-400" onClick={() => tempInput && handleAnalyze(tempInput, 'snack')} />
                                </motion.div>
                                <motion.div variants={mealItemVariants}>
                                    <MealOption label="Minuman" value="minuman" sub="Haus ya?" color="bg-zinc-300" onClick={() => tempInput && handleAnalyze(tempInput, 'minuman')} />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* RESULT MODE */}
                    {mode === "result" && result && !loading && (
                        <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2">
                                {preview && (
                                    <div className="w-full h-80 relative border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-10 overflow-hidden">
                                        <Image src={preview} alt="Result" fill className="object-cover" />
                                        <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-black uppercase">Foto_Inputan</div>
                                    </div>
                                )}

                                <div className="mb-10">
                                    <h2 className="text-6xl md:text-8xl font-black uppercase leading-[0.8] tracking-tighter mb-4 text-black">{result.name}</h2>
                                    <div className="inline-flex items-center gap-3 bg-green-500 border-4 border-black px-6 py-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black text-white uppercase text-xl">
                                        <Check strokeWidth={4} /> Skor Kesehatan: {result.health_score}/10
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                    <NutritionCard label="Kalori" value={result.calories} unit="kkal" color="bg-green-400" />
                                    <NutritionCard label="Protein" value={result.protein} unit="g" color="bg-blue-400" />
                                    <NutritionCard label="Karbo" value={result.carbs} unit="g" color="bg-yellow-400" />
                                    <NutritionCard label="Lemak" value={result.fat} unit="g" color="bg-red-400" />
                                </div>

                                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative mb-10">
                                    <Info className="absolute -top-5 -right-5 w-12 h-12 bg-black text-white p-2 border-4 border-black" />
                                    <h3 className="font-black uppercase text-xl mb-4 text-blue-600">Analisis AI</h3>
                                    <p className="text-sm font-bold italic leading-relaxed">{result.description}</p>
                                </div>

                                <button 
                                    onClick={resetScan}
                                    className="w-full bg-black text-white p-8 text-3xl font-black uppercase border-8 border-black hover:bg-yellow-400 hover:text-black transition-all shadow-[10px_10px_0px_0px_rgba(37,99,235,1)]"
                                >
                                    SCAN MENU LAIN
                                </button>
                            </div>

                            {/* SIDEBAR: ALTERNATIVES */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-black text-white p-4 flex items-center gap-2">
                                    <Zap className="text-yellow-400" />
                                    <h3 className="font-black uppercase text-xl tracking-widest">Opsi Lebih Sehat</h3>
                                </div>
                                
                                {result.healthier_options?.map((opt, i) => (
                                    <div key={i} className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
                                        <h4 className="font-black uppercase text-2xl mb-1">{opt.name}</h4>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 border border-green-700 text-[10px] font-black uppercase inline-block mb-3">
                                            {opt.calories} kcal
                                        </span>
                                        <p className="text-sm font-bold text-gray-600 uppercase italic leading-none">{opt.reason}</p>
                                    </div>
                                ))}
                                
                                <Link href="/riwayat" className="flex items-center justify-center gap-2 w-full p-4 border-4 border-black bg-blue-600 text-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all">
                                   <History /> Riwayat
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* NOT FOOD MODAL (BRUTAL STYLE) */}
            <AnimatePresence>
                {showInvalidModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInvalidModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white border-8 border-black p-10 shadow-[20px_20px_0px_0px_rgba(239,68,68,1)] z-10"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-24 h-24 bg-red-500 border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <Info size={48} className="text-white" />
                                </div>
                                <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Waduh, Bukan Makanan!</h3>
                                <div className="p-4 bg-yellow-300 border-4 border-black font-black uppercase text-sm italic">
                                    AI Bilang: "{invalidMessage}"
                                </div>
                                <p className="font-bold text-gray-600">
                                    Pastikan kamu memotret makanan atau minuman agar sistem bisa menghitung kalorinya ya!
                                </p>
                                <button 
                                    onClick={() => {
                                        setShowInvalidModal(false);
                                        setMode("select");
                                    }}
                                    className="w-full bg-black text-white p-6 text-2xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] active:translate-y-1 active:shadow-none transition-all"
                                >
                                    COBA LAGI
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

// --- HELPER COMPONENTS ---

interface BrutalMenuBtnProps {
    onClick?: () => void;
    color: string;
    icon: React.ReactNode;
    label: string;
    desc: string;
    isUpload?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function BrutalMenuBtn({ onClick, color, icon, label, desc, isUpload, onChange }: BrutalMenuBtnProps) {

    return (
        <button 
            onClick={onClick} 
            className="group relative flex items-center gap-6 p-6 bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all overflow-hidden w-full text-left"
        >
            {isUpload && <input type="file" accept="image/*" onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer z-30" />}
            <div className={`w-20 h-20 ${color} border-4 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{label}</h3>
                <p className="font-bold uppercase text-gray-400 text-sm mt-1">{desc}</p>
            </div>
        </button>
    );
}

interface NutritionCardProps {
    label: string;
    value: string | number;
    unit: string;
    color: string;
}

function NutritionCard({ label, value, unit, color }: NutritionCardProps) {
    return (
        <div className={`${color} border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
            <p className="text-[10px] font-black uppercase opacity-60 mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black uppercase tracking-tighter leading-none">{value}</span>
                <span className="text-[10px] font-black uppercase">{unit}</span>
            </div>
        </div>
    );
}

interface MealOptionProps {
    label: string;
    value: string;
    sub: string;
    color: string;
    onClick: () => void;
}

function MealOption({ label, value, sub, color, onClick }: MealOptionProps) {
    return (
        <button 
            onClick={onClick}
            className={`w-full ${color} border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-between group`}
        >
            <div className="text-left">
                <p className="text-xs font-bold uppercase opacity-60 mb-0.5">{sub}</p>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">{label}</h3>
            </div>
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-transparent group-hover:border-white group-hover:bg-transparent group-hover:text-black transition-colors">
                 <Check size={20} />
            </div>
        </button>
    );
}
