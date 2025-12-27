// lib/ai-prompt-builder.ts
import type { UserProfile } from '@/types/user';
import { goalLabels, dietLabels } from '@/types/user';

/**
 * Build personalized AI system prompt based on user profile
 */
export function buildPersonalizedPrompt(profile?: UserProfile): string {
  const basePrompt = `
You are a nutritional expert AI. Analyze the food input (image or text) and provide nutritional data.
You MUST return the result in strict JSON format with this exact schema:
{
  "name": "Nama Makanan (in Indonesian)",
  "calories": 100,
  "protein": "10g",
  "carbs": "20g",
  "fat": "5g",
  "health_score": 8,
  "description": "Deskripsi singkat dan menarik tentang makanan ini serta nilai gizinya (in Indonesian language).",
  "healthier_options": [
    {
      "name": "Nama Makanan Alternatif",
      "image_keyword": "English Name of Food (for image generation)",
      "calories": 80,
      "reason": "Alasan kenapa ini lebih sehat (misal: menggunakan bahan pengganti yang lebih rendah kalori) (in Indonesian)"
    }
  ]
}
Do not include any markdown formatting like \`\`\`json. Just return the raw JSON object.

IMPORTANT RULES:
1. Provide the 'name' and 'description' in INDONESIAN language.
2. If the scanned food is an INDONESIAN dish, the 'healthier_options' MUST also be INDONESIAN dishes that are healthier.
3. If the 'health_score' is high (>= 8), the 'healthier_options' should be "Similar Healthy Variations" or "Complementary Dishes" rather than replacements.
4. Ensure 'image_keyword' is always in English for accurate image generation.
  `;

  // If no profile, return base prompt
  if (!profile) {
    return basePrompt.trim();
  }

  // Build personalized context
  const personalizedContext = buildPersonalizedContext(profile);

  // Combine base prompt with personalized context
  return `${basePrompt}

${personalizedContext}`.trim();
}

/**
 * Build personalized context section of the prompt
 */
function buildPersonalizedContext(profile: UserProfile): string {
  const {
    goal,
    recommendedCalories,
    bmi,
    dietPreference,
    weight,
    targetWeight,
  } = profile;

  const goalText = goalLabels[goal];
  const dietText = dietPreference ? dietLabels[dietPreference] : 'Normal';

  let context = `
=== PERSONALIZED USER CONTEXT ===
User Goal: ${goalText}
Recommended Daily Calories: ${recommendedCalories} kcal
Current BMI: ${bmi?.toFixed(1)}
Diet Preference: ${dietText}
  `;

  // Add goal-specific recommendations
  if (goal === 'lose') {
    context += `

**WEIGHT LOSS FOCUS:**
- Prioritize low-calorie, high-fiber alternatives
- Suggest portion control tips
- Recommend protein-rich options to maintain satiety
- Highlight calorie deficit importance (target: 500 kcal deficit/day)
- If food is high-calorie (>500 kcal), emphasize healthier, lower-calorie alternatives`;
  } else if (goal === 'gain') {
    context += `

**WEIGHT GAIN/BULKING FOCUS:**
- Prioritize calorie-dense, nutrient-rich alternatives
- Suggest adding healthy fats and proteins
- Recommend meal frequency tips
- Highlight calorie surplus importance (target: 500 kcal surplus/day)
- If food is low-calorie (<300 kcal), suggest more calorie-dense versions or additions`;
  } else if (goal === 'maintain') {
    context += `

**WEIGHT MAINTENANCE FOCUS:**
- Emphasize balanced nutrition
- Suggest maintaining current calorie levels
- Recommend nutrient-dense options
- Focus on sustainable eating habits`;
  } else if (goal === 'healthy') {
    context += `

**HEALTHY LIVING FOCUS:**
- Prioritize nutrient-dense, whole food alternatives
- Highlight vitamins and minerals content
- Recommend minimally processed options
- Focus on overall health benefits`;
  }

  // Add diet preference specifics
  if (dietPreference === 'vegetarian') {
    context += `\n- User is vegetarian/vegan - suggest only plant-based alternatives`;
  } else if (dietPreference === 'lowCarb') {
    context += `\n- User prefers low-carb diet - suggest low-carb/keto-friendly alternatives`;
  } else if (dietPreference === 'highProtein') {
    context += `\n- User prefers high protein - emphasize protein-rich alternatives`;
  }

  // Add target weight context
  if (targetWeight && weight) {
    const difference = targetWeight - weight;
    if (Math.abs(difference) > 1) {
      context += `\nTarget Weight: ${targetWeight} kg (${difference > 0 ? '+' : ''}${difference.toFixed(1)} kg from current)`;
    }
  }

  context += `\n\n**Make all recommendations specifically tailored to help user achieve their goal of "${goalText}"**`;
  
  return context.trim();
}

/**
 * Generate health insight based on food calories and user profile
 */
export function generateHealthInsight(
  foodCalories: number,
  profile?: UserProfile
): string {
  if (!profile || !profile.recommendedCalories) {
    return `Makanan ini mengandung ${foodCalories} kalori.`;
  }

  const dailyTarget = profile.recommendedCalories;
  const percentage = ((foodCalories / dailyTarget) * 100).toFixed(1);

  let insight = `Makanan ini ${foodCalories} kkal (${percentage}% dari target harian ${dailyTarget} kkal). `;

  if (profile.goal === 'lose') {
    if (foodCalories > 500) {
      insight += `⚠️ Cukup tinggi kalori untuk program penurunan berat badan. Pertimbangkan porsi lebih kecil atau alternatif lebih ringan.`;
    } else if (foodCalories < 300) {
      insight += `✅ Pilihan bagus untuk defisit kalori!`;
    } else {
      insight += `Moderate untuk program penurunan berat badan.`;
    }
  } else if (profile.goal === 'gain') {
    if (foodCalories > 500) {
      insight += `✅ Bagus untuk surplus kalori dan bulking!`;
    } else if (foodCalories < 300) {
      insight += `⚠️ Cukup rendah kalori. Pertimbangkan porsi lebih besar atau tambahan protein shake.`;
    } else {
      insight += `Moderate untuk program penambahan berat badan.`;
    }
  } else {
    if (foodCalories > dailyTarget * 0.4) {
      insight += `⚠️ Ini makan besar (>40% target harian). Seimbangkan dengan makan lebih ringan di waktu lain.`;
    } else {
      insight += `Porsi yang seimbang.`;
    }
  }

  return insight;
}
