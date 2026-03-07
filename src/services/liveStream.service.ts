import { supabase } from '../lib/supabase';
import { LiveStream, StreamSource, StreamPlatform, StreamVisibility } from '../types';

export const liveStreamService = {
  async getLiveStreams(eventId: string): Promise<LiveStream[]> {
    const { data: streams, error } = await supabase
      .from('live_streams')
      .select(`
        *,
        stream_sources (*)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch live streams');
    }

    return streams.map((stream): LiveStream => ({
      id: stream.id,
      eventId: stream.event_id,
      title: stream.title,
      description: stream.description,
      isActive: stream.is_active,
      visibility: stream.visibility,
      scheduledStart: stream.scheduled_start ? new Date(stream.scheduled_start) : undefined,
      scheduledEnd: stream.scheduled_end ? new Date(stream.scheduled_end) : undefined,
      actualStart: stream.actual_start ? new Date(stream.actual_start) : undefined,
      actualEnd: stream.actual_end ? new Date(stream.actual_end) : undefined,
      createdBy: stream.created_by,
      createdAt: new Date(stream.created_at),
      sources: stream.stream_sources.map((source: any): StreamSource => ({
        id: source.id,
        liveStreamId: source.live_stream_id,
        platform: source.platform,
        platformName: source.platform_name,
        streamUrl: source.stream_url,
        streamKey: source.stream_key,
        embedCode: source.embed_code,
        isPrimary: source.is_primary,
        isActive: source.is_active,
        viewerCount: source.viewer_count,
        platformStreamId: source.platform_stream_id,
        platformData: source.platform_data,
        createdAt: new Date(source.created_at),
      })),
    }));
  },

  async createLiveStream(data: {
    eventId: string;
    title: string;
    description?: string;
    visibility?: StreamVisibility;
    scheduledStart?: Date;
    scheduledEnd?: Date;
  }): Promise<LiveStream> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: stream, error } = await supabase
      .from('live_streams')
      .insert({
        event_id: data.eventId,
        title: data.title,
        description: data.description,
        visibility: data.visibility || 'members',
        scheduled_start: data.scheduledStart?.toISOString(),
        scheduled_end: data.scheduledEnd?.toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create live stream');
    }

    return {
      id: stream.id,
      eventId: stream.event_id,
      title: stream.title,
      description: stream.description,
      isActive: stream.is_active,
      visibility: stream.visibility,
      scheduledStart: stream.scheduled_start ? new Date(stream.scheduled_start) : undefined,
      scheduledEnd: stream.scheduled_end ? new Date(stream.scheduled_end) : undefined,
      actualStart: stream.actual_start ? new Date(stream.actual_start) : undefined,
      actualEnd: stream.actual_end ? new Date(stream.actual_end) : undefined,
      createdBy: stream.created_by,
      createdAt: new Date(stream.created_at),
      sources: [],
    };
  },

  async addStreamSource(data: {
    liveStreamId: string;
    platform: StreamPlatform;
    platformName?: string;
    streamUrl: string;
    streamKey?: string;
    embedCode?: string;
    isPrimary?: boolean;
  }): Promise<StreamSource> {
    // If this is set as primary, unset other primary sources first
    if (data.isPrimary) {
      await supabase
        .from('stream_sources')
        .update({ is_primary: false })
        .eq('live_stream_id', data.liveStreamId);
    }

    const { data: source, error } = await supabase
      .from('stream_sources')
      .insert({
        live_stream_id: data.liveStreamId,
        platform: data.platform,
        platform_name: data.platformName,
        stream_url: data.streamUrl,
        stream_key: data.streamKey,
        embed_code: data.embedCode,
        is_primary: data.isPrimary || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to add stream source');
    }

    return {
      id: source.id,
      liveStreamId: source.live_stream_id,
      platform: source.platform,
      platformName: source.platform_name,
      streamUrl: source.stream_url,
      streamKey: source.stream_key,
      embedCode: source.embed_code,
      isPrimary: source.is_primary,
      isActive: source.is_active,
      viewerCount: source.viewer_count,
      platformStreamId: source.platform_stream_id,
      platformData: source.platform_data,
      createdAt: new Date(source.created_at),
    };
  },

  async updateStreamSource(sourceId: string, updates: {
    streamUrl?: string;
    streamKey?: string;
    embedCode?: string;
    isActive?: boolean;
    isPrimary?: boolean;
    viewerCount?: number;
  }): Promise<void> {
    // If setting as primary, unset other primary sources first
    if (updates.isPrimary) {
      const { data: source } = await supabase
        .from('stream_sources')
        .select('live_stream_id')
        .eq('id', sourceId)
        .single();

      if (source) {
        await supabase
          .from('stream_sources')
          .update({ is_primary: false })
          .eq('live_stream_id', source.live_stream_id)
          .neq('id', sourceId);
      }
    }

    const { error } = await supabase
      .from('stream_sources')
      .update({
        stream_url: updates.streamUrl,
        stream_key: updates.streamKey,
        embed_code: updates.embedCode,
        is_active: updates.isActive,
        is_primary: updates.isPrimary,
        viewer_count: updates.viewerCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sourceId);

    if (error) {
      throw new Error('Failed to update stream source');
    }
  },

  async deleteStreamSource(sourceId: string): Promise<void> {
    const { error } = await supabase
      .from('stream_sources')
      .delete()
      .eq('id', sourceId);

    if (error) {
      throw new Error('Failed to delete stream source');
    }
  },

  async toggleStreamStatus(streamId: string, isActive: boolean): Promise<void> {
    const updates: any = {
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    if (isActive) {
      updates.actual_start = new Date().toISOString();
    } else {
      updates.actual_end = new Date().toISOString();
    }

    const { error } = await supabase
      .from('live_streams')
      .update(updates)
      .eq('id', streamId);

    if (error) {
      throw new Error('Failed to toggle stream status');
    }
  },

  async recordAnalytics(sourceId: string, data: {
    viewerCount: number;
    engagementData?: Record<string, any>;
  }): Promise<void> {
    const { error } = await supabase
      .from('stream_analytics')
      .insert({
        stream_source_id: sourceId,
        viewer_count: data.viewerCount,
        engagement_data: data.engagementData,
      });

    if (error) {
      console.warn('Failed to record stream analytics:', error);
    }
  },

  // Real-time subscription for stream updates
  subscribeToStreamUpdates(eventId: string, callback: (streams: LiveStream[]) => void) {
    const subscription = supabase
      .channel(`live-streams-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // Reload streams when changes occur
          this.getLiveStreams(eventId)
            .then(callback)
            .catch(console.error);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stream_sources',
        },
        () => {
          // Reload streams when source changes occur
          this.getLiveStreams(eventId)
            .then(callback)
            .catch(console.error);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
};