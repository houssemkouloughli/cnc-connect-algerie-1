# Running Migrations Automatically

## Step 1: Get Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jvmnfweammcentqnzage
2. Click **Settings** (gear icon) → **API**
3. Scroll down to **Project API keys**
4. Copy the **`service_role`** key (secret - don't share!)

## Step 2: Add to .env.local

Open `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://jvmnfweammcentqnzage.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

## Step 3: Install Dependencies

```bash
npm install dotenv
```

## Step 4: Run Migration Script

```bash
node scripts/run-migrations-simple.js
```

## What the Script Does

1. Reads all SQL files from `supabase/migrations/`
2. Executes them in order using your service role key
3. Shows progress with dots (.) for success, (s) for skipped
4. Reports final results

## If Script Fails

The script is designed to be safe - it will skip statements that already exist. If it fails completely, you can:

**Option A: Run manually in Supabase Dashboard**
1. Go to SQL Editor
2. Copy-paste each migration file
3. Click "Run"

**Option B: Use Supabase CLI**
```bash
npx supabase db push
```

## After Migrations Complete

1. Create test users in Dashboard → Authentication
2. Update their roles with SQL:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@cncconnect.dz';
UPDATE profiles SET role = 'partner' WHERE email = 'partner@example.com';
```
3. Test login in your app!
