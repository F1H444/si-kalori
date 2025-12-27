// lib/db/profiles.ts
import { supabaseAdmin } from '@/lib/supabase/server';
import { calculateAllMetrics } from '@/lib/health-calculations';
import type { OnboardingFormData, UserProfile } from '@/types/user';
import type { Database } from '@/types/database';

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];

/**
 * Get user profile by email
 */
export async function getProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    if (!data) return null;

    // Transform database row to UserProfile
    return dbRowToUserProfile(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

/**
 * Create or update user profile
 */
export async function upsertProfile(
  email: string,
  profileData: OnboardingFormData
): Promise<UserProfile> {
  try {
    // Calculate health metrics
    const metrics = calculateAllMetrics(
      profileData.weight,
      profileData.height,
      profileData.age,
      profileData.gender,
      profileData.activityLevel,
      profileData.goal
    );

    // Prepare data for database
    const dbData: UserProfileInsert = {
      user_id: email, // Using email as user_id for now
      email: email,
      goal: profileData.goal,
      weight: profileData.weight,
      height: profileData.height,
      age: profileData.age,
      gender: profileData.gender,
      activity_level: profileData.activityLevel,
      target_weight: profileData.targetWeight || null,
      diet_preference: profileData.dietPreference || null,
      bmi: metrics.bmi,
      bmr: metrics.bmr,
      tdee: metrics.tdee,
      daily_calories: metrics.recommendedCalories,
      updated_at: new Date().toISOString(),
    };

    // Upsert (insert or update if exists)
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(dbData, {
        onConflict: 'email',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from upsert');
    }

    return dbRowToUserProfile(data);
  } catch (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }
}

/**
 * Update specific fields of user profile
 */
export async function updateProfile(
  email: string,
  updates: Partial<OnboardingFormData>
): Promise<UserProfile> {
  try {
    // Get current profile
    const currentProfile = await getProfileByEmail(email);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    // Merge updates with current data
    const mergedData: OnboardingFormData = {
      goal: updates.goal ?? currentProfile.goal,
      weight: updates.weight ?? currentProfile.weight,
      height: updates.height ?? currentProfile.height,
      age: updates.age ?? currentProfile.age,
      gender: updates.gender ?? currentProfile.gender,
      activityLevel: updates.activityLevel ?? currentProfile.activityLevel,
      targetWeight: updates.targetWeight ?? currentProfile.targetWeight ?? 0,
      dietPreference: updates.dietPreference ?? currentProfile.dietPreference,
    };

    // Recalculate metrics and upsert
    return await upsertProfile(email, mergedData);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Delete user profile
 */
export async function deleteProfile(email: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('email', email);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

/**
 * Transform database row to UserProfile type
 */
function dbRowToUserProfile(row: UserProfileRow): UserProfile {
  return {
    weight: row.weight,
    height: row.height,
    age: row.age,
    gender: row.gender,
    goal: row.goal,
    activityLevel: row.activity_level,
    targetWeight: row.target_weight ?? undefined,
    dietPreference: row.diet_preference ?? undefined,
    bmi: row.bmi ?? undefined,
    bmr: row.bmr ?? undefined,
    tdee: row.tdee ?? undefined,
    recommendedCalories: row.daily_calories ?? undefined,
  };
}
