// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          goal: 'lose' | 'maintain' | 'gain' | 'healthy'
          weight: number
          height: number
          age: number
          gender: 'male' | 'female'
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
          target_weight: number | null
          diet_preference: 'normal' | 'vegetarian' | 'lowCarb' | 'highProtein' | 'other' | null
          bmi: number | null
          bmr: number | null
          tdee: number | null
          daily_calories: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          goal: 'lose' | 'maintain' | 'gain' | 'healthy'
          weight: number
          height: number
          age: number
          gender: 'male' | 'female'
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
          target_weight?: number | null
          diet_preference?: 'normal' | 'vegetarian' | 'lowCarb' | 'highProtein' | 'other' | null
          bmi?: number | null
          bmr?: number | null
          tdee?: number | null
          daily_calories?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          goal?: 'lose' | 'maintain' | 'gain' | 'healthy'
          weight?: number
          height?: number
          age?: number
          gender?: 'male' | 'female'
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
          target_weight?: number | null
          diet_preference?: 'normal' | 'vegetarian' | 'lowCarb' | 'highProtein' | 'other' | null
          bmi?: number | null
          bmr?: number | null
          tdee?: number | null
          daily_calories?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
