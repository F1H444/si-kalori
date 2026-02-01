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
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY belum disetting" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });
    const systemPrompt = buildPersonalizedPrompt(userProfile) + "\n\nWAJIB: Kembalikan HANYA JSON mentah tanpa backticks markdown atau teks penjelasan apapun.";

    // 3. Prepare Content
    let messages: any[] = [{ role: "system", content: systemPrompt }];
    let userContent: any[] = [];

    if (image && typeof image !== "string") {
      const bytes = await image.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const dataUrl = `data:${image.type};base64,${base64}`;
      
      userContent.push({ type: "text", text: "Identify this food and analyze nutrition." });
      userContent.push({ type: "image_url", image_url: { url: dataUrl } });
    } else if (text) {
      userContent.push({ type: "text", text: `Analyze this: ${text}` });
    } else {
      return NextResponse.json({ error: "No input" }, { status: 400 });
    }

    messages.push({ role: "user", content: userContent });

    // 4. Analyze with Groq (Llama 3.2 Vision)
    // Note: JSON mode might not be fully supported on all vision models yet, so we use manual parsing
    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.1, // Lower temperature for more consistent JSON
    });

    const resultContent = completion.choices[0]?.message?.content;
    if (!resultContent) throw new Error("AI No Response");
    
    // Robust JSON Extraction
    let jsonResult;
    try {
      // Remove any markdown code block markers if present
      const cleanJson = resultContent.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonResult = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error("AI returned invalid JSON:", resultContent);
      throw new Error("Gagal memproses hasil analisis AI.");
    }

    // 5. Validation
    if (jsonResult.is_food === false) {
      return NextResponse.json({ 
        error: "NOT_FOOD", 
        message: jsonResult.description || "Maaf, sistem hanya bisa menganalisa makanan dan minuman." 
      }, { status: 400 });
    }

    // 6. Return Result (Frontend will handle saving to DB to avoid duplication)
    return NextResponse.json({
      ...jsonResult,
      personalized: !!userProfile,
      userGoal: userProfile?.goal,
      userCalorieTarget: userProfile?.recommendedCalories,
    });

  } catch (err: any) {
    console.error("Analysis Exception:", err);
    let msg = "Gagal menganalisa makanan.";
    
    // Handle specific Groq errors
    if (err.message?.includes("429")) {
      msg = "Batas penggunaan AI tercapai. Silakan coba lagi dalam 1 menit.";
    } else if (err.message?.includes("analysis")) {
      msg = err.message;
    }
    
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
