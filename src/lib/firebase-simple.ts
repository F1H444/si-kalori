// lib/firebase-simple.ts
// Simplified Firebase client (fallback to localStorage for development)

import { UserProfile, OnboardingFormData } from '@/types/user';
import { calculateAllMetrics } from './health-calculations';

// Simple in-memory storage for development
const STORAGE_KEYS = {
  USER_PROFILE: 'sikalori_user_profile_',
  USER_ONBOARDING: 'sikalori_onboarding_status_',
};

export const simpleStorage = {
  // Save user profile
  async saveUserProfile(email: string, profileData: OnboardingFormData) {
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

      const completeProfile: UserProfile = {
        ...profileData,
        ...metrics,
      };

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEYS.USER_PROFILE + email,
          JSON.stringify(completeProfile)
        );
        localStorage.setItem(STORAGE_KEYS.USER_ONBOARDING + email, 'true');
      }

      return { success: true, profile: completeProfile };
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(email: string): Promise<UserProfile | null> {
    try {
      if (typeof window === 'undefined') return null;
      
      const profileData = localStorage.getItem(STORAGE_KEYS.USER_PROFILE + email);
      if (!profileData) return null;

      return JSON.parse(profileData) as UserProfile;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  // Check if user completed onboarding
  async hasCompletedOnboarding(email: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    const status = localStorage.getItem(STORAGE_KEYS.USER_ONBOARDING + email);
    return status === 'true';
  },
};
