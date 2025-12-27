# 🚀 Supabase Setup & Migration Guide

## Step 1: Setup Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://dfzpruqbocggtjiyjrsh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmenBydXFib2NnZ3RqaXlqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NDEwNzUsImV4cCI6MjA1MDQxNzA3NX0.lEYuWLIAYjF9KfiihXE0Sw_ljd-lw_j
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmenBydXFib2NnZ3RqaXlqcnNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDg0MTA3NSwiZXhwIjoyMDUwNDE3MDc1fQ.8XaPZjn0-h4Q3CfFQUa7Sg_a2U-UwIH

# Groq API (existing)
GROQ_API_KEY=gsk_your_key_here
```

## Step 2: Create Database Schema

1. Go to your Supabase project: https://dfzpruqbocggtjiyjrsh.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire content of `supabase-schema.sql`
5. Click **Run** to execute the SQL

This will create:

- ✅ `user_profiles` table with all required fields
- ✅ Indexes for fast lookups
- ✅ Row Level Security policies
- ✅ Auto-update trigger for `updated_at` field

## Step 3: Verify Database Setup

In Supabase SQL Editor, run:

```sql
SELECT * FROM user_profiles;
```

You should see an empty table with all columns ready.

## Step 4: Migrate Existing Data (Optional)

If you have existing data in `data/profiles.json`, migrate it:

```bash
npx tsx scripts/migrate-to-supabase.ts
```

This will:

- Read all profiles from `data/profiles.json`
- Insert them into Supabase
- Show migration summary

## Step 5: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Step 6: Test the Integration

### Test 1: Create a Profile

1. Complete the onboarding flow at `/onboarding`
2. Fill in all required fields
3. Submit the form
4. Check Supabase dashboard → Table Editor → `user_profiles`
5. You should see your profile with calculated BMI, BMR, TDEE

### Test 2: AI Personalization

1. Go to `/scan` page
2. Upload a food image or enter food name
3. The AI should use your profile data for personalized recommendations
4. Check browser console for: `✅ User profile loaded from Supabase`

### Test 3: Profile Retrieval

Open browser console and run:

```javascript
fetch("/api/users/profile?email=YOUR_EMAIL")
  .then((r) => r.json())
  .then(console.log);
```

You should see your complete profile with all metrics.

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Make sure `.env.local` exists in root directory
- Restart the dev server after creating `.env.local`

### Error: "relation 'user_profiles' does not exist"

- Run the SQL schema in Supabase SQL Editor
- Verify table creation with `SELECT * FROM user_profiles;`

### Error: "Failed to save profile"

- Check browser console for detailed error
- Verify Supabase credentials are correct
- Check Supabase logs in Dashboard → Logs

## Database Schema Overview

```
user_profiles
├── id (UUID, Primary Key)
├── user_id (TEXT, Unique)
├── email (TEXT, Unique)
├── goal (TEXT: lose/maintain/gain/healthy)
├── weight (DECIMAL)
├── height (DECIMAL)
├── age (INTEGER)
├── gender (TEXT: male/female)
├── activity_level (TEXT)
├── target_weight (DECIMAL, nullable)
├── diet_preference (TEXT, nullable)
├── bmi (DECIMAL, auto-calculated)
├── bmr (INTEGER, auto-calculated)
├── tdee (INTEGER, auto-calculated)
├── daily_calories (INTEGER, auto-calculated)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ, auto-updated)
```

## Security Features

✅ **Row Level Security (RLS)**: Enabled on all tables
✅ **Server-Side Validation**: All inputs validated before database insert
✅ **Type Safety**: Full TypeScript support
✅ **SQL Injection Protection**: Parameterized queries via Supabase client

## Next Steps

After successful setup:

1. ✅ Test onboarding flow
2. ✅ Test AI personalization
3. ✅ Backup old `data/profiles.json`
4. ✅ Consider removing file-based code (optional)
5. ✅ Monitor Supabase usage in dashboard

## Support

If you encounter issues:

1. Check Supabase Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure database schema is created properly
