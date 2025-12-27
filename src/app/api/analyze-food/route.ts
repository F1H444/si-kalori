import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildPersonalizedPrompt } from "@/lib/ai-prompt-builder";
import { getProfileByEmail } from "@/lib/db/profiles";
import type { UserProfile } from "@/types/user";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "data", "users.json");

function getUsers() {
    try {
        if (!fs.existsSync(usersFilePath)) return [];
        return JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
    } catch {
        return [];
    }
}

function saveUsers(users: any[]) {
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const image = formData.get("image") as File | null;
        const text = formData.get("text") as string | null;
        const userEmail = formData.get("userEmail") as string | null;

        let userProfile: UserProfile | undefined;

        // --- LOGIKA LIMIT SCAN + GET PROFILE FROM SUPABASE ---
        if (userEmail) {
            const users = getUsers();
            const userIndex = users.findIndex((u: any) => u.email === userEmail);

            if (userIndex !== -1) {
                const user = users[userIndex];
                const today = new Date().toISOString().split('T')[0];

                // Reset jika hari berganti
                if (user.lastScanDate !== today) {
                    user.scanCount = 0;
                    user.lastScanDate = today;
                }

                // Cek Limit (Max 10 jika bukan Premium)
                const currentScanCount = user.scanCount || 0;
                if (!user.isPremium && currentScanCount >= 10) {
                    return NextResponse.json(
                        { error: "Limit harian habis (10/10). Upgrade ke Premium untuk scan tanpa batas!" },
                        { status: 403 }
                    );
                }

                // Increment scan count
                user.scanCount = currentScanCount + 1;
                users[userIndex] = user;
                saveUsers(users);

                // Get user profile from Supabase for personalization
                try {
                    const profile = await getProfileByEmail(userEmail);
                    if (profile && profile.weight && profile.height) {
                        userProfile = profile;
                        console.log('✅ User profile loaded from Supabase:', {
                            email: userEmail,
                            goal: profile.goal,
                            bmr: profile.bmr,
                            tdee: profile.tdee,
                        });
                    } else {
                        console.log('⚠️ Profile found but incomplete for:', userEmail);
                    }
                } catch (error) {
                    console.log("⚠️ No profile found in Supabase, using default prompts");
                }
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

        let userContent: any[] = [];

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
        
        // Add personalization flag to response
        return NextResponse.json({
            ...jsonResult,
            personalized: !!userProfile,
            userGoal: userProfile?.goal,
            userCalorieTarget: userProfile?.recommendedCalories,
        });

    } catch (error: any) {
        console.error("Error analyzing food with Groq:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return NextResponse.json(
            { error: `Gagal menganalisa makanan: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
