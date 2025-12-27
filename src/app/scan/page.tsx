"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Type, ArrowLeft, Loader2, Check, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");
    const [mounted, setMounted] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        setMounted(true);
        return () => {
            stopCamera();
        };
    }, []);

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
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please try another method.");
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
            
            // Resize logic
            const MAX_SIZE = 800;
            let width = video.videoWidth;
            let height = video.videoHeight;

            if (width > height) {
                if (width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                }
            } else {
                if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(video, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                        handleAnalyze(file);
                        stopCamera();
                    }
                }, "image/jpeg", 0.8); // 0.8 quality
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Resize image
            const img = document.createElement("img");
            const url = URL.createObjectURL(file);
            img.src = url;
            
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_SIZE = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
                            setPreview(URL.createObjectURL(resizedFile));
                            handleAnalyze(resizedFile);
                        }
                    }, "image/jpeg", 0.8);
                }
            };
        }
    };

    const handleAnalyze = async (input: File | string) => {
        setLoading(true);
        setResult(null); // Clear previous result

        const formData = new FormData();
        if (typeof input === "string") {
            formData.append("text", input);
        } else {
            formData.append("image", input);
        }

        // [NEW] Kirim email user untuk cek limit
        const userSession = localStorage.getItem("user_session");
        if (userSession) {
            const user = JSON.parse(userSession);
            formData.append("userEmail", user.email);
        }

        try {
            const response = await fetch("/api/analyze-food", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                setResult(data);
                setMode("result");
            } else {
                // Handle Limit Error
                if (response.status === 403) {
                    // Handle Limit Error
                    if (response.status === 403) {
                        setShowLimitModal(true);
                    } else {
                        alert(data.error || "Failed to analyze");
                    }
                } else {
                    alert(data.error || "Failed to analyze");
                }
                setMode("select");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong");
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

    // Brutal Button Component
    const BrutalButton = ({ onClick, children, className = "", disabled = false }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        relative px-6 py-4 bg-white text-black font-black border-4 border-black 
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
        hover:translate-x-[2px] hover:translate-y-[2px] 
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px] 
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-white relative overflow-hidden font-sans text-black">
            {/* Brutal Grid Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(to right, #000 1px, transparent 1px)`,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            {/* Geometric Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 border-l-4 border-b-4 border-black -mr-16 -mt-16 z-0" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 border-r-4 border-t-4 border-black -ml-12 -mb-12 z-0" />

            <div className={`relative z-10 mx-auto px-4 py-12 min-h-screen flex flex-col pt-24 ${mode === 'result' ? 'max-w-6xl' : 'max-w-2xl'}`}>

                {/* Header Removed as requested */}
                <div className="mb-12"></div>

                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">

                        {/* SELECT MODE */}
                        {mode === "select" && (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -50 }}
                                className="grid gap-6"
                            >
                                <div className="bg-black text-white p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] mb-4">
                                    <p className="font-bold text-lg text-center uppercase tracking-wide">
                                        Pilih Metode Scan
                                    </p>
                                </div>

                                <button
                                    onClick={() => { setMode("camera"); startCamera(); }}
                                    className="group flex items-center gap-6 p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
                                >
                                    <div className="w-16 h-16 bg-red-500 border-4 border-black flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <Camera size={32} className="text-white" strokeWidth={3} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-2xl uppercase">Ambil Foto</h3>
                                        <p className="font-bold text-gray-600">Scan langsung via kamera</p>
                                    </div>
                                </button>

                                <button
                                    className="group relative flex items-center gap-6 p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="w-16 h-16 bg-yellow-400 border-4 border-black flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <Upload size={32} className="text-black" strokeWidth={3} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-2xl uppercase">Upload Foto</h3>
                                        <p className="font-bold text-gray-600">Pilih dari galeri</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setMode("type")}
                                    className="group flex items-center gap-6 p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200"
                                >
                                    <div className="w-16 h-16 bg-green-500 border-4 border-black flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <Type size={32} className="text-white" strokeWidth={3} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-2xl uppercase">Tulis Nama</h3>
                                        <p className="font-bold text-gray-600">Input manual makanan</p>
                                    </div>
                                </button>
                            </motion.div>
                        )}

                        {/* CAMERA MODE */}
                        {mode === "camera" && (
                            <motion.div
                                key="camera"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center w-full"
                            >
                                <div className="relative w-full aspect-[3/4] bg-black border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <canvas ref={canvasRef} className="hidden" />

                                    {/* Overlay UI */}
                                    <div className="absolute inset-0 border-[3px] border-white/30 m-4 pointer-events-none">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                                    </div>
                                </div>

                                <button
                                    onClick={capturePhoto}
                                    className="group relative w-20 h-20 bg-red-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                                >
                                    <Camera className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
                                </button>
                            </motion.div>
                        )}

                        {/* TYPE MODE */}
                        {mode === "type" && (
                            <motion.div
                                key="type"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="flex flex-col w-full"
                            >
                                <div className="bg-green-500 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
                                    <h2 className="text-3xl font-black text-white uppercase mb-2">Apa Makananmu?</h2>
                                    <p className="font-bold text-black">Ketik nama makanan secara spesifik</p>
                                </div>

                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="CONTOH: NASI PADANG"
                                    className="w-full p-6 border-4 border-black text-xl font-black uppercase placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-black/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(inputText)}
                                />

                                <button
                                    onClick={() => handleAnalyze(inputText)}
                                    disabled={!inputText.trim()}
                                    className="w-full relative px-6 py-4 bg-black text-white font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-xl uppercase tracking-wider text-white">Analisa Sekarang</span>
                                </button>
                            </motion.div>
                        )}

                        {/* LOADING OVERLAY */}
                        {loading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm"
                            >
                                <div className="w-24 h-24 border-8 border-gray-200 border-t-black rounded-full animate-spin mb-8" />
                                <h3 className="text-4xl font-black uppercase text-center mb-2">Menganalisa...</h3>
                                <p className="font-bold text-xl text-center bg-yellow-400 px-4 py-1 border-2 border-black inline-block transform -rotate-2">
                                    AI SEDANG BEKERJA
                                </p>
                            </motion.div>
                        )}

                        {/* RESULT MODE */}
                        {mode === "result" && result && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full pb-8"
                            >
                                {/* Left Column: Main Info */}
                                <div className="lg:col-span-2">
                                    {preview && (
                                        <div className="w-full h-64 relative border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 bg-gray-100">
                                            <Image src={preview} alt="Food" fill className="object-cover" />
                                            <div className="absolute bottom-0 right-0 bg-black text-white px-4 py-2 border-t-4 border-l-4 border-black">
                                                <span className="font-black uppercase">Captured</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h2 className="text-4xl sm:text-5xl font-black text-black uppercase leading-[0.9] mb-4">
                                            {result.name}
                                        </h2>
                                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <Check size={24} strokeWidth={4} className="text-white" />
                                            <span className="font-black text-white text-lg uppercase">
                                                Health Score: {result.health_score}/10
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                            <p className="font-black text-sm uppercase mb-1">Kalori</p>
                                            <p className="text-3xl font-black text-red-500">{result.calories}</p>
                                            <p className="text-xs font-bold text-gray-500">KCAL</p>
                                        </div>
                                        <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                            <p className="font-black text-sm uppercase mb-1">Protein</p>
                                            <p className="text-3xl font-black text-blue-500">{result.protein}</p>
                                        </div>
                                        <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                            <p className="font-black text-sm uppercase mb-1">Karbo</p>
                                            <p className="text-3xl font-black text-yellow-500">{result.carbs}</p>
                                        </div>
                                        <div className="bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                            <p className="font-black text-sm uppercase mb-1">Lemak</p>
                                            <p className="text-3xl font-black text-orange-500">{result.fat}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 relative">
                                        <div className="absolute -top-4 -left-2 bg-black text-white px-3 py-1 text-sm font-black uppercase transform -rotate-2">
                                            Analisis AI
                                        </div>
                                        <p className="text-lg font-bold leading-relaxed">{result.description}</p>
                                    </div>

                                    <BrutalButton onClick={resetScan} className="w-full bg-black text-white">
                                        <span className="text-xl uppercase tracking-wider">Scan Lagi</span>
                                    </BrutalButton>
                                </div>

                                {/* Right Column: Healthier Options */}
                                <div className="lg:col-span-1">
                                    {result.healthier_options && result.healthier_options.length > 0 ? (
                                        <div className="bg-green-100 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24">
                                            <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                                                <Zap className="w-8 h-8 text-green-600 fill-current" />
                                                Alternatif
                                            </h3>
                                            <div className="space-y-4">
                                                {result.healthier_options.map((option, idx) => (
                                                    <div key={idx} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                        {/* Dynamic Image */}
                                                        <div className="relative w-full h-32 mb-3 border-2 border-black overflow-hidden bg-gray-100">
                                                            <Image
                                                                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(option.image_keyword || option.name)}%20food%20realistic%20delicious?width=400&height=300&nologo=true`}
                                                                alt={option.name}
                                                                fill
                                                                className="object-cover hover:scale-110 transition-transform duration-500"
                                                                unoptimized
                                                            />
                                                        </div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-black text-lg uppercase leading-tight">{option.name}</h4>
                                                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 border border-black shrink-0 ml-2">
                                                                {option.calories} KCAL
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-700">{option.reason}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="hidden lg:block bg-gray-100 p-6 border-4 border-black border-dashed opacity-50 text-center">
                                            <p className="font-bold uppercase">Tidak ada alternatif khusus</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* PREMIUM LIMIT MODAL */}
            <AnimatePresence>
                {
                    showLimitModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowLimitModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="relative w-full max-w-md bg-[#1e1e2e] border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 text-white overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Badge */}
                                <div className="absolute top-4 right-4 bg-[#6366f1] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                                    New
                                </div>

                                <h2 className="text-3xl font-black mb-2">Premium</h2>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-[#6366f1]">Rp 25.000</span>
                                    <span className="text-gray-400 text-sm font-bold">/ bulan</span>
                                </div>

                                <Link
                                    href="/payment"
                                    className="block w-full py-4 bg-[#6366f1] hover:bg-[#5558e6] text-white font-black uppercase tracking-wider border-2 border-transparent hover:border-white transition-all mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-center"
                                >
                                    Upgrade Sekarang
                                </Link>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-[#6366f1]" />
                                        <span className="font-bold text-gray-300">Unlimited Food Scans</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-[#6366f1]" />
                                        <span className="font-bold text-gray-300">Detail Nutrisi Lengkap</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-[#6366f1]" />
                                        <span className="font-bold text-gray-300">Rekomendasi Diet AI</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-[#6366f1]" />
                                        <span className="font-bold text-gray-300">Simpan Riwayat Scan</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowLimitModal(false)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                                >
                                    {/* Close Icon if needed, but clicking outside works too */}
                                </button>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
