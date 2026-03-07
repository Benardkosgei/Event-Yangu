-- Fix infinite recursion in event_members RLS policies
-- Migration: 20240301000006_fix_event_members_rls

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view event members for their events" ON public.event_members;
DROP POLICY IF EXISTS "Event creators and admins can manage members" ON public.event_members;
DROP POLICY IF EXISTS "Users can join events" ON public.event_members;

-- Create fixed policies without recursion

-- Allow users to view event members if they are the event creator OR already a member
CREATE POLICY "Users can view event members for their events" ON public.event_members
    FOR SELECT USING (
        -- User is the event creator
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
        OR
        -- User is a member of the event (direct check without recursion)
        user_id = auth.uid()
        OR
        -- User is already in the event (check via direct user_id match)
        event_id IN (
            SELECT em.event_id FROM public.event_members em 
            WHERE em.user_id = auth.uid()
        )
    );

-- Allow event creators and admins to manage members
CREATE POLICY "Event creators and admins can manage members" ON public.event_members
    FOR ALL USING (
        -- User is the event creator
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND created_by = auth.uid()
        )
        OR
        -- User is an admin of the event (direct check)
        EXISTS (
            SELECT 1 FROM public.event_members em
            WHERE em.event_id = event_members.event_id 
            AND em.user_id = auth.uid() 
            AND em.role = 'admin'
        )
    );

-- Allow users to join events (insert their own membership)
CREATE POLICY "Users can join events" ON public.event_members
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Allow users to leave events (delete their own membership)
CREATE POLICY "Users can leave events" ON public.event_members
    FOR DELETE USING (
        auth.uid() = user_id
    );
