-- Add support for multiple live stream sources
-- Migration: 20260307000005_live_streams_multiple_sources

-- Create enum for stream platforms
CREATE TYPE stream_platform AS ENUM ('youtube', 'facebook', 'instagram', 'tiktok', 'twitch', 'custom', 'rtmp');

-- Drop existing live_streams table and recreate with better structure
DROP TABLE IF EXISTS public.live_streams CASCADE;

-- Create live_streams table for events
CREATE TABLE public.live_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    visibility stream_visibility DEFAULT 'members',
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT live_streams_title_check CHECK (LENGTH(title) >= 3)
);

-- Create stream_sources table for multiple streaming platforms per event
CREATE TABLE public.stream_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
    platform stream_platform NOT NULL,
    platform_name VARCHAR(100), -- Custom name for the platform (e.g., "Main Facebook Page")
    stream_url TEXT NOT NULL,
    stream_key VARCHAR(255),
    embed_code TEXT, -- For platforms that provide embed codes
    is_primary BOOLEAN DEFAULT false, -- Mark one source as primary
    is_active BOOLEAN DEFAULT true,
    viewer_count INTEGER DEFAULT 0,
    platform_stream_id VARCHAR(255), -- Platform-specific stream ID
    platform_data JSONB, -- Store platform-specific metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT stream_sources_url_check CHECK (LENGTH(stream_url) >= 10),
    CONSTRAINT stream_sources_viewer_count_check CHECK (viewer_count >= 0)
);

-- Create stream_analytics table for tracking viewership
CREATE TABLE public.stream_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_source_id UUID NOT NULL REFERENCES public.stream_sources(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    viewer_count INTEGER DEFAULT 0,
    engagement_data JSONB, -- Store likes, comments, shares, etc.
    
    CONSTRAINT stream_analytics_viewer_count_check CHECK (viewer_count >= 0)
);

-- Create indexes for better performance
CREATE INDEX idx_live_streams_event_id ON public.live_streams(event_id);
CREATE INDEX idx_live_streams_is_active ON public.live_streams(is_active);
CREATE INDEX idx_stream_sources_live_stream_id ON public.stream_sources(live_stream_id);
CREATE INDEX idx_stream_sources_platform ON public.stream_sources(platform);
CREATE INDEX idx_stream_sources_is_active ON public.stream_sources(is_active);
CREATE INDEX idx_stream_analytics_stream_source_id ON public.stream_analytics(stream_source_id);
CREATE INDEX idx_stream_analytics_timestamp ON public.stream_analytics(timestamp);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_streams
CREATE POLICY "Users can view live streams for their events" ON public.live_streams
    FOR SELECT USING (
        visibility = 'public' OR
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = live_streams.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event admins can manage live streams" ON public.live_streams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = live_streams.event_id AND user_id = auth.uid() AND role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = live_streams.event_id AND created_by = auth.uid()
        )
    );

-- RLS Policies for stream_sources
CREATE POLICY "Users can view stream sources for accessible streams" ON public.stream_sources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.live_streams ls
            WHERE ls.id = stream_sources.live_stream_id AND (
                ls.visibility = 'public' OR
                EXISTS (
                    SELECT 1 FROM public.event_members 
                    WHERE event_id = ls.event_id AND user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Event admins can manage stream sources" ON public.stream_sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.live_streams ls
            JOIN public.event_members em ON ls.event_id = em.event_id
            WHERE ls.id = stream_sources.live_stream_id 
            AND em.user_id = auth.uid() 
            AND em.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM public.live_streams ls
            JOIN public.events e ON ls.event_id = e.id
            WHERE ls.id = stream_sources.live_stream_id 
            AND e.created_by = auth.uid()
        )
    );

-- RLS Policies for stream_analytics (read-only for most users)
CREATE POLICY "Users can view analytics for accessible streams" ON public.stream_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stream_sources ss
            JOIN public.live_streams ls ON ss.live_stream_id = ls.id
            WHERE ss.id = stream_analytics.stream_source_id AND (
                ls.visibility = 'public' OR
                EXISTS (
                    SELECT 1 FROM public.event_members 
                    WHERE event_id = ls.event_id AND user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "System can insert analytics" ON public.stream_analytics
    FOR INSERT WITH CHECK (true); -- Allow system/service to insert analytics