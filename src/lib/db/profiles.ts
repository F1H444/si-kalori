import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user";

export async function getProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      console.error("Error fetching profile:", error);
      return null;
    }

    // Map snake_case DB columns to camelCase UserProfile properties
    const profile: UserProfile = {
      weight: data.weight,
      height: data.height,
      age: data.age,
      gender: data.gender,
      goal: data.goal,
      activityLevel: data.activity_level,
      targetWeight: data.target_weight,
      dietPreference: data.diet_preference,
      bmi: data.bmi,
      bmr: data.bmr,
      tdee: data.tdee,
      recommendedCalories: data.recommended_calories,
    };

    return profile;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
}
