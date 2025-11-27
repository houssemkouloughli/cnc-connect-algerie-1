-- Fix RLS policies to allow profile creation during signup
-- Drop existing restrictive profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create new policies that allow signup
CREATE POLICY "Enable insert for authenticated users on signup"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read for all profiles"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on id"
ON profiles FOR DELETE
USING (auth.uid() = id);
