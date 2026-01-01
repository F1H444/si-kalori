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

// --- TYPES ---
type ScanMode = "select" | "camera" | "upload" | "type" | "result";

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

export default function ScanPage() {
    const [mode, setMode] = useState<ScanMode>("select");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<NutritionResult | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");
    const [mounted, setMounted] = useState(false);

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
                        handleAnalyze(file);
                        stopCamera();
                    }
                }, "image/jpeg", 0.8);
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setPreview(URL.createObjectURL(file));
            handleAnalyze(file);
        }
    };

    // --- LOGIKA ANALISA & DATABASE ---
    const handleAnalyze = async (input: File | string) => {
        setLoading(true);
        try {
            // 1. Dapatkan User Session
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Silakan login terlebih dahulu untuk menyimpan data.");

            // 2. Upload Gambar ke Supabase Storage (Jika ada input file)
            let publicUrl = null;
            if (input instanceof File) {
                try {
                    const fileExt = input.name.split('.').pop();
                    const path = `${user.id}/${Date.now()}.${fileExt}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('food_images')
                        .upload(path, input);

                    if (uploadError) {
                        console.warn("⚠️ Storage upload failed (Check if 'food_images' bucket exists):", uploadError.message);
                    } else {
                        const { data } = supabase.storage.from('food_images').getPublicUrl(path);
                        publicUrl = data.publicUrl;
                    }
                } catch (storageErr) {
                    console.warn("⚠️ Storage exception:", storageErr);
                }
            }

            // 3. Panggil API AI (Analyze-Food)
            const formData = new FormData();
            if (typeof input === "string") formData.append("text", input);
            else formData.append("image", input);
            formData.append("userEmail", user.email || "");

            const response = await fetch("/api/analyze-food", {
                method: "POST",
                body: formData,
            });

            const aiData: NutritionResult = await response.json();
            
            if (!response.ok) {
                throw new Error("Gagal menganalisis makanan atau minuman kamu.");
            }

            // 4. Simpan ke Tabel 'food_logs'
            const { error: dbError } = await supabase
                .from("food_logs")
                .insert([{
                    user_id: user.id,
                    food_name: aiData.name,
                    nutrition: {
                        calories: aiData.calories,
                        protein: aiData.protein,
                        carbs: aiData.carbs,
                        fat: aiData.fat,
                        health_score: aiData.health_score
                    },
                    ai_analysis: aiData.description,
                    image_url: publicUrl, // URL gambar asli (bukan blob preview)
                    meal_type: "Scan AI"
                }]);

            if (dbError) throw dbError;

            setResult(aiData);
            setMode("result");
        } catch (error: unknown) {
            const err = error as Error;
            alert(err.message || "Something went wrong");
            setMode("select");
        } finally {

            setLoading(false);
        }
    };

    const resetScan = () => {
        setMode("select");
        setResult(null);
        setPreview(null);
        setInputText("");
        stopCamera();
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#F0F0F0] font-mono text-black relative overflow-hidden pb-20">
            {/* Brutal Accents */}
            <div className="fixed top-0 right-0 w-48 h-48 bg-yellow-400 border-b-8 border-l-8 border-black -mr-20 -mt-20 z-0" />
            <div className="fixed bottom-0 left-0 w-32 h-32 bg-blue-600 border-t-8 border-r-8 border-black -ml-16 -mb-16 z-0" />

            <div className={`relative z-10 mx-auto px-4 pt-24 ${mode === 'result' ? 'max-w-6xl' : 'max-w-2xl'}`}>
                
                <AnimatePresence mode="wait">
                    {/* LOADING OVERLAY */}
                    {loading && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white/90 z-[100] flex flex-col items-center justify-center p-6 text-center"
                        >
                            <Loader2 className="w-20 h-20 animate-spin mb-6 text-black" strokeWidth={3} />
                            <h2 className="text-5xl font-black uppercase tracking-tighter italic text-black">Lagi Diproses...</h2>
                            <p className="mt-4 bg-black text-white px-6 py-2 font-bold uppercase shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]">
                                Menganalisa
                            </p>
                        </motion.div>
                    )}

                    {/* SELECT MODE */}
                    {mode === "select" && (
                        <motion.div key="select" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                            <div className="mb-12">
                                <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2">
                                    Scan Kuy! 
                                </h1>
                                <p className="font-bold text-xl uppercase italic bg-yellow-400 inline-block px-2 text-black text-center">Analisis Makanan & Minumanmu</p>
                                <p className="mt-2 text-xs font-black uppercase tracking-widest opacity-40">Pilih cara input di bawah ini</p>
                            </div>

                            <div className="grid gap-6">
                                <BrutalMenuBtn 
                                    onClick={() => { setMode("camera"); startCamera(); }} 
                                    color="bg-red-500" 
                                    icon={<Camera size={32} />} 
                                    label="KAMERA LANGSUNG" 
                                    desc="Jepret makanan/minuman sekarang"
                                />
                                <BrutalMenuBtn 
                                    color="bg-yellow-400" 
                                    icon={<Upload size={32} />} 
                                    label="DARI GALERI" 
                                    desc="Pilih foto Galeri"
                                    isUpload 
                                    onChange={handleFileUpload}
                                />
                                <BrutalMenuBtn 
                                    onClick={() => setMode("type")} 
                                    color="bg-green-500" 
                                    icon={<Type size={32} />} 
                                    label="KETIK MANUAL" 
                                    desc="Tulis nama menu kamu"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* CAMERA MODE */}
                    {mode === "camera" && (
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
                    {mode === "type" && (
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
                                onClick={() => inputText.trim() && handleAnalyze(inputText)}
                                disabled={!inputText.trim()}
                                className="w-full bg-black text-white p-6 text-2xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                            >
                                ANALISIS DATA
                            </button>
                        </motion.div>
                    )}

                    {/* RESULT MODE */}
                    {mode === "result" && result && (
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
                                    <h3 className="font-black uppercase text-xl mb-4 text-blue-600">AI_DESCRIPTION.txt</h3>
                                    <p className="text-xl font-bold italic leading-tight">{result.description}</p>
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
