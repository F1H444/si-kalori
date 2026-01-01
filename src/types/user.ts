// types/user.ts

export interface UserProfile {
  // Personal Info
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female';
  
  // Goals & Activity
  goal: 'lose' | 'maintain' | 'gain' | 'healthy';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  
  // Optional
  targetWeight?: number; // kg
  dietPreference?: 'normal' | 'vegetarian' | 'lowCarb' | 'highProtein' | 'other';
  
  // Calculated fields
  bmi?: number;
  bmr?: number; // Basal Metabolic Rate
  tdee?: number; // Total Daily Energy Expenditure
  recommendedCalories?: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  joinedAt: string | Date;
  lastLogin: string | Date;
  hasCompletedOnboarding: boolean;
  scanCount?: number;
}

export interface ScanLog {
  id: string;
  user_id: string;
  food_name: string;
  nutrition: {
    calories: number;
    protein: string | number;
    carbs: string | number;
    fat: string | number;
    health_score: number;
  } | string;
  ai_analysis: string;
  image_url?: string | null;
  meal_type: string;
  created_at: string;
}



export interface OnboardingFormData {
  goal: UserProfile['goal'];
  weight: number;
  height: number;
  age: number;
  gender: UserProfile['gender'];
  activityLevel: UserProfile['activityLevel'];
  targetWeight: number;
  dietPreference: UserProfile['dietPreference'];
}

export interface UserWithProfile extends UserData {
  profile?: UserProfile;
}

// Activity level multipliers for TDEE calculation
export const activityMultipliers = {
  sedentary: 1.2,      // Tidak aktif (banyak duduk)
  light: 1.375,        // Aktivitas ringan (jalan-jalan, berdiri)
  moderate: 1.55,      // Aktivitas sedang (olahraga 1–3x/minggu)
  active: 1.725,       // Aktivitas tinggi (olahraga 4–6x/minggu)
  veryActive: 1.9,     // Sangat aktif (pekerjaan fisik/atlet)
};

// Goal labels
export const goalLabels = {
  lose: 'Menurunkan berat badan',
  maintain: 'Menjaga berat badan',
  gain: 'Menaikkan berat badan / Bulking',
  healthy: 'Hidup sehat & lebih bertenaga',
};

export const activityLabels = {
  sedentary: 'Tidak aktif (banyak duduk)',
  light: 'Aktivitas ringan (jalan-jalan, berdiri)',
  moderate: 'Aktivitas sedang (olahraga 1–3x/minggu)',
  active: 'Aktivitas tinggi (olahraga 4–6x/minggu)',
  veryActive: 'Sangat aktif (pekerjaan fisik/atlet)',
};

export const dietLabels = {
  normal: 'Normal',
  vegetarian: 'Vegetarian / Vegan',
  lowCarb: 'Rendah karbo',
  highProtein: 'Tinggi protein',
  other: 'Diet lain',
};
