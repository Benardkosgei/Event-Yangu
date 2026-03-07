-- Temporarily disable RLS to test event creation
-- Migration: 20260307000003_disable_rls_temporarily

-- Disable RLS on events table temporarily
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members DISABLE ROW LEVEL SECURITY;