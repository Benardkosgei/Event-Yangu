import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event, Committee, Task } from '../types';
import { eventService } from '../services/event.service';
import { supabase } from '../lib/supabase';

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  committees: Committee[];
  tasks: Task[];
  isLoading: boolean;
  loadEvents: () => Promise<void>;
  addEvent: (event: Partial<Event>) => Promise<Event>;
  selectEvent: (eventId: string) => void;
  joinEvent: (joinCode: string) => Promise<void>;
  loadCommittees: (eventId: string) => Promise<void>;
  loadTasks: (eventId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  createCommittee: (committee: Partial<Committee>) => Promise<void>;
  subscribeToEventUpdates: (eventId: string) => () => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
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
            events: [newEvent, ...state.events],
            isLoading: false,
          }));
          return newEvent;
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
            events: [event, ...state.events],
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
          const updatedTask = await eventService.updateTaskStatus(taskId, status);
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId ? updatedTask : task
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      createTask: async (taskData: Partial<Task>) => {
        set({ isLoading: true });
        try {
          const newTask = await eventService.createTask(taskData);
          set((state) => ({
            tasks: [newTask, ...state.tasks],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      createCommittee: async (committeeData: Partial<Committee>) => {
        set({ isLoading: true });
        try {
          const newCommittee = await eventService.createCommittee(committeeData);
          set((state) => ({
            committees: [newCommittee, ...state.committees],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      subscribeToEventUpdates: (eventId: string) => {
        // Subscribe to real-time updates for tasks
        const tasksSubscription = supabase
          .channel(`tasks-${eventId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'tasks',
              filter: `event_id=eq.${eventId}`,
            },
            (payload) => {
              const { loadTasks } = get();
              // Reload tasks when changes occur
              loadTasks(eventId).catch(console.error);
            }
          )
          .subscribe();

        // Subscribe to committee updates
        const committeesSubscription = supabase
          .channel(`committees-${eventId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'committees',
              filter: `event_id=eq.${eventId}`,
            },
            (payload) => {
              const { loadCommittees } = get();
              // Reload committees when changes occur
              loadCommittees(eventId).catch(console.error);
            }
          )
          .subscribe();

        // Return cleanup function
        return () => {
          tasksSubscription.unsubscribe();
          committeesSubscription.unsubscribe();
        };
      },
    }),
    {
      name: 'event-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        events: state.events,
        selectedEvent: state.selectedEvent,
      }),
    }
  )
);
