import { supabase } from '../lib/supabase';
import { Event, Committee, Task } from '../types';

// Helper function to generate unique join codes
const generateJoinCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const eventService = {
  async getEvents(): Promise<Event[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get events where user is a member or creator
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        event_members!inner(user_id)
      `)
      .or(`created_by.eq.${user.id},event_members.user_id.eq.${user.id}`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch events');
    }

    return events.map((event): Event => ({
      id: event.id,
      name: event.name,
      type: event.type,
      description: event.description || '',
      startDate: new Date(event.start_date),
      endDate: event.end_date ? new Date(event.end_date) : undefined,
      location: event.location,
      joinCode: event.join_code,
      createdBy: event.created_by,
      createdAt: new Date(event.created_at),
      isActive: event.is_active,
    }));
  },

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const joinCode = generateJoinCode();

    console.log('Creating event with data:', {
      name: eventData.name,
      type: eventData.type,
      location: eventData.location,
      userId: user.id,
    });

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        name: eventData.name!,
        type: eventData.type!,
        description: eventData.description,
        start_date: eventData.startDate!.toISOString(),
        end_date: eventData.endDate?.toISOString(),
        location: eventData.location!,
        join_code: joinCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (eventError) {
      console.error('Event creation error:', eventError);
      throw new Error(eventError.message || 'Failed to create event');
    }

    console.log('Event created successfully:', event.id);

    // Add creator as event member with admin role
    const { error: memberError } = await supabase
      .from('event_members')
      .insert({
        event_id: event.id,
        user_id: user.id,
        role: 'admin',
      });

    if (memberError) {
      console.error('Failed to add creator as member:', memberError);
      // Don't throw error here, event is already created
    } else {
      console.log('Creator added as event member');
    }

    return {
      id: event.id,
      name: event.name,
      type: event.type,
      description: event.description || '',
      startDate: new Date(event.start_date),
      endDate: event.end_date ? new Date(event.end_date) : undefined,
      location: event.location,
      joinCode: event.join_code,
      createdBy: event.created_by,
      createdAt: new Date(event.created_at),
      isActive: event.is_active,
    };
  },

  async joinEvent(joinCode: string): Promise<Event> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Find event by join code
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('join_code', joinCode)
      .eq('is_active', true)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found or invalid join code');
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('event_members')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single();

    if (!existingMember) {
      // Add user as event member
      const { error: memberError } = await supabase
        .from('event_members')
        .insert({
          event_id: event.id,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) {
        throw new Error('Failed to join event');
      }
    }

    return {
      id: event.id,
      name: event.name,
      type: event.type,
      description: event.description || '',
      startDate: new Date(event.start_date),
      endDate: event.end_date ? new Date(event.end_date) : undefined,
      location: event.location,
      joinCode: event.join_code,
      createdBy: event.created_by,
      createdAt: new Date(event.created_at),
      isActive: event.is_active,
    };
  },

  async getCommittees(eventId: string): Promise<Committee[]> {
    const { data: committees, error } = await supabase
      .from('committees')
      .select(`
        *,
        committee_members(user_id)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch committees');
    }

    return committees.map((committee): Committee => ({
      id: committee.id,
      eventId: committee.event_id,
      name: committee.name,
      description: committee.description || '',
      members: committee.committee_members.map((m: any) => m.user_id),
      createdAt: new Date(committee.created_at),
    }));
  },

  async getTasks(eventId: string): Promise<Task[]> {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_assignments(user_id)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch tasks');
    }

    return tasks.map((task): Task => ({
      id: task.id,
      eventId: task.event_id,
      committeeId: task.committee_id,
      title: task.title,
      description: task.description || '',
      assignedTo: task.task_assignments.map((a: any) => a.user_id),
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
    }));
  },

  async updateTaskStatus(taskId: string, status: string): Promise<Task> {
    const { data: task, error } = await supabase
      .from('tasks')
      .update({ status: status as any })
      .eq('id', taskId)
      .select(`
        *,
        task_assignments(user_id)
      `)
      .single();

    if (error) {
      throw new Error('Failed to update task status');
    }

    return {
      id: task.id,
      eventId: task.event_id,
      committeeId: task.committee_id,
      title: task.title,
      description: task.description || '',
      assignedTo: task.task_assignments.map((a: any) => a.user_id),
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
    };
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        event_id: taskData.eventId!,
        committee_id: taskData.committeeId,
        title: taskData.title!,
        description: taskData.description,
        status: taskData.status || 'pending',
        due_date: taskData.dueDate?.toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (taskError) {
      throw new Error('Failed to create task');
    }

    // Add task assignments if provided
    if (taskData.assignedTo && taskData.assignedTo.length > 0) {
      const assignments = taskData.assignedTo.map(userId => ({
        task_id: task.id,
        user_id: userId,
      }));

      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert(assignments);

      if (assignmentError) {
        console.warn('Failed to create task assignments:', assignmentError);
      }
    }

    return {
      id: task.id,
      eventId: task.event_id,
      committeeId: task.committee_id,
      title: task.title,
      description: task.description || '',
      assignedTo: taskData.assignedTo || [],
      status: task.status,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      createdAt: new Date(task.created_at),
    };
  },

  async createCommittee(committeeData: Partial<Committee>): Promise<Committee> {
    const { data: committee, error: committeeError } = await supabase
      .from('committees')
      .insert({
        event_id: committeeData.eventId!,
        name: committeeData.name!,
        description: committeeData.description,
      })
      .select()
      .single();

    if (committeeError) {
      throw new Error('Failed to create committee');
    }

    // Add committee members if provided
    if (committeeData.members && committeeData.members.length > 0) {
      const members = committeeData.members.map(userId => ({
        committee_id: committee.id,
        user_id: userId,
        role: 'member',
      }));

      const { error: memberError } = await supabase
        .from('committee_members')
        .insert(members);

      if (memberError) {
        console.warn('Failed to add committee members:', memberError);
      }
    }

    return {
      id: committee.id,
      eventId: committee.event_id,
      name: committee.name,
      description: committee.description || '',
      members: committeeData.members || [],
      createdAt: new Date(committee.created_at),
    };
  },
};
