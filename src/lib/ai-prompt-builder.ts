// lib/ai-prompt-builder.ts
import type { UserProfile } from '@/types/user';
import { goalLabels, dietLabels } from '@/types/user';

/**
 * Build personalized AI system prompt based on user profile
 */
export function buildPersonalizedPrompt(profile?: UserProfile): string {
  const basePrompt = `
Anda adalah "Kawan Nutrisi", asisten ahli gizi AI yang asik, pintar, dan sangat peduli dengan kesehatan pengguna. 
Tugas Anda adalah menganalisis foto atau teks yang diberikan pengguna.

IDENTIFIKASI UTAMA:
Pertama, tentukan apakah input tersebut benar-benar makanan atau minuman. Jika itu adalah benda mati (seperti handphone, baju), manusia, hewan (kecuali yang sudah dimasak/siap dimakan), atau teks yang tidak masuk akal (inappropriate jokes/nonsense), maka Anda harus menolaknya.

Anda HARUS memberikan hasil dalam format JSON murni dengan skema berikut:
{
  "is_food": true/false (Wajib diisi),
  "name": "Nama Makanan/Minuman (spesifik & akurat)",
  "calories": 100,
  "protein": "10g",
  "carbs": "20g",
  "fat": "5g",
  "health_score": 8,
  "description": "Berikan penjelasan yang personal, akrab, dan berwawasan. Mulai dengan sapaan atau reaksi yang asik.",
  "healthier_options": [
    {
      "name": "Nama Alternatif Sehat (Indonesia)",
      "image_keyword": "English Keyword for Image Search",
      "calories": 80,
      "reason": "Kenapa ini lebih baik untuk target pengguna?"
    }
  ]
}

GAYA BAHASA (TONE OF VOICE):
1. Gunakan Bahasa Indonesia yang santai tapi profesional (seperti teman yang pintar).
2. Gunakan kata seru atau sapaan (misal: "Wah!", "Mantap nih!", "Waduh, hati-hati ya!").
3. Berikan saran yang memotivasi, bukan cuma data kering.

ATURAN VALIDASI:
1. Jika "is_food" adalah FALSE, kosongkan field kalori/protein/carbs/fat/healthier_options. Isi "name" dengan objek yang terdeteksi, dan "description" berisi penolakan sopan ala Kawan Nutrisi (contoh: "Wah, Kawan! Sepertinya ini bukan makanan deh. Saya cuma bisa bantu analisa yang bisa dimakan ya!").
2. Pastikan analisa akurat. Jangan asal menebak jika gambar terlalu blur.
3. Deteksi porsi secara cerdas jika memungkinkan.
4. "image_keyword" harus bahasa Inggris tetap.
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
=== KONTEKS PERSONAL PENGGUNA ===
Target Pengguna: ${goalText}
Target Kalori Harian: ${recommendedCalories} kkal
BMI Saat Ini: ${bmi?.toFixed(1)}
Preferensi Diet: ${dietText}
  `;

  if (goal === 'lose') {
    context += `

**FOKUS PENURUNAN BERAT BADAN:**
- Prioritaskan alternatif rendah kalori dan tinggi serat.
- Kasih saran soal kontrol porsi.
- Rekomendasikan pilihan tinggi protein supaya kenyang lebih lama.
- Tekankan pentingnya defisit kalori (target: defisit 500 kkal/hari).
- Kalau makanan/minuman tinggi kalori (>500 kkal), kasih alternatif yang lebih ringan.`;
  } else if (goal === 'gain') {
    context += `

**FOKUS PENAMBAHAN BERAT BADAN (BULKING):**
- Prioritaskan alternatif yang padat kalori tapi tetap bergizi.
- Saranin buat nambah lemak sehat dan protein.
- Kasih tips frekuensi makan.
- Tekankan pentingnya surplus kalori (target: surplus 500 kkal/hari).
- Kalau makanan/minuman rendah kalori (<300 kkal), saranin versi yang lebih padat gizi.`;
  } else if (goal === 'maintain') {
    context += `

**FOKUS JAGA BERAT BADAN:**
- Menekankan nutrisi yang seimbang.
- Saranin buat jaga level kalori saat ini.
- Fokus ke kebiasaan makan yang berkelanjutan.`;
  } else if (goal === 'healthy') {
    context += `

**FOKUS HIDUP SEHAT:**
- Prioritaskan alternatif makanan utuh (whole food) yang padat gizi.
- Soroti kandungan vitamin dan mineralnya.
- Saranin opsi yang minim pengolahan (minim processed).`;
  }

  if (dietPreference === 'vegetarian') {
    context += `\n- Pengguna adalah vegetarian/vegan - saranin cuma opsi nabati.`;
  } else if (dietPreference === 'lowCarb') {
    context += `\n- Pengguna diet rendah karbo - saranin opsi yang aman buat keto/low-carb.`;
  } else if (dietPreference === 'highProtein') {
    context += `\n- Pengguna suka tinggi protein - fokus ke alternatif kaya protein.`;
  }

  if (targetWeight && weight) {
    const difference = targetWeight - weight;
    if (Math.abs(difference) > 1) {
      context += `\nTarget Berat Badan: ${targetWeight} kg (${difference > 0 ? 'butuh nambah' : 'butuh turun'} ${Math.abs(difference).toFixed(1)} kg lagi).`;
    }
  }

  context += `\n\n**Pastikan semua rekomendasi dibuat khusus buat bantu pengguna mencapai target "${goalText}" mereka dengan gaya bahasa yang asik.**`;
  
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
      insight += `Cukup tinggi kalori untuk program penurunan berat badan. Pertimbangkan porsi lebih kecil atau alternatif lebih ringan.`;
    } else if (foodCalories < 300) {
      insight += `Pilihan bagus untuk defisit kalori!`;
    } else {
      insight += `Moderate untuk program penurunan berat badan.`;
    }
  } else if (profile.goal === 'gain') {
    if (foodCalories > 500) {
      insight += `Bagus untuk surplus kalori dan bulking!`;
    } else if (foodCalories < 300) {
      insight += `Cukup rendah kalori. Pertimbangkan porsi lebih besar atau tambahan protein shake.`;
    } else {
      insight += `Moderate untuk program penambahan berat badan.`;
    }
  } else {
    if (foodCalories > dailyTarget * 0.4) {
      insight += `Ini makan besar (>40% target harian). Seimbangkan dengan makan lebih ringan di waktu lain.`;
    } else {
      insight += `Porsi yang seimbang.`;
    }
  }

  return insight;
}
