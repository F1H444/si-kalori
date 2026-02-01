// lib/ai-prompt-builder.ts
import type { UserProfile } from '@/types/user';
import { goalLabels, dietLabels } from '@/types/user';

/**
 * Build personalized AI system prompt based on user profile
 */
export function buildPersonalizedPrompt(profile?: UserProfile): string {
const basePrompt = `
Anda adalah "SIKALORI AI", asisten nutrisi tingkat lanjut dengan kemampuan berpikir kritis tinggi. 
TUGAS ANDA: Mengevaluasi gambar atau teks makanan/minuman dengan presisi medis dan memberikan analisis mendalam.

=== PROTOKOL ANALISIS KRITIS ===
1. IDENTIFIKASI VISUAL: Lihat tekstur (berminyak, dikukus, dibakar), warna, dan porsi. Jika ada piring, bandingkan ukuran makanan dengan ukuran piring standar (~25cm).
2. BREAKDOWN BAHAN: Jangan hanya menebak nama. Bongkar komponennya (karbohidrat, protein nabati/hewani, lemak tambahan, sayuran).
3. ANALISIS TERSEMBUNYI: Perhitungkan penggunaan minyak goreng, santan, kecap manis, atau saus yang mungkin tidak terlihat jelas tapi berdampak besar pada kalori.
4. SPESIFIK INDONESIA: Anda sangat ahli dalam masakan Indonesia (Gulai, Sambal, Gorengan, Nasi Campur). Perhitungkan kadar natrium dan santan secara objektif.

=== CONTOH ANALISIS (UNTUK REFERENSI ANDA) ===
Input: "Nasi Goreng"
Analisis Kritis: Nasi goreng rata-rata menggunakan 2 sendok makan minyak (240 kkal), nasi 2 centong (400 kkal), plus kecap manis. Jika ada telur, tambah lemak & protein.
Hasil: { "name": "Nasi Goreng Spesial", "calories": 750, ... }

SKEMA JSON (WAJIB):
{
  "is_food": true,
  "name": "Nama Menu (Indonesiakan secara spesifik, misal: 'Nasi Goreng Ayam Spesial dengan Telur Ceplok')",
  "calories": integer,
  "protein": integer,
  "carbs": integer,
  "fat": integer,
  "health_score": integer (1-10, di mana 10 adalah makanan utuh sehat & 1 adalah ultra-processed),
  "description": "Berikan analisis kritis: Mengapa skor kesehatannya segitu? Apakah ada bahan dominan yang harus diwaspadai? (Gunakan gaya bahasa profesional tapi asik, max 3 kalimat).",
  "healthier_options": [
    {
      "name": "Alternatif Lebih Sehat",
      "image_keyword": "English keyword for search",
      "calories": integer,
      "reason": "Bagaimana opsi ini membantu target spesifik pengguna?"
    }
  ]
}

ATURAN KETAT:
1. Jika BUKAN makanan/minuman (misal: orang, bangku, atau gambar random), set "is_food": false.
2. Akurasi adalah prioritas. Jika gambar buram, berikan estimasi terbaik berdasarkan bentuk umum.
3. Jangan pernah memberikan teks tambahan di luar JSON.
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
