import { NextRequest, NextResponse } from "next/server";
import { getProfileByEmail, upsertProfile } from "@/lib/db/profiles";
import type { OnboardingFormData } from "@/types/user";

/**
 * POST /api/users/profile
 * Create or update user profile with health metrics calculation
 */
export async function POST(req: NextRequest) {
  try {
    const { email, profileData } = (await req.json()) as {
      email: string;
      profileData: OnboardingFormData;
    };

    if (!email || !profileData) {
      return NextResponse.json(
        { error: "Email and profile data are required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!profileData.weight || profileData.weight <= 0) {
      return NextResponse.json(
        { error: "Valid weight is required" },
        { status: 400 }
      );
    }

    if (!profileData.height || profileData.height <= 0) {
      return NextResponse.json(
        { error: "Valid height is required" },
        { status: 400 }
      );
    }

    if (!profileData.age || profileData.age <= 0) {
      return NextResponse.json(
        { error: "Valid age is required" },
        { status: 400 }
      );
    }

    // Upsert profile (will calculate BMI, BMR, TDEE automatically)
    const profile = await upsertProfile(email, profileData);

    return NextResponse.json({
      success: true,
      profile: profile,
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { 
        error: "Failed to save profile",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users/profile?email=user@example.com
 * Retrieve user profile by email
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const profile = await getProfileByEmail(email);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error getting profile:", error);
    return NextResponse.json(
      { 
        error: "Failed to get profile",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
