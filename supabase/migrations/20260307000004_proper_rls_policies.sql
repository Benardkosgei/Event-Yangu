-- Proper RLS policies without recursion
-- Migration: 20260307000004_proper_rls_policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their created events" ON public.events;
DROP POLICY IF EXISTS "Users can view events where they are members" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Event creators can update their events" ON public.events;
DROP POLICY IF EXISTS "Event creators can delete their events" ON public.events;

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.event_members;
DROP POLICY IF EXISTS "Event creators can view all event members" ON public.event_members;
DROP POLICY IF EXISTS "Users can join events themselves" ON public.event_members;
DROP POLICY IF EXISTS "Event creators can add members to their events" ON public.event_members;
DROP POLICY IF EXISTS "Users can leave events" ON public.event_members;
DROP POLICY IF EXISTS "Event creators can remove members from their events" ON public.event_members;

-- Re-enable RLS with proper policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;

-- Events policies (non-recursive)
CREATE POLICY "Users can view their created events" ON public.events
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can view events where they are members" ON public.events
    FOR SELECT USING (
        id IN (
            SELECT event_id 
            FROM public.event_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = created_by
    );

CREATE POLICY "Event creators can update their events" ON public.events
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete their events" ON public.events
    FOR DELETE USING (auth.uid() = created_by);

-- Event members policies (non-recursive)
CREATE POLICY "Users can view their own memberships" ON public.event_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Event creators can view all event members" ON public.event_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can join events themselves" ON public.event_members
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.uid() = user_id
    );

CREATE POLICY "Event creators can add members to their events" ON public.event_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can leave events" ON public.event_members
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Event creators can remove members from their events" ON public.event_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );