# 🚀 Quick Start - Supabase Setup

## Step 1: Create `.env.local`

Create this file in root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dfzpruqbocggtjiyjrsh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmenBydXFib2NnZ3RqaXlqcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NDEwNzUsImV4cCI6MjA1MDQxNzA3NX0.lEYuWLIAYjF9KfiihXE0Sw_ljd-lw_j
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmenBydXFib2NnZ3RqaXlqcnNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDg0MTA3NSwiZXhwIjoyMDUwNDE3MDc1fQ.8XaPZjn0-h4Q3CfFQUa7Sg_a2U-UwIH
GROQ_API_KEY=gsk_your_key_here
```

## Step 2: Run SQL in Supabase

1. Go to: https://dfzpruqbocggtjiyjrsh.supabase.co
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy ALL content from `supabase-schema.sql`
5. Paste and click **Run**

## Step 3: Restart Server

```bash
npm run dev
```

## Step 4: Test

1. Go to `/onboarding`
2. Complete the form
3. Check Supabase → Table Editor → `user_profiles`
4. Your profile should appear! ✅

---

## Migration (Optional)

If you have existing data:

```bash
npx tsx scripts/migrate-to-supabase.ts
```

---

## Verify It's Working

Open browser console and run:

```javascript
fetch("/api/users/profile?email=YOUR_EMAIL")
  .then((r) => r.json())
  .then(console.log);
```

You should see your profile with BMI, BMR, TDEE! 🎉
