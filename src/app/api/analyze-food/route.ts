import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildPersonalizedPrompt } from "@/lib/ai-prompt-builder";
import type { UserProfile } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const text = formData.get("text") as string | null;
    const userEmail = formData.get("userEmail") as string | null;

    let userProfile: UserProfile | undefined;

    // 1. Get Profile (for personalized recommendations only)
    if (userEmail) {
      try {
        const { createAdminClient } = await import("@/lib/supabase-admin");
        const supabase = createAdminClient();
        
        // Fetch basic profile info for personalized recommendations
        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", userEmail)
          .single();

        if (!error && profile) {
          userProfile = {
            id: profile.id,
            goal: (profile as any).goal || "maintain",
            is_premium: false, // All features are now free
            recommendedCalories: (profile as any).daily_calorie_target || 2000,
            age: (profile as any).age || 25,
            gender: (profile as any).gender || "male",
            height: (profile as any).height || 170,
            weight: (profile as any).weight || 60,
            activityLevel: (profile as any).activity_level || "moderate",
            full_name: (profile as any).full_name || "User",
          };
        }
      } catch (e) {
        console.warn("Profile check failed", e);
      }
    }

    // 2. Initialize Groq
    const apiKey = process.env.GROQ_API_KEY;
    console.log("🔑 [AnalyzeFood] Checking API Key:", apiKey ? "PRESENT" : "MISSING");
    
    if (!apiKey) {
      console.error("❌ [AnalyzeFood] GROQ_API_KEY is not defined in environment variables");
      return NextResponse.json({ error: "GROQ_API_KEY belum disetting" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });
    
    // Centralized Prompt with Critical Thinking Logic
    const systemPrompt = buildPersonalizedPrompt(userProfile);

    // 3. Prepare Content
    let messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: [] }
    ];

    if (image && typeof image !== "string") {
      console.log("📸 [AnalyzeFood] Processing image input...");
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const dataUrl = `data:${image.type};base64,${base64}`;
      
      const userMessage = messages[1].content as any[];
      userMessage.push({ 
        type: "text", 
        text: `Tugas: Analisa gambar ini secara kritis. Berikan breakdown nutrisi dalam JSON.` 
      });
      userMessage.push({ 
        type: "image_url", 
        image_url: { url: dataUrl } 
      });
    } else if (text) {
      console.log("✍️ [AnalyzeFood] Processing text input:", text);
      messages[1].content = `Tugas: Analisa teks makanan ini secara kritis: "${text}". Berikan breakdown nutrisi dalam JSON.`;
    } else {
      console.warn("⚠️ [AnalyzeFood] No input detected");
      return NextResponse.json({ error: "No input" }, { status: 400 });
    }

    // 4. Analyze with Groq
    // Verified available vision model in Feb 2026: meta-llama/llama-4-scout-17b-16e-instruct
    const modelId = image ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile";
    console.log(`🤖 [AnalyzeFood] Calling Groq with model: ${modelId}`);
    
    // Safety check: wrap in a 25s timeout promise to ensure it doesn't hang the function
    const aiPromise = groq.chat.completions.create({
      messages,
      model: modelId,
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("GROQ_TIMEOUT")), 25000)
    );

    let completion: any;
    try {
      completion = await Promise.race([aiPromise, timeoutPromise]);
    } catch (err: any) {
      console.error("💥 [AnalyzeFood] Detailed Error during AI call:", err);
      if (err.message === "GROQ_TIMEOUT") {
         return NextResponse.json({ error: "AI_TIMEOUT", message: "AI sedang sangat sibuk. Coba lagi dalam 10 detik." }, { status: 504 });
      }
      return NextResponse.json({ error: "AI_ERROR", message: err.message || "Gagal menghubungi AI" }, { status: 500 });
    }

    const resultContent = completion.choices[0]?.message?.content;
    console.log("📝 [AnalyzeFood] Groq Response Content Received");
   
    if (!resultContent) {
      console.error("❌ [AnalyzeFood] Groq returned empty content");
      return NextResponse.json({ error: "EMPTY_AI_RESPONSE", message: "AI tidak memberikan jawaban." }, { status: 500 });
    }
    
    // Robust JSON Extraction
    let jsonResult;
    try {
      // Find the first '{' and the last '}' to extract only the JSON object
      const firstBrace = resultContent.indexOf('{');
      const lastBrace = resultContent.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Pola JSON tidak ditemukan dalam respon AI.");
      }
      
      const jsonString = resultContent.substring(firstBrace, lastBrace + 1);
      jsonResult = JSON.parse(jsonString);
      console.log("✅ [AnalyzeFood] Successfully parsed JSON:", jsonResult.name);
    } catch (parseErr) {
      console.error("❌ [AnalyzeFood] JSON Parse Error. Content:", resultContent);
      throw new Error("Gagal memproses format data dari AI.");
    }

    // 5. Validation
    if (jsonResult.is_food === false) {
      console.warn("🚫 [AnalyzeFood] Input is not food:", jsonResult.description);
      return NextResponse.json({ 
        error: "NOT_FOOD", 
        message: jsonResult.description || "Maaf, sistem hanya bisa menganalisa makanan dan minuman." 
      }, { status: 400 });
    }

    // 6. Return Result
    return NextResponse.json({
      ...jsonResult,
      personalized: !!userProfile,
      userGoal: userProfile?.goal,
      userCalorieTarget: userProfile?.recommendedCalories,
    });

  } catch (err: any) {
    console.error("🚨 [AnalyzeFood] Exception:", err);
    let msg = "Gagal menganalisa makanan.";
    
    if (err.message?.includes("429")) {
      msg = "Batas penggunaan AI tercapai. Silakan coba lagi dalam 1 menit.";
    } else if (err.message?.includes("API Key") || err.message?.includes("apikey")) {
      msg = "Masalah koneksi ke AI (API Key tidak valid).";
    } else if (err.message) {
      msg = err.message;
    }
    
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}