// lib/health-calculations.ts
import { UserProfile, activityMultipliers } from '@/types/user';

/**
 * Calculate BMI (Body Mass Index)
 * Formula: weight(kg) / (height(m))^2
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10;
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate BMR (Basal Metabolic Rate)
 * Using Mifflin-St Jeor Equation
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number {
  let bmr: number;
  
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  return Math.round(bmr);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * BMR * Activity Multiplier
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: keyof typeof activityMultipliers
): number {
  const multiplier = activityMultipliers[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate recommended daily calories based on goal
 */
export function calculateRecommendedCalories(
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain' | 'healthy'
): number {
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500); // Deficit 500 cal for weight loss
    case 'gain':
      return Math.round(tdee + 500); // Surplus 500 cal for weight gain
    case 'maintain':
    case 'healthy':
    default:
      return tdee; // Maintenance calories
  }
}

/**
 * Calculate all health metrics for user profile
 */
export function calculateAllMetrics(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: UserProfile['activityLevel'],
  goal: UserProfile['goal']
): Pick<UserProfile, 'bmi' | 'bmr' | 'tdee' | 'recommendedCalories'> {
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel as keyof typeof activityMultipliers);
  const recommendedCalories = calculateRecommendedCalories(tdee, goal);
  
  return {
    bmi,
    bmr,
    tdee,
    recommendedCalories,
  };
}

/**
 * Get personalized health insights
 */
export function getHealthInsights(profile: UserProfile): string[] {
  const insights: string[] = [];
  
  if (profile.bmi) {
    const category = getBMICategory(profile.bmi);
    insights.push(`BMI kamu ${profile.bmi} (${category})`);
  }
  
  if (profile.recommendedCalories) {
    insights.push(`Target kalori harian: ${profile.recommendedCalories} kcal`);
  }
  
  if (profile.goal === 'lose') {
    insights.push('Fokus pada defisit kalori 500 kcal/hari untuk menurunkan berat ~0.5kg/minggu');
  } else if (profile.goal === 'gain') {
    insights.push('Surplus kalori 500 kcal/hari membantu menambah berat ~0.5kg/minggu');
  }
  
  if (profile.activityLevel === 'sedentary') {
    insights.push('Coba tambahkan aktivitas fisik ringan untuk meningkatkan metabolisme');
  }
  
  return insights;
}
