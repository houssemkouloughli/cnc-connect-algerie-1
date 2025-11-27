# Supabase Setup Instructions

## 📋 Prerequisites
- Supabase project created: https://jvmnfweammcentqnzage.supabase.co
- API keys configured in `.env.local`

---

## 🚀 Step 1: Copy Environment Variables

Create `.env.local` in your project root and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://jvmnfweammcentqnzage.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW5md2VhbW1jZW50cW56YWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTcyNTcsImV4cCI6MjA3OTYzMzI1N30.ViXJjZNSQb4vdEmJXh6pdIsOzwq8iyZedk6z3XGsHdo
```

---

## 🗄️ Step 2: Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these files **in order**:

### 1. Initial Schema
Open `supabase/migrations/001_initial_schema.sql` and execute it.

**What it does:**
- Creates all tables (profiles, partners, quotes, bids, orders, notifications)
- Sets up ENUM types
- Adds indexes for performance
- Creates triggers for auto-updating timestamps

### 2. RLS Policies
Open `supabase/migrations/002_rls_policies.sql` and execute it.

**What it does:**
- Enables Row Level Security on all tables
- Creates policies so users can only see their own data
- Allows partners to view open quotes
- Allows clients to view bids on their quotes

### 3. Storage Setup
Open `supabase/migrations/003_storage_setup.sql` and execute it.

**What it does:**
- Creates `cad-files` bucket (private)
- Creates `thumbnails` bucket (public)
- Sets up storage policies

### 4. Seed Data (Optional)
Open `supabase/migrations/004_seed_data.sql` and execute it.

**What it does:**
- Adds sample partners for testing
- Provides helper functions

---

## 🔐 Step 3: Create Test Users

### Option A: Via Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add User"
3. Create users:
   - **Admin**: `admin@cncconnect.dz` / password
   - **Partner**: `partner@example.com` / password
   - **Client**: `client@example.com` / password

### Option B: Via Signup Page (after implementing)
Use the signup flow in your app.

---

## 🔧 Step 4: Update User Roles

After creating users, run this SQL to set their roles:

```sql
-- Set admin role
UPDATE profiles SET role = 'admin', full_name = 'Admin CNC Connect' 
WHERE email = 'admin@cncconnect.dz';

-- Set partner role
UPDATE profiles SET role = 'partner', full_name = 'MecaPrécision' 
WHERE email = 'partner@example.com';

-- Client role is default, but you can update:
UPDATE profiles SET role = 'client', full_name = 'Test Client' 
WHERE email = 'client@example.com';
```

---

## ✅ Step 5: Verify Setup

Run these queries to verify everything is working:

```sql
-- Check profiles
SELECT * FROM profiles;

-- Check partners
SELECT * FROM partners;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

## 🧪 Step 6: Test Authentication

1. Restart your Next.js dev server: `npm run dev`
2. Go to `/login`
3. Try logging in with test users
4. Verify redirects work:
   - Admin → `/admin/workshops`
   - Partner → `/partner/dashboard`
   - Client → `/dashboard`

---

## 📦 Next Steps

Once setup is complete:
1. Create query functions in `lib/queries/`
2. Replace mock data with Supabase queries
3. Implement signup flows
4. Test file uploads

---

## 🐛 Troubleshooting

### "relation does not exist" error
- Make sure you ran migrations in order
- Check SQL Editor for error messages

### RLS blocking queries
- Verify you're logged in
- Check RLS policies match your use case
- Use Supabase logs to debug

### Auth not working
- Verify `.env.local` has correct keys
- Restart dev server after adding env vars
- Check browser console for errors
