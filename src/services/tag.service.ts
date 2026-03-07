import { supabase } from '../lib/supabase';

export interface EventTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
}

export const tagService = {
  async getAllTags(): Promise<EventTag[]> {
    const { data, error } = await supabase
      .from('event_tags')
      .select('*')
      .order('name');

    if (error) {
      throw new Error('Failed to fetch tags');
    }

    return data.map((tag): EventTag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      description: tag.description,
      createdAt: new Date(tag.created_at),
    }));
  },

  async createTag(tag: Omit<EventTag, 'id' | 'createdAt'>): Promise<EventTag> {
    const { data, error } = await supabase
      .from('event_tags')
      .insert({
        name: tag.name,
        color: tag.color,
        description: tag.description,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create tag');
    }

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      description: data.description,
      createdAt: new Date(data.created_at),
    };
  },

  async getEventTags(eventId: string): Promise<EventTag[]> {
    const { data, error } = await supabase
      .from('event_tag_assignments')
      .select(`
        event_tags(*)
      `)
      .eq('event_id', eventId);

    if (error) {
      throw new Error('Failed to fetch event tags');
    }

    return data.map((assignment: any): EventTag => ({
      id: assignment.event_tags.id,
      name: assignment.event_tags.name,
      color: assignment.event_tags.color,
      description: assignment.event_tags.description,
      createdAt: new Date(assignment.event_tags.created_at),
    }));
  },

  async assignTagToEvent(eventId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('event_tag_assignments')
      .insert({
        event_id: eventId,
        tag_id: tagId,
      });

    if (error) {
      throw new Error('Failed to assign tag to event');
    }
  },

  async removeTagFromEvent(eventId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('event_tag_assignments')
      .delete()
      .eq('event_id', eventId)
      .eq('tag_id', tagId);

    if (error) {
      throw new Error('Failed to remove tag from event');
    }
  },

  async searchEventsByTag(tagId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('event_tag_assignments')
      .select(`
        events(*)
      `)
      .eq('tag_id', tagId);

    if (error) {
      throw new Error('Failed to search events by tag');
    }

    return data.map((assignment: any) => assignment.events);
  },
};