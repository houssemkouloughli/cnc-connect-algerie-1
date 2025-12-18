-- POLICY: Allow authenticated users to create quotes
-- This is necessary for the "Send Quote" feature to work.

-- 1. Enable RLS (should be already enabled, but safe to repeat)
ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;

-- 2. Create INSERT policy
-- We allow any authenticated user to insert a quote, provided the client_id matches their own ID.
DROP POLICY IF EXISTS "Enable insert for clients" ON "public"."quotes";

CREATE POLICY "Enable insert for clients"
ON "public"."quotes"
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = client_id);

-- 3. Ensure SELECT permission exists (needed for returning data after insert)
DROP POLICY IF EXISTS "Enable select for own quotes" ON "public"."quotes";

CREATE POLICY "Enable select for own quotes"
ON "public"."quotes"
FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

-- 4. Allow reading OPEN quotes (for Partners/Public marketplace)
-- Should arguably be restricted, but for dev we allow authenticated users to see available work.
DROP POLICY IF EXISTS "Enable select open quotes" ON "public"."quotes";

CREATE POLICY "Enable select open quotes"
ON "public"."quotes"
FOR SELECT
TO authenticated
USING (status = 'open');
