import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildPersonalizedPrompt } from "@/lib/ai-prompt-builder";
import type { UserProfile } from "@/types/user";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const text = formData.get("text") as string | null;
    const userEmail = formData.get("userEmail") as string | null;

    let userProfile: UserProfile | undefined;

    // 1. Get User Profile & Check Limits
    if (userEmail) {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: profile, error } = await supabase
          .from("users")
          .select("id, is_premium, goal, daily_calorie_target, age, gender, height, weight, activity_level, full_name")
          .eq("email", userEmail)
          .single();

        if (error || !profile) throw new Error("User profile not found");

        // CHECK LIMIT IF NOT PREMIUM
        if (!profile.is_premium) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const { count, error: countError } = await supabase
            .from("food_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", profile.id)
            .gte("created_at", today.toISOString());

          if (!countError && (count || 0) >= 10) {
            return NextResponse.json(
              { error: "LIMIT_REACHED", message: "Batas harian gratis habis. Tingkatkan ke Premium!" },
              { status: 403 }
            );
          }
        }

        userProfile = {
          id: profile.id,
          goal: profile.goal || "maintain",
          is_premium: profile.is_premium,
          recommendedCalories: profile.daily_calorie_target || 2000,
          age: profile.age || 25,
          gender: profile.gender || "male",
          height: profile.height || 170,
          weight: profile.weight || 60,
          activityLevel: profile.activity_level || "moderate",
          full_name: profile.full_name || "User",
        };
      } catch (err) {
        console.warn("Profile check failed:", (err as Error).message);
      }
    }

    // 2. Initialize Gemini
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Sistem AI belum siap (Missing API Key)" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = buildPersonalizedPrompt(userProfile);
    
    // 3. Prepare Content for Gemini
    let promptParts: any[] = [systemPrompt];
    
    if (image) {
      const bytes = await image.arrayBuffer();
      const base64Data = Buffer.from(bytes).toString("base64");
      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: image.type
        }
      });
      promptParts.push("Analisa makanan dalam gambar ini dan berikan estimasi nutrisinya dalam format JSON.");
    } else if (text) {
      promptParts.push(`Analisa makanan berikut: ${text}`);
    } else {
      return NextResponse.json({ error: "Input tidak ditemukan" }, { status: 400 });
    }

    // 4. Generate Content
    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const resultContent = response.text();
 
    if (!resultContent) throw new Error("AI tidak memberikan respon.");
    const jsonResult = JSON.parse(resultContent);

    // 5. Validation: Is it Food?
    if (jsonResult.is_food === false) {
      return NextResponse.json({ 
        error: "NOT_FOOD", 
        message: jsonResult.description || "Sepertinya ini bukan makanan. Coba scan yang lain!",
        name: jsonResult.name
      }, { status: 400 });
    }
 
    // 6. Save to DB
    if (userEmail && userProfile) {
      try {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("food_logs").insert([{
          user_id: userProfile.id,
          food_name: jsonResult.name,
          nutrition: {
            calories: jsonResult.calories,
            protein: jsonResult.protein,
            carbs: jsonResult.carbs,
            fat: jsonResult.fat,
            health_score: jsonResult.health_score,
          },
          ai_analysis: jsonResult.description,
          meal_type: "other",
        }]);
      } catch (dbErr) {
        console.error("Failed to save log:", dbErr);
      }
    }

    return NextResponse.json({
      ...jsonResult,
      personalized: !!userProfile,
      userGoal: userProfile?.goal,
      userCalorieTarget: userProfile?.recommendedCalories,
    });

  } catch (err: any) {
    console.error("Gemini Error:", err);
    return NextResponse.json({ error: `Gagal menganalisa makanan: ${err.message}` }, { status: 500 });
  }
}
