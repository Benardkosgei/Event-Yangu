-- Nuclear option: Completely disable and rebuild RLS from scratch
-- Migration: 20260308000003_nuclear_fix

-- Step 1: Disable RLS completely
ALTER TABLE IF EXISTS public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_members DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies with CASCADE
DROP POLICY IF EXISTS "events_select" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_insert" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_update" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_delete" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_select_all" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_insert_authenticated" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_update_creator" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_delete_creator" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_select_policy" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_update_policy" ON public.events CASCADE;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events CASCADE;

DROP POLICY IF EXISTS "event_members_select" ON public.event_members CASCADE;
DROP POLICY IF EXISTS "event_members_insert" ON public.event_members CASCADE;
DROP POLICY IF EXISTS "event_members_update" ON public.event_members CASCADE;
DROP POLICY IF EXISTS "event_members_delete" ON public.event_members CASCADE;
DROP POLICY IF EXISTS "event_members_select_all" ON public.event_members CASCADE;
DROP POLICY IF EXISTS "event_members_insert_all" ON public.event_members CASCADE;
DROP POLICY IF EXISTS "event_members_update_creator" ON public.event_members CASCADE;
DROP POLICY IF EXISTS "event_members_delete_all" ON public.event_members CASCADE;

-- Step 3: Wait a moment for cache to clear
SELECT pg_sleep(1);

-- Step 4: Create brand new, simple policies with unique names

-- EVENTS TABLE POLICIES
CREATE POLICY "ev_sel_v1" ON public.events
    FOR SELECT 
    TO authenticated
    USING (
        created_by = auth.uid()
        OR
        EXISTS (
            SELECT 1 
            FROM public.event_members em
            WHERE em.event_id = events.id 
            AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "ev_ins_v1" ON public.events
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        created_by = auth.uid()
    );

CREATE POLICY "ev_upd_v1" ON public.events
    FOR UPDATE 
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "ev_del_v1" ON public.events
    FOR DELETE 
    TO authenticated
    USING (created_by = auth.uid());

-- EVENT_MEMBERS TABLE POLICIES
CREATE POLICY "em_sel_v1" ON public.event_members
    FOR SELECT 
    TO authenticated
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 
            FROM public.events e
            WHERE e.id = event_members.event_id 
            AND e.created_by = auth.uid()
        )
    );

CREATE POLICY "em_ins_v1" ON public.event_members
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 
            FROM public.events e
            WHERE e.id = event_members.event_id 
            AND e.created_by = auth.uid()
        )
    );

CREATE POLICY "em_upd_v1" ON public.event_members
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM public.events e
            WHERE e.id = event_members.event_id 
            AND e.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.events e
            WHERE e.id = event_members.event_id 
            AND e.created_by = auth.uid()
        )
    );

CREATE POLICY "em_del_v1" ON public.event_members
    FOR DELETE 
    TO authenticated
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 
            FROM public.events e
            WHERE e.id = event_members.event_id 
            AND e.created_by = auth.uid()
        )
    );

-- Step 5: Re-enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.event_members TO authenticated;

-- Step 7: Verify
DO $$
BEGIN
    RAISE NOTICE '=== RLS POLICIES REBUILT ===';
    RAISE NOTICE 'Events policies: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'events');
    RAISE NOTICE 'Event_members policies: %', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'event_members');
    RAISE NOTICE '=== READY FOR TESTING ===';
END $$;
