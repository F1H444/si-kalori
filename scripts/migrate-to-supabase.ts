// scripts/migrate-to-supabase.ts
// Migration script to move data from profiles.json to Supabase
// Run with: npx tsx scripts/migrate-to-supabase.ts

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import type { Database } from '../src/types/database';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface OldProfile {
  goal: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: string;
  targetWeight?: number;
  dietPreference?: string;
  bmi?: number;
  bmr?: number;
  tdee?: number;
  recommendedCalories?: number;
  email: string;
  updatedAt: string;
}

async function migrateProfiles() {
  console.log('🚀 Starting migration from profiles.json to Supabase...\n');

  // Read old profiles.json
  const profilesPath = path.join(process.cwd(), 'data', 'profiles.json');
  
  if (!fs.existsSync(profilesPath)) {
    console.log('⚠️  No profiles.json found. Nothing to migrate.');
    return;
  }

  const profilesData = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
  const emails = Object.keys(profilesData);

  console.log(`📊 Found ${emails.length} profiles to migrate\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const email of emails) {
    const oldProfile: OldProfile = profilesData[email];
    
    try {
      console.log(`⏳ Migrating profile for: ${email}`);

      // Transform old profile to new schema
      const newProfile = {
        user_id: email,
        email: email,
        goal: oldProfile.goal as any,
        weight: oldProfile.weight,
        height: oldProfile.height,
        age: oldProfile.age,
        gender: oldProfile.gender,
        activity_level: oldProfile.activityLevel as any,
        target_weight: oldProfile.targetWeight || null,
        diet_preference: oldProfile.dietPreference as any || null,
        bmi: oldProfile.bmi || null,
        bmr: oldProfile.bmr || null,
        tdee: oldProfile.tdee || null,
        daily_calories: oldProfile.recommendedCalories || null,
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(newProfile, { onConflict: 'email' })
        .select();

      if (error) {
        throw error;
      }

      console.log(`✅ Successfully migrated: ${email}`);
      console.log(`   BMI: ${newProfile.bmi}, BMR: ${newProfile.bmr}, TDEE: ${newProfile.tdee}\n`);
      successCount++;

    } catch (error) {
      console.error(`❌ Failed to migrate ${email}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📈 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📊 Total: ${emails.length}`);
  console.log('='.repeat(50) + '\n');

  if (successCount > 0) {
    console.log('🎉 Migration completed!');
    console.log('💡 Tip: You can now safely backup or remove data/profiles.json');
  }
}

// Run migration
migrateProfiles()
  .then(() => {
    console.log('\n✨ Migration script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
