import api from './api';
import { Event, Committee, Task } from '../types';

export const eventService = {
  async getEvents(): Promise<Event[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Smith Family Wedding',
            type: 'wedding',
            description: 'Join us in celebrating the union of John and Jane Smith.',
            startDate: new Date('2026-03-15'),
            location: 'Nairobi, Kenya',
            joinCode: 'ABC123',
            createdBy: '1',
            createdAt: new Date(),
            isActive: true,
          },
          {
            id: '2',
            name: 'Community Fundraiser',
            type: 'fundraiser',
            description: 'Supporting local education initiatives.',
            startDate: new Date('2026-02-20'),
            location: 'Mombasa, Kenya',
            joinCode: 'DEF456',
            createdBy: '1',
            createdAt: new Date(),
            isActive: true,
          },
        ]);
      }, 500);
    });
    // Real implementation:
    // const response = await api.get<Event[]>('/events');
    // return response.data;
  },

  async createEvent(event: Partial<Event>): Promise<Event> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...event,
          id: Date.now().toString(),
          joinCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          createdAt: new Date(),
          isActive: true,
        } as Event);
      }, 500);
    });
    // Real implementation:
    // const response = await api.post<Event>('/events', event);
    // return response.data;
  },

  async joinEvent(joinCode: string): Promise<Event> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: '3',
          name: 'Joined Event',
          type: 'meeting',
          description: 'Event joined successfully',
          startDate: new Date(),
          location: 'Kisumu',
          joinCode,
          createdBy: '2',
          createdAt: new Date(),
          isActive: true,
        });
      }, 500);
    });
    // Real implementation:
    // const response = await api.post<Event>('/events/join', { joinCode });
    // return response.data;
  },

  async getCommittees(eventId: string): Promise<Committee[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            eventId,
            name: 'Venue Committee',
            description: 'Responsible for venue setup and decoration',
            members: ['1', '2', '3'],
            createdAt: new Date(),
          },
          {
            id: '2',
            eventId,
            name: 'Catering Committee',
            description: 'Manages food and beverages',
            members: ['4', '5'],
            createdAt: new Date(),
          },
        ]);
      }, 500);
    });
    // Real implementation:
    // const response = await api.get<Committee[]>(`/events/${eventId}/committees`);
    // return response.data;
  },

  async getTasks(eventId: string): Promise<Task[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            eventId,
            title: 'Book venue',
            description: 'Reserve the main hall for the event',
            assignedTo: ['1'],
            status: 'completed',
            dueDate: new Date('2026-02-15'),
            createdAt: new Date(),
          },
          {
            id: '2',
            eventId,
            title: 'Order flowers',
            description: 'Contact florist and place order',
            assignedTo: ['2'],
            status: 'in_progress',
            dueDate: new Date('2026-02-20'),
            createdAt: new Date(),
          },
        ]);
      }, 500);
    });
    // Real implementation:
    // const response = await api.get<Task[]>(`/events/${eventId}/tasks`);
    // return response.data;
  },

  async updateTaskStatus(taskId: string, status: string): Promise<Task> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: taskId,
          eventId: '1',
          title: 'Updated Task',
          description: 'Task updated',
          assignedTo: ['1'],
          status: status as any,
          createdAt: new Date(),
        });
      }, 500);
    });
    // Real implementation:
    // const response = await api.patch<Task>(`/tasks/${taskId}`, { status });
    // return response.data;
  },
};
