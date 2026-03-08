-- Verify and fix event creation issues
-- Migration: 20260308000001_verify_event_creation

-- Check current RLS status
DO $$
BEGIN
    RAISE NOTICE 'Checking RLS status...';
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;
DROP POLICY IF EXISTS "Users can view their created events" ON public.events;
DROP POLICY IF EXISTS "Users can view events where they are members" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Event creators can update their events" ON public.events;
DROP POLICY IF EXISTS "Event creators can delete their events" ON public.events;
DROP POLICY IF EXISTS "Users can view events they're members of" ON public.events;

DROP POLICY IF EXISTS "event_members_select_own" ON public.event_members;
DROP POLICY IF EXISTS "event_members_select_as_creator" ON public.event_members;
DROP POLICY IF EXISTS "event_members_insert_self" ON public.event_members;
DROP POLICY IF EXISTS "event_members_insert_as_creator" ON public.event_members;
DROP POLICY IF EXISTS "event_members_update_as_creator" ON public.event_members;
DROP POLICY IF EXISTS "event_members_delete_self" ON public.event_members;
DROP POLICY IF EXISTS "event_members_delete_as_creator" ON public.event_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.event_members;
DROP POLICY IF EXISTS "Event creators can view all event members" ON public.event_members;
DROP POLICY IF EXISTS "Users can join events themselves" ON public.event_members;
DROP POLICY IF EXISTS "Event creators can add members to their events" ON public.event_members;
DROP POLICY IF EXISTS "Users can leave events" ON public.event_members;
DROP POLICY IF EXISTS "Event creators can remove members from their events" ON public.event_members;

-- Create comprehensive, non-recursive policies for EVENTS table

-- SELECT: Users can view events they created OR are members of
CREATE POLICY "events_select_all" ON public.events
    FOR SELECT 
    USING (
        auth.uid() = created_by 
        OR 
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = events.id 
            AND user_id = auth.uid()
        )
    );

-- INSERT: Authenticated users can create events (must be the creator)
CREATE POLICY "events_insert_authenticated" ON public.events
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid() = created_by
    );

-- UPDATE: Only event creators can update their events
CREATE POLICY "events_update_creator" ON public.events
    FOR UPDATE 
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- DELETE: Only event creators can delete their events
CREATE POLICY "events_delete_creator" ON public.events
    FOR DELETE 
    USING (auth.uid() = created_by);

-- Create comprehensive, non-recursive policies for EVENT_MEMBERS table

-- SELECT: Users can view their own memberships OR memberships of events they created
CREATE POLICY "event_members_select_all" ON public.event_members
    FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND created_by = auth.uid()
        )
    );

-- INSERT: Users can add themselves OR event creators can add members
CREATE POLICY "event_members_insert_all" ON public.event_members
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND (
            auth.uid() = user_id 
            OR 
            EXISTS (
                SELECT 1 FROM public.events 
                WHERE id = event_id 
                AND created_by = auth.uid()
            )
        )
    );

-- UPDATE: Only event creators can update memberships
CREATE POLICY "event_members_update_creator" ON public.event_members
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND created_by = auth.uid()
        )
    );

-- DELETE: Users can remove themselves OR event creators can remove members
CREATE POLICY "event_members_delete_all" ON public.event_members
    FOR DELETE 
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id 
            AND created_by = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.event_members TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify policies are created
DO $$
DECLARE
    event_policy_count INTEGER;
    member_policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO event_policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'events';
    
    SELECT COUNT(*) INTO member_policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'event_members';
    
    RAISE NOTICE 'Events table has % policies', event_policy_count;
    RAISE NOTICE 'Event_members table has % policies', member_policy_count;
    
    IF event_policy_count < 4 THEN
        RAISE EXCEPTION 'Events table should have at least 4 policies';
    END IF;
    
    IF member_policy_count < 4 THEN
        RAISE EXCEPTION 'Event_members table should have at least 4 policies';
    END IF;
END $$;
