-- Fix handle_new_user trigger to respect metadata role
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role user_role;
  user_full_name text;
BEGIN
  -- Get role from metadata, default to 'client'
  -- We cast to text first to avoid issues if the json value is not a valid enum immediately
  BEGIN
    user_role := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role := 'client'::user_role;
  END;

  -- If role is null (cast failed or not provided), default to client
  IF user_role IS NULL THEN
    user_role := 'client';
  END IF;

  user_full_name := NEW.raw_user_meta_data->>'full_name';
  IF user_full_name IS NULL THEN
     user_full_name := NEW.raw_user_meta_data->>'company_name';
  END IF;

  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    user_role,
    user_full_name
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
