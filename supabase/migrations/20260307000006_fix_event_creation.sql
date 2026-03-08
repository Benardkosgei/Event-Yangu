-- Fix event creation issues
-- Migration: 20260307000006_fix_event_creation

-- First, disable RLS temporarily
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on events table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'events' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.events';
    END LOOP;
    
    -- Drop all policies on event_members table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'event_members' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.event_members';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies for events
CREATE POLICY "events_select_policy" ON public.events
    FOR SELECT 
    USING (
        auth.uid() = created_by 
        OR 
        id IN (SELECT event_id FROM public.event_members WHERE user_id = auth.uid())
    );

CREATE POLICY "events_insert_policy" ON public.events
    FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "events_update_policy" ON public.events
    FOR UPDATE 
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "events_delete_policy" ON public.events
    FOR DELETE 
    USING (auth.uid() = created_by);

-- Create simple, working policies for event_members
CREATE POLICY "event_members_select_own" ON public.event_members
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "event_members_select_as_creator" ON public.event_members
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "event_members_insert_self" ON public.event_members
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_members_insert_as_creator" ON public.event_members
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "event_members_update_as_creator" ON public.event_members
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "event_members_delete_self" ON public.event_members
    FOR DELETE 
    USING (auth.uid() = user_id);

CREATE POLICY "event_members_delete_as_creator" ON public.event_members
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.event_members TO authenticated;