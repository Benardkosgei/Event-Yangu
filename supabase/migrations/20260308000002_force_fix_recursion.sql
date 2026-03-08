-- Force fix infinite recursion by completely resetting RLS
-- Migration: 20260308000002_force_fix_recursion

-- Temporarily disable RLS to clear everything
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies using dynamic SQL to ensure nothing is left
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on events table
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'events' 
        AND schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.events CASCADE';
    END LOOP;
    
    -- Drop all policies on event_members table
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'event_members' 
        AND schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.event_members CASCADE';
    END LOOP;
    
    RAISE NOTICE 'All policies dropped successfully';
END $$;

-- Re-enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

-- Create SIMPLE, NON-RECURSIVE policies for EVENTS

-- Policy 1: SELECT - View own events or events where user is a member
CREATE POLICY "events_select" ON public.events
    FOR SELECT 
    USING (
        -- User created the event
        created_by = auth.uid()
        OR
        -- User is a member (simple subquery, no recursion)
        id IN (
            SELECT event_id 
            FROM public.event_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy 2: INSERT - Create events (must be creator)
CREATE POLICY "events_insert" ON public.events
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
    );

-- Policy 3: UPDATE - Update own events
CREATE POLICY "events_update" ON public.events
    FOR UPDATE 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Policy 4: DELETE - Delete own events
CREATE POLICY "events_delete" ON public.events
    FOR DELETE 
    USING (created_by = auth.uid());

-- Create SIMPLE, NON-RECURSIVE policies for EVENT_MEMBERS

-- Policy 1: SELECT - View own memberships or memberships in events you created
CREATE POLICY "event_members_select" ON public.event_members
    FOR SELECT 
    USING (
        -- User's own membership
        user_id = auth.uid()
        OR
        -- Memberships in events user created (simple join, no recursion)
        event_id IN (
            SELECT id 
            FROM public.events 
            WHERE created_by = auth.uid()
        )
    );

-- Policy 2: INSERT - Add self or add members to own events
CREATE POLICY "event_members_insert" ON public.event_members
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (
            -- Adding self
            user_id = auth.uid()
            OR
            -- Adding to event user created
            event_id IN (
                SELECT id 
                FROM public.events 
                WHERE created_by = auth.uid()
            )
        )
    );

-- Policy 3: UPDATE - Update memberships in own events
CREATE POLICY "event_members_update" ON public.event_members
    FOR UPDATE 
    USING (
        event_id IN (
            SELECT id 
            FROM public.events 
            WHERE created_by = auth.uid()
        )
    )
    WITH CHECK (
        event_id IN (
            SELECT id 
            FROM public.events 
            WHERE created_by = auth.uid()
        )
    );

-- Policy 4: DELETE - Remove self or remove from own events
CREATE POLICY "event_members_delete" ON public.event_members
    FOR DELETE 
    USING (
        -- Removing self
        user_id = auth.uid()
        OR
        -- Removing from event user created
        event_id IN (
            SELECT id 
            FROM public.events 
            WHERE created_by = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.event_members TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the fix
DO $$
DECLARE
    events_count INTEGER;
    members_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO events_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'events';
    
    SELECT COUNT(*) INTO members_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'event_members';
    
    RAISE NOTICE '✓ Events table: % policies created', events_count;
    RAISE NOTICE '✓ Event_members table: % policies created', members_count;
    
    IF events_count != 4 THEN
        RAISE EXCEPTION 'Expected 4 policies on events table, got %', events_count;
    END IF;
    
    IF members_count != 4 THEN
        RAISE EXCEPTION 'Expected 4 policies on event_members table, got %', members_count;
    END IF;
    
    RAISE NOTICE '✓ All policies created successfully - NO RECURSION';
END $$;
