-- Migration: 20260302170057_add_event_features
-- Description: Add event attendance tracking, RSVP functionality, and event tags

-- Add RSVP status enum
CREATE TYPE rsvp_status AS ENUM ('pending', 'accepted', 'declined', 'maybe');

-- Add event_rsvps table for tracking attendance
CREATE TABLE public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status rsvp_status DEFAULT 'pending',
    response_message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(event_id, user_id),
    CONSTRAINT event_rsvps_message_check CHECK (LENGTH(response_message) <= 500)
);

-- Add event_tags table for categorization
CREATE TABLE public.event_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT event_tags_name_check CHECK (LENGTH(name) >= 2),
    CONSTRAINT event_tags_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Add event_tag_assignments for many-to-many relationship
CREATE TABLE public.event_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.event_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(event_id, tag_id)
);

-- Add new columns to events table
ALTER TABLE public.events 
    ADD COLUMN max_attendees INTEGER,
    ADD COLUMN is_public BOOLEAN DEFAULT false,
    ADD COLUMN requires_rsvp BOOLEAN DEFAULT false,
    ADD COLUMN rsvp_deadline TIMESTAMP WITH TIME ZONE,
    ADD COLUMN cover_image_url TEXT,
    ADD COLUMN event_url_slug VARCHAR(100);

-- Add constraints for new columns
ALTER TABLE public.events
    ADD CONSTRAINT events_max_attendees_check CHECK (max_attendees IS NULL OR max_attendees > 0),
    ADD CONSTRAINT events_url_slug_check CHECK (event_url_slug IS NULL OR event_url_slug ~ '^[a-z0-9-]+$');

-- Create indexes for performance
CREATE INDEX idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user_id ON public.event_rsvps(user_id);
CREATE INDEX idx_event_rsvps_status ON public.event_rsvps(status);
CREATE INDEX idx_event_tags_name ON public.event_tags(name);
CREATE INDEX idx_event_tag_assignments_event_id ON public.event_tag_assignments(event_id);
CREATE INDEX idx_event_tag_assignments_tag_id ON public.event_tag_assignments(tag_id);
CREATE INDEX idx_events_is_public ON public.events(is_public);
CREATE INDEX idx_events_url_slug ON public.events(event_url_slug) WHERE event_url_slug IS NOT NULL;

-- Add trigger for updated_at on event_rsvps
CREATE TRIGGER update_event_rsvps_updated_at 
    BEFORE UPDATE ON public.event_rsvps 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update responded_at when status changes
CREATE OR REPLACE FUNCTION public.update_rsvp_responded_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status AND NEW.status != 'pending' THEN
        NEW.responded_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rsvp_responded_at_trigger
    BEFORE UPDATE ON public.event_rsvps
    FOR EACH ROW EXECUTE FUNCTION public.update_rsvp_responded_at();

-- Function to check event capacity before accepting RSVP
CREATE OR REPLACE FUNCTION public.check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
    max_capacity INTEGER;
    current_accepted INTEGER;
BEGIN
    -- Get max attendees for the event
    SELECT max_attendees INTO max_capacity
    FROM public.events
    WHERE id = NEW.event_id;
    
    -- If no limit, allow
    IF max_capacity IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Count current accepted RSVPs
    SELECT COUNT(*) INTO current_accepted
    FROM public.event_rsvps
    WHERE event_id = NEW.event_id 
    AND status = 'accepted'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    -- Check if accepting would exceed capacity
    IF NEW.status = 'accepted' AND current_accepted >= max_capacity THEN
        RAISE EXCEPTION 'Event is at full capacity (% attendees)', max_capacity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_event_capacity_trigger
    BEFORE INSERT OR UPDATE ON public.event_rsvps
    FOR EACH ROW EXECUTE FUNCTION public.check_event_capacity();

-- Function to get event attendance statistics
CREATE OR REPLACE FUNCTION public.get_event_attendance_stats(p_event_id UUID)
RETURNS TABLE (
    total_invited INTEGER,
    accepted INTEGER,
    declined INTEGER,
    maybe INTEGER,
    pending INTEGER,
    response_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_invited,
        COUNT(*) FILTER (WHERE status = 'accepted')::INTEGER as accepted,
        COUNT(*) FILTER (WHERE status = 'declined')::INTEGER as declined,
        COUNT(*) FILTER (WHERE status = 'maybe')::INTEGER as maybe,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending,
        ROUND(
            (COUNT(*) FILTER (WHERE status != 'pending')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
            2
        ) as response_rate
    FROM public.event_rsvps
    WHERE event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for event_rsvps
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view RSVPs for their events" ON public.event_rsvps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = event_rsvps.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own RSVPs" ON public.event_rsvps
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Event admins can manage all RSVPs" ON public.event_rsvps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = event_rsvps.event_id 
            AND user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- RLS Policies for event_tags
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event tags" ON public.event_tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON public.event_tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for event_tag_assignments
ALTER TABLE public.event_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tag assignments for their events" ON public.event_tag_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = event_tag_assignments.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event admins can manage tag assignments" ON public.event_tag_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = event_tag_assignments.event_id 
            AND user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Insert some default tags
INSERT INTO public.event_tags (name, color, description) VALUES
    ('Urgent', '#EF4444', 'High priority events requiring immediate attention'),
    ('Outdoor', '#10B981', 'Events taking place outdoors'),
    ('Virtual', '#3B82F6', 'Online or virtual events'),
    ('Family-Friendly', '#F59E0B', 'Suitable for all ages'),
    ('Formal', '#6366F1', 'Formal dress code required'),
    ('Casual', '#8B5CF6', 'Casual and relaxed atmosphere'),
    ('Fundraising', '#EC4899', 'Fundraising or charity events'),
    ('Networking', '#14B8A6', 'Professional networking opportunities')
ON CONFLICT (name) DO NOTHING;

-- Add comment to document the migration
COMMENT ON TABLE public.event_rsvps IS 'Tracks RSVP responses for events';
COMMENT ON TABLE public.event_tags IS 'Tags for categorizing and filtering events';
COMMENT ON TABLE public.event_tag_assignments IS 'Many-to-many relationship between events and tags';
COMMENT ON FUNCTION public.get_event_attendance_stats IS 'Returns attendance statistics for an event';
COMMENT ON FUNCTION public.check_event_capacity IS 'Prevents accepting RSVPs when event is at capacity';