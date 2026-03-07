-- Fix user creation issues
-- Migration: 20240301000008_fix_user_creation

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users table
  INSERT INTO public.users (id, email, name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')::user_role
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies allow user creation
-- Drop and recreate the insert policy for users
DROP POLICY IF EXISTS "Users can insert own profile during registration" ON public.users;

CREATE POLICY "Users can insert own profile during registration" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Also allow the service role to insert (for the trigger)
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;

CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT 
    WITH CHECK (true);
