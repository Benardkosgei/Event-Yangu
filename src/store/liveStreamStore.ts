import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LiveStream, StreamSource, StreamPlatform, StreamVisibility } from '../types';
import { liveStreamService } from '../services/liveStream.service';

interface LiveStreamState {
  streams: Record<string, LiveStream[]>; // eventId -> streams
  isLoading: boolean;
  loadStreams: (eventId: string) => Promise<void>;
  createStream: (eventId: string, data: {
    title: string;
    description?: string;
    visibility?: StreamVisibility;
    scheduledStart?: Date;
    scheduledEnd?: Date;
  }) => Promise<LiveStream>;
  addStreamSource: (liveStreamId: string, data: {
    platform: StreamPlatform;
    platformName?: string;
    streamUrl: string;
    streamKey?: string;
    embedCode?: string;
    isPrimary?: boolean;
  }) => Promise<void>;
  updateStreamSource: (eventId: string, sourceId: string, updates: {
    streamUrl?: string;
    streamKey?: string;
    embedCode?: string;
    isActive?: boolean;
    isPrimary?: boolean;
    viewerCount?: number;
  }) => Promise<void>;
  deleteStreamSource: (eventId: string, sourceId: string) => Promise<void>;
  toggleStreamStatus: (eventId: string, streamId: string, isActive: boolean) => Promise<void>;
  subscribeToUpdates: (eventId: string) => () => void;
}

export const useLiveStreamStore = create<LiveStreamState>()(
  persist(
    (set, get) => ({
      streams: {},
      isLoading: false,

      loadStreams: async (eventId: string) => {
        set({ isLoading: true });
        try {
          const streams = await liveStreamService.getLiveStreams(eventId);
          set((state) => ({
            streams: {
              ...state.streams,
              [eventId]: streams,
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      createStream: async (eventId: string, data) => {
        set({ isLoading: true });
        try {
          const newStream = await liveStreamService.createLiveStream({
            eventId,
            ...data,
          });
          
          set((state) => ({
            streams: {
              ...state.streams,
              [eventId]: [newStream, ...(state.streams[eventId] || [])],
            },
            isLoading: false,
          }));
          
          return newStream;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addStreamSource: async (liveStreamId: string, data) => {
        try {
          const newSource = await liveStreamService.addStreamSource({
            liveStreamId,
            ...data,
          });

          // Update the stream with the new source
          set((state) => {
            const updatedStreams = { ...state.streams };
            
            Object.keys(updatedStreams).forEach(eventId => {
              updatedStreams[eventId] = updatedStreams[eventId].map(stream =>
                stream.id === liveStreamId
                  ? { ...stream, sources: [...stream.sources, newSource] }
                  : stream
              );
            });

            return { streams: updatedStreams };
          });
        } catch (error) {
          throw error;
        }
      },

      updateStreamSource: async (eventId: string, sourceId: string, updates) => {
        try {
          await liveStreamService.updateStreamSource(sourceId, updates);

          // Update local state
          set((state) => ({
            streams: {
              ...state.streams,
              [eventId]: state.streams[eventId]?.map(stream => ({
                ...stream,
                sources: stream.sources.map(source =>
                  source.id === sourceId
                    ? { ...source, ...updates }
                    : updates.isPrimary && source.isPrimary
                    ? { ...source, isPrimary: false }
                    : source
                ),
              })) || [],
            },
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteStreamSource: async (eventId: string, sourceId: string) => {
        try {
          await liveStreamService.deleteStreamSource(sourceId);

          // Update local state
          set((state) => ({
            streams: {
              ...state.streams,
              [eventId]: state.streams[eventId]?.map(stream => ({
                ...stream,
                sources: stream.sources.filter(source => source.id !== sourceId),
              })) || [],
            },
          }));
        } catch (error) {
          throw error;
        }
      },

      toggleStreamStatus: async (eventId: string, streamId: string, isActive: boolean) => {
        try {
          await liveStreamService.toggleStreamStatus(streamId, isActive);

          // Update local state
          set((state) => ({
            streams: {
              ...state.streams,
              [eventId]: state.streams[eventId]?.map(stream =>
                stream.id === streamId
                  ? { 
                      ...stream, 
                      isActive,
                      actualStart: isActive ? new Date() : stream.actualStart,
                      actualEnd: !isActive ? new Date() : undefined,
                    }
                  : stream
              ) || [],
            },
          }));
        } catch (error) {
          throw error;
        }
      },

      subscribeToUpdates: (eventId: string) => {
        return liveStreamService.subscribeToStreamUpdates(eventId, (streams) => {
          set((state) => ({
            streams: {
              ...state.streams,
              [eventId]: streams,
            },
          }));
        });
      },
    }),
    {
      name: 'live-stream-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        streams: state.streams,
      }),
    }
  )
);