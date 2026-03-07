-- Comprehensive fix for RLS recursion issues
-- Migration: 20260307000002_comprehensive_rls_fix

-- Temporarily disable RLS to fix policies
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for events and event_members
DROP POLICY IF EXISTS "Users can view events they're members of" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Event creators and admins can update events" ON public.events;
DROP POLICY IF EXISTS "Event creators can delete events" ON public.events;

DROP POLICY IF EXISTS "Users can view event members for their events" ON public.event_members;
DROP POLICY IF EXISTS "Event creators and admins can manage members" ON public.event_members;
DROP POLICY IF EXISTS "Users can join events" ON public.event_members;
DROP POLICY IF EXISTS "Users can leave events" ON public.event_members;

-- Create simple, non-recursive policies for events
CREATE POLICY "Users can view events they created" ON public.events
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can view events they are members of" ON public.events
    FOR SELECT USING (
        id IN (
            SELECT event_id 
            FROM public.event_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update their events" ON public.events
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete their events" ON public.events
    FOR DELETE USING (auth.uid() = created_by);

-- Create simple policies for event_members
CREATE POLICY "Users can view their own memberships" ON public.event_members
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Event creators can view all members" ON public.event_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can join events" ON public.event_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Event creators can add members" ON public.event_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can leave events" ON public.event_members
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Event creators can remove members" ON public.event_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
    );

-- Re-enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;