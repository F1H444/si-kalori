import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildPersonalizedPrompt } from "@/lib/ai-prompt-builder";
import { getProfileByEmail } from "@/lib/db/profiles";
import type { UserProfile } from "@/types/user";



export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const image = formData.get("image") as File | null;
        const text = formData.get("text") as string | null;
        const userEmail = formData.get("userEmail") as string | null;

        let userProfile: UserProfile | undefined;

        // --- GET PROFILE FROM SUPABASE ---
        if (userEmail) {
            try {
                const profile = await getProfileByEmail(userEmail);
                if (profile && profile.weight && profile.height) {
                    userProfile = profile;
                    console.log('User profile loaded from Supabase:', {
                        email: userEmail,
                        goal: profile.goal,
                    });
                }
            } catch (err) {
                console.log("No profile found in Supabase:", (err as Error).message);
            }
        }

        // -------------------------

        // Cek API Key Groq
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "GROQ_API_KEY belum disetting" },
                { status: 500 }
            );
        }

        const groq = new Groq({ apiKey });

        // Build personalized or default prompt
        const systemPrompt = buildPersonalizedPrompt(userProfile);

        let userContent: (
            | { type: "text"; text: string }
            | { type: "image_url"; image_url: { url: string } }
        )[] = [];


        if (image) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = buffer.toString("base64");
            const dataUrl = `data:${image.type};base64,${base64Image}`;

            userContent = [
                { type: "text", text: "Analyze this food image and calculate its nutrition." },
                { type: "image_url", image_url: { url: dataUrl } }
            ];
        } else if (text) {
            userContent = [
                { type: "text", text: `Analyze this food: ${text}` }
            ];
        } else {
            return NextResponse.json({ error: "No input provided" }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
            response_format: { type: "json_object" }
        });

        const resultContent = completion.choices[0]?.message?.content;

        if (!resultContent) {
            throw new Error("No response from AI");
        }

        const jsonResult = JSON.parse(resultContent);

        // --- SAVE TO SCAN LOGS ---
        if (userEmail && userProfile) {
            try {
                // We need the profile ID to save the log. 
                // Since userProfile from getProfileByEmail doesn't have ID, 
                // we fetch it quickly here or update getProfileByEmail.
                // For safety, let's use the supabase client directly to get the ID.
                const { data: profileData } = await (await import("@/lib/supabase")).supabase
                    .from("profiles")
                    .select("id")
                    .eq("email", userEmail)
                    .single();

                if (profileData) {
                    await (await import("@/lib/supabase")).supabase
                        .from("food_logs")
                        .insert([{
                            user_id: profileData.id,
                            food_name: jsonResult.name,
                            nutrition: {
                                calories: jsonResult.calories,
                                protein: jsonResult.protein,
                                carbs: jsonResult.carbs,
                                fat: jsonResult.fat,
                                health_score: jsonResult.health_score
                            },
                            ai_analysis: jsonResult.description,
                            meal_type: "other", 
                            rating: jsonResult.health_score
                        }]);
                    console.log("Scan log saved to food_logs for:", userEmail);
                }
            } catch (saveError) {
                console.warn("Failed to save scan log:", saveError);
            }
        }
        
        // Add personalization flag to response
        return NextResponse.json({
            ...jsonResult,
            personalized: !!userProfile,
            userGoal: userProfile?.goal,
            userCalorieTarget: userProfile?.recommendedCalories,
        });

    } catch (err: unknown) {
        const error = err as Error;
        console.error("Error analyzing food with Groq:", error);
        return NextResponse.json(
            { error: `Gagal menganalisa makanan: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }

}
