-- Auth improvements migration
-- Migration: 20240301000006_auth_improvements

-- Create a table to track login attempts for rate limiting
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT false,
    
    CONSTRAINT login_attempts_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index for faster lookups
CREATE INDEX idx_login_attempts_email_time ON public.login_attempts(email, attempt_time DESC);
CREATE INDEX idx_login_attempts_ip_time ON public.login_attempts(ip_address, attempt_time DESC);

-- Function to check if user is rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_email VARCHAR(255),
    p_ip_address VARCHAR(45) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    failed_attempts INTEGER;
    last_attempt_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Count failed attempts in the last 15 minutes
    SELECT COUNT(*), MAX(attempt_time)
    INTO failed_attempts, last_attempt_time
    FROM public.login_attempts
    WHERE email = p_email
        AND success = false
        AND attempt_time > NOW() - INTERVAL '15 minutes';
    
    -- If more than 5 failed attempts, check if enough time has passed
    IF failed_attempts >= 5 THEN
        -- If last attempt was less than 15 minutes ago, rate limit
        IF last_attempt_time > NOW() - INTERVAL '15 minutes' THEN
            RETURN false;
        END IF;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(
    p_email VARCHAR(255),
    p_ip_address VARCHAR(45) DEFAULT NULL,
    p_success BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.login_attempts (email, ip_address, success)
    VALUES (p_email, p_ip_address, p_success);
    
    -- Clean up old attempts (older than 24 hours)
    DELETE FROM public.login_attempts
    WHERE attempt_time < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for login_attempts table
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow system to manage login attempts
CREATE POLICY "System can manage login attempts" ON public.login_attempts
    FOR ALL USING (false);

-- Create a function to clean up orphaned auth users (users without profiles)
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_auth_users()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- This function should be called periodically by a cron job
    -- It finds auth.users that don't have corresponding public.users records
    -- and were created more than 1 hour ago (to avoid race conditions)
    
    -- Note: This requires superuser privileges and should be run as a scheduled job
    -- For now, we'll just return 0 as a placeholder
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a trigger to automatically create user profile when auth user is created
-- This helps prevent the race condition during registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        -- Insert a basic profile that will be updated by the registration process
        INSERT INTO public.users (id, email, name, role)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
            COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Add password history table to prevent password reuse
CREATE TABLE IF NOT EXISTS public.password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT password_history_user_id_check CHECK (user_id IS NOT NULL)
);

-- Create index for faster lookups
CREATE INDEX idx_password_history_user_id ON public.password_history(user_id, created_at DESC);

-- Add RLS policies for password_history
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Only allow system to manage password history
CREATE POLICY "System can manage password history" ON public.password_history
    FOR ALL USING (false);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_login_attempt TO authenticated;
