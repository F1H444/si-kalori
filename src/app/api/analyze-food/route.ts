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

    // 1. Get Profile & Check Limits
    if (userEmail) {
      try {
        const { createAdminClient } = await import("@/lib/supabase-admin");
        const supabase = createAdminClient();
        // 1. Fetch basic profile info
        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", userEmail)
          .single();

        if (error || !profile) throw new Error("Profile not found");

        // 2. Detect available columns for premium check
        const availableColumns = Object.keys(profile);
        let isPremium = false;

        if (availableColumns.includes("is_premium")) {
          isPremium = !!(profile as any).is_premium;
        } else {
          // Fallback: Check premium_subscriptions table directly
          const { data: sub } = await supabase
            .from("premium_subscriptions")
            .select("id")
            .eq("user_id", profile.id)
            .eq("status", "active")
            .gte("expired_at", new Date().toISOString())
            .maybeSingle();
          isPremium = !!sub;
        }

        if (!isPremium) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const { count } = await supabase
            .from("food_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)
            .gte("created_at", today.toISOString());

          if ((count || 0) >= 10) {
            return NextResponse.json({ error: "LIMIT_REACHED", message: "Kuota gratis habis. Upgrade ke Premium!" }, { status: 403 });
          }
        }

        userProfile = {
          id: profile.id,
          goal: (profile as any).goal || "maintain",
          is_premium: isPremium,
          recommendedCalories: (profile as any).daily_calorie_target || 2000,
          age: (profile as any).age || 25,
          gender: (profile as any).gender || "male",
          height: (profile as any).height || 170,
          weight: (profile as any).weight || 60,
          activityLevel: (profile as any).activity_level || "moderate",
          full_name: (profile as any).full_name || "User",
        };
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
    // Use llama-3.2-11b-vision-preview for vision tasks and llama-3.3-70b-versatile for text
    const modelId = image ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";
    console.log(`🤖 [AnalyzeFood] Calling Groq with model: ${modelId}`);
    
    const completion = await groq.chat.completions.create({
      messages,
      model: modelId,
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    }).catch(err => {
      console.error("💥 [AnalyzeFood] Groq SDK Error:", err);
      throw err;
    });

    const resultContent = completion.choices[0]?.message?.content;
    console.log("📝 [AnalyzeFood] Groq Response Content:", resultContent);
    
    if (!resultContent) {
      console.error("❌ [AnalyzeFood] Groq returned empty content");
      throw new Error("AI No Response");
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
