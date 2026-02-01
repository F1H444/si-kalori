import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user";

export async function getProfileByEmail(
  email: string,
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, is_premium")
      .eq("email", email)
      .single();

    if (error || !data) {
      console.error("Error fetching profile:", error);
      return null;
    }

    // Map ketersediaan data ke UserProfile. 
    // Karena kolom kesehatan (weight, height, dll) dihapus dari tabel users di skema baru,
    // kita gunakan nilai default agar aplikasi tidak crash.
    const profile: UserProfile = {
      id: data.id,
      full_name: data.full_name || "User",
      is_premium: data.is_premium,
      // Default values untuk field yang sudah tidak ada di DB
      weight: 0,
      height: 0,
      age: 0,
      gender: "male",
      goal: "maintain",
      activityLevel: "moderate",
      recommendedCalories: 2000,
    };

    return profile;
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
}
