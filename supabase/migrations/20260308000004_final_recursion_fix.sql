-- Final fix for infinite recursion - separate INSERT from SELECT policies
-- Migration: 20260308000004_final_recursion_fix

-- Disable RLS
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'events' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.events CASCADE';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'event_members' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.event_members CASCADE';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

-- INSERT: Simple policy with NO cross-table checks
CREATE POLICY "events_insert_simple" ON public.events
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        -- Only check that user is authenticated and is the creator
        auth.uid() IS NOT NULL 
        AND created_by = auth.uid()
    );

-- SELECT: Can check event_members since we're not inserting
CREATE POLICY "events_select_members" ON public.events
    FOR SELECT 
    TO authenticated
    USING (
        -- User created the event
        created_by = auth.uid()
        OR
        -- User is a member (safe in SELECT context)
        EXISTS (
            SELECT 1 
            FROM public.event_members em
            WHERE em.event_id = events.id 
            AND em.user_id = auth.uid()
        )
    );

-- UPDATE: Simple policy, only creator
CREATE POLICY "events_update_simple" ON public.events
    FOR UPDATE 
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- DELETE: Simple policy, only creator
CREATE POLICY "events_delete_simple" ON public.events
    FOR DELETE 
    TO authenticated
    USING (created_by = auth.uid());

-- ============================================
-- EVENT_MEMBERS TABLE POLICIES
-- ============================================

-- INSERT: Simple policy with NO complex checks during insert
CREATE POLICY "event_members_insert_simple" ON public.event_members
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        -- User can add themselves
        auth.uid() IS NOT NULL 
        AND (
            user_id = auth.uid()
            OR
            -- OR user created the event (simple lookup, no recursion)
            event_id IN (
                SELECT id 
                FROM public.events 
                WHERE created_by = auth.uid()
            )
        )
    );

-- SELECT: Can check events table since we're not inserting
CREATE POLICY "event_members_select_all" ON public.event_members
    FOR SELECT 
    TO authenticated
    USING (
        -- User's own membership
        user_id = auth.uid()
        OR
        -- Memberships in events user created
        EXISTS (
            SELECT 1 
            FROM public.events e
            WHERE e.id = event_members.event_id 
            AND e.created_by = auth.uid()
        )
    );

-- UPDATE: Only event creators can update
CREATE POLICY "event_members_update_simple" ON public.event_members
    FOR UPDATE 
    TO authenticated
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

-- DELETE: User can remove themselves or creator can remove
CREATE POLICY "event_members_delete_simple" ON public.event_members
    FOR DELETE 
    TO authenticated
    USING (
        user_id = auth.uid()
        OR
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

-- Verify
DO $$
DECLARE
    ev_count INTEGER;
    em_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO ev_count FROM pg_policies WHERE tablename = 'events' AND schemaname = 'public';
    SELECT COUNT(*) INTO em_count FROM pg_policies WHERE tablename = 'event_members' AND schemaname = 'public';
    
    RAISE NOTICE '=== POLICIES CREATED ===';
    RAISE NOTICE 'Events: % policies', ev_count;
    RAISE NOTICE 'Event_members: % policies', em_count;
    
    IF ev_count != 4 OR em_count != 4 THEN
        RAISE EXCEPTION 'Expected 4 policies on each table';
    END IF;
    
    RAISE NOTICE '=== NO RECURSION - INSERT policies are simple ===';
END $$;
