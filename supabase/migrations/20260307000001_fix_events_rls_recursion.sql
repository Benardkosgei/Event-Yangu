-- Fix infinite recursion in events RLS policy
-- Migration: 20260307000001_fix_events_rls_recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view events they're members of" ON public.events;

-- Create a fixed policy without recursion
CREATE POLICY "Users can view events they're members of" ON public.events
    FOR SELECT USING (
        -- User is the event creator
        auth.uid() = created_by 
        OR 
        -- User is a member (direct check without subquery on events table)
        id IN (
            SELECT em.event_id 
            FROM public.event_members em 
            WHERE em.user_id = auth.uid()
        )
    );