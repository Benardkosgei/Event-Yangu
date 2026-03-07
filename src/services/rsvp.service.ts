import { supabase } from '../lib/supabase';

export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'maybe';

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  status: RsvpStatus;
  responseMessage?: string;
  respondedAt?: Date;
  createdAt: Date;
}

export interface AttendanceStats {
  totalInvited: number;
  accepted: number;
  declined: number;
  maybe: number;
  pending: number;
  responseRate: number;
}

export const rsvpService = {
  async getRsvpsForEvent(eventId: string): Promise<EventRsvp[]> {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        users(name, email, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch RSVPs');
    }

    return data.map((rsvp): EventRsvp => ({
      id: rsvp.id,
      eventId: rsvp.event_id,
      userId: rsvp.user_id,
      status: rsvp.status,
      responseMessage: rsvp.response_message,
      respondedAt: rsvp.responded_at ? new Date(rsvp.responded_at) : undefined,
      createdAt: new Date(rsvp.created_at),
    }));
  },

  async getUserRsvp(eventId: string): Promise<EventRsvp | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Failed to fetch RSVP');
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      status: data.status,
      responseMessage: data.response_message,
      respondedAt: data.responded_at ? new Date(data.responded_at) : undefined,
      createdAt: new Date(data.created_at),
    };
  },

  async respondToRsvp(
    eventId: string,
    status: RsvpStatus,
    responseMessage?: string
  ): Promise<EventRsvp> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('event_rsvps')
      .upsert({
        event_id: eventId,
        user_id: user.id,
        status,
        response_message: responseMessage,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      status: data.status,
      responseMessage: data.response_message,
      respondedAt: data.responded_at ? new Date(data.responded_at) : undefined,
      createdAt: new Date(data.created_at),
    };
  },

  async getAttendanceStats(eventId: string): Promise<AttendanceStats> {
    const { data, error } = await supabase
      .rpc('get_event_attendance_stats', { p_event_id: eventId })
      .single();

    if (error) {
      throw new Error('Failed to fetch attendance stats');
    }

    return {
      totalInvited: data.total_invited,
      accepted: data.accepted,
      declined: data.declined,
      maybe: data.maybe,
      pending: data.pending,
      responseRate: parseFloat(data.response_rate),
    };
  },

  async inviteUsers(eventId: string, userIds: string[]): Promise<void> {
    const invites = userIds.map(userId => ({
      event_id: eventId,
      user_id: userId,
      status: 'pending' as RsvpStatus,
    }));

    const { error } = await supabase
      .from('event_rsvps')
      .insert(invites);

    if (error) {
      throw new Error('Failed to send invitations');
    }
  },

  subscribeToRsvpUpdates(eventId: string, callback: (rsvp: EventRsvp) => void) {
    const subscription = supabase
      .channel(`rsvps-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_rsvps',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const rsvp: EventRsvp = {
            id: payload.new.id,
            eventId: payload.new.event_id,
            userId: payload.new.user_id,
            status: payload.new.status,
            responseMessage: payload.new.response_message,
            respondedAt: payload.new.responded_at ? new Date(payload.new.responded_at) : undefined,
            createdAt: new Date(payload.new.created_at),
          };
          callback(rsvp);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  },
};