// lib/ai-prompt-builder.ts
import type { UserProfile } from '@/types/user';
import { goalLabels, dietLabels } from '@/types/user';

/**
 * Build personalized AI system prompt based on user profile
 */
export function buildPersonalizedPrompt(profile?: UserProfile): string {
  const basePrompt = `
Anda adalah asisten ahli nutrisi AI. Analisis input (bisa berupa gambar atau teks) yang berisi makanan atau minuman, lalu berikan data nutrisinya.
Anda HARUS memberikan hasil dalam format JSON murni dengan skema berikut:
{
  "name": "Nama Makanan atau Minuman (dalam Bahasa Indonesia yang santai)",
  "calories": 100,
  "protein": "10g",
  "carbs": "20g",
  "fat": "5g",
  "health_score": 8,
  "description": "Jelaskan tentang makanan/minuman ini dengan gaya bahasa yang ramah dan menarik. Beritahu kenapa ini bagus buat kesehatan atau apa yang perlu diperhatikan (dalam Bahasa Indonesia).",
  "healthier_options": [
    {
      "name": "Nama Alternatif yang Lebih Sehat",
      "image_keyword": "English Name of Food (untuk pencarian gambar)",
      "calories": 80,
      "reason": "Kasih alasan kenapa ini pilihan yang lebih baik dengan gaya bahasa santai (dalam Bahasa Indonesia)"
    }
  ]
}
Jangan sertakan format markdown seperti \`\`\`json. Cukup kirimkan objek JSON-nya saja.

ATURAN PENTING:
1. Gunakan Bahasa Indonesia yang natural, seperti sedang ngobrol dengan teman, tapi tetap berwawasan.
2. Jika inputnya adalah hidangan khas Indonesia, maka 'healthier_options' juga HARUS hidangan Indonesia yang lebih sehat.
3. Jika 'health_score' hidangan sudah tinggi (>= 8), kasih rekomendasi variasi sehat lainnya atau pendamping yang cocok.
4. 'image_keyword' harus tetap dalam Bahasa Inggris supaya sistem bisa mencari gambar dengan akurat.
5. Kamu harus bisa mendeteksi MINUMAN juga, bukan cuma makanan.
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
