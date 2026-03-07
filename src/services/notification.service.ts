import { supabase } from '../lib/supabase';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch notifications');
    }

    return notifications.map((notification): Notification => ({
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: new Date(notification.created_at),
    }));
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      throw new Error('Failed to mark notification as read');
    }
  },

  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'task' | 'event' | 'budget' | 'announcement',
    relatedId?: string
  ): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create notification');
    }

    return {
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: new Date(notification.created_at),
    };
  },

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const subscription = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification: Notification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            title: payload.new.title,
            message: payload.new.message,
            type: payload.new.type,
            isRead: payload.new.is_read,
            createdAt: new Date(payload.new.created_at),
          };
          callback(notification);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  },
};