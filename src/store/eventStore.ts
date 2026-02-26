import { create } from 'zustand';
import { Event, Committee, Task } from '../types';
import { eventService } from '../services/event.service';

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  committees: Committee[];
  tasks: Task[];
  isLoading: boolean;
  loadEvents: () => Promise<void>;
  addEvent: (event: Partial<Event>) => Promise<void>;
  selectEvent: (eventId: string) => void;
  joinEvent: (joinCode: string) => Promise<void>;
  loadCommittees: (eventId: string) => Promise<void>;
  loadTasks: (eventId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  selectedEvent: null,
  committees: [],
  tasks: [],
  isLoading: false,

  loadEvents: async () => {
    set({ isLoading: true });
    try {
      const events = await eventService.getEvents();
      set({ events, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addEvent: async (event: Partial<Event>) => {
    set({ isLoading: true });
    try {
      const newEvent = await eventService.createEvent(event);
      set((state) => ({ 
        events: [...state.events, newEvent],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  selectEvent: (eventId: string) => {
    const event = get().events.find((e) => e.id === eventId);
    set({ selectedEvent: event || null });
  },

  joinEvent: async (joinCode: string) => {
    set({ isLoading: true });
    try {
      const event = await eventService.joinEvent(joinCode);
      set((state) => ({
        events: [...state.events, event],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadCommittees: async (eventId: string) => {
    set({ isLoading: true });
    try {
      const committees = await eventService.getCommittees(eventId);
      set({ committees, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadTasks: async (eventId: string) => {
    set({ isLoading: true });
    try {
      const tasks = await eventService.getTasks(eventId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    try {
      await eventService.updateTaskStatus(taskId, status);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, status: status as any } : task
        ),
      }));
    } catch (error) {
      throw error;
    }
  },
}));
