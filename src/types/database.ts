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
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          gender: "male" | "female" | null
          age: number | null
          weight: number | null
          height: number | null
          activity_level: "sedentary" | "light" | "moderate" | "active" | "veryActive" | null
          goal: "lose" | "maintain" | "gain" | "healthy" | null
          target_weight: number | null
          diet_preference: "normal" | "vegetarian" | "lowCarb" | "highProtein" | "other" | null
          daily_calorie_target: number | null
          is_premium: boolean
          has_completed_onboarding: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          gender?: "male" | "female" | null
          age?: number | null
          weight?: number | null
          height?: number | null
          activity_level?: "sedentary" | "light" | "moderate" | "active" | "veryActive" | null
          goal?: "lose" | "maintain" | "gain" | "healthy" | null
          target_weight?: number | null
          diet_preference?: "normal" | "vegetarian" | "lowCarb" | "highProtein" | "other" | null
          daily_calorie_target?: number | null
          has_completed_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          gender?: "male" | "female" | null
          age?: number | null
          weight?: number | null
          height?: number | null
          activity_level?: "sedentary" | "light" | "moderate" | "active" | "veryActive" | null
          goal?: "lose" | "maintain" | "gain" | "healthy" | null
          target_weight?: number | null
          diet_preference?: "normal" | "vegetarian" | "lowCarb" | "highProtein" | "other" | null
          daily_calorie_target?: number | null
          has_completed_onboarding?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          food_name: string
          image_url: string | null
          calories: number
          protein: number
          carbs: number
          fat: number
          nutrition: Json
          meal_type: "breakfast" | "lunch" | "dinner" | "snack" | null
          ai_analysis: string | null
          scan_time: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_name: string
          image_url?: string | null
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          nutrition?: Json
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack" | null
          ai_analysis?: string | null
          scan_time?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_name?: string
          image_url?: string | null
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          nutrition?: Json
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack" | null
          ai_analysis?: string | null
          scan_time?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string | null
          order_id: string
          amount: number
          status: "pending" | "success" | "failed" | "expired" | null
          payment_type: string | null
          snap_token: string | null
          handled_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_id: string
          amount: number
          status?: "pending" | "success" | "failed" | "expired" | null
          payment_type?: string | null
          snap_token?: string | null
          handled_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          order_id?: string
          amount?: number
          status?: "pending" | "success" | "failed" | "expired" | null
          payment_type?: string | null
          snap_token?: string | null
          handled_by?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      premium_subscriptions: {
        Row: {
          id: string
          user_id: string
          transaction_id: string | null
          status: string
          plan_type: string
          start_date: string
          expired_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_id?: string | null
          status?: string
          plan_type?: string
          start_date?: string
          expired_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_id?: string | null
          status?: string
          plan_type?: string
          start_date?: string
          expired_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      v_user_premium_status: {
        Row: {
          user_id: string
          email: string | null
          full_name: string | null
          is_premium: boolean
        }
      }
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      gender_type: "male" | "female"
      goal_type: "lose" | "maintain" | "gain" | "healthy"
      activity_level_type: "sedentary" | "light" | "moderate" | "active" | "veryActive"
      diet_preference_type: "normal" | "vegetarian" | "lowCarb" | "highProtein" | "other"
      transaction_status: "pending" | "success" | "failed" | "expired"
      meal_type_enum: "breakfast" | "lunch" | "dinner" | "snack"
    }
  }
}
