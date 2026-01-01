import { createClient } from "@/lib/supabase-server";
import { type User } from "@supabase/supabase-js";

export async function syncUserProfile(user: User) {
  const supabase = await createClient();

  // 1. Sync data to 'profiles' table
  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || "User SiKalori",
      picture: user.user_metadata?.avatar_url,
      last_login: new Date().toISOString(),
    }, { onConflict: "id" })
    .select("daily_target")
    .single();

  if (error) {
    console.error("Server Action Sync Error:", error);
    // Even if sync fails, let them proceed (or handle error strictly)
    // Assuming silent fallback for now, but redirection depends on logic
    // We can throw error or return status
    return { success: false, error: error.message };
  }

  // 2. Determine Redirection
  if (!profile?.daily_target) {
    return { success: true, redirectUrl: "/onboarding" };
  } else {
    return { success: true, redirectUrl: "/dashboard" };
  }
}
