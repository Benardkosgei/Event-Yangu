// Core Types for Event Yangu

export type UserRole = 'admin' | 'committee' | 'member' | 'vendor' | 'viewer';

export type EventType = 
  | 'burial' 
  | 'wedding' 
  | 'fundraiser' 
  | 'meeting' 
  | 'community' 
  | 'corporate' 
  | 'other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  description: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  joinCode: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Committee {
  id: string;
  eventId: string;
  name: string;
  description: string;
  members: string[];
  createdAt: Date;
}

export interface Task {
  id: string;
  eventId: string;
  committeeId?: string;
  title: string;
  description: string;
  assignedTo: string[];
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
}

export interface Budget {
  id: string;
  eventId: string;
  totalBudget: number;
  categories: BudgetCategory[];
  expenses: Expense[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
}

export interface Expense {
  id: string;
  budgetId: string;
  categoryId: string;
  description: string;
  amount: number;
  date: Date;
  addedBy: string;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  services: string[];
  description: string;
  portfolio: string[];
  contactEmail: string;
  contactPhone: string;
  rating?: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'budget' | 'announcement';
  isRead: boolean;
  createdAt: Date;
}

export interface EventProfile {
  id: string;
  eventId: string;
  honoreeName?: string;
  biography?: string;
  mediaLinks?: string[];
}

export type StreamPlatform = 
  | 'youtube' 
  | 'facebook' 
  | 'instagram' 
  | 'tiktok' 
  | 'twitch' 
  | 'custom' 
  | 'rtmp';

export type StreamVisibility = 'public' | 'members';

export interface LiveStream {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  isActive: boolean;
  visibility: StreamVisibility;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  createdBy: string;
  createdAt: Date;
  sources: StreamSource[];
}

export interface StreamSource {
  id: string;
  liveStreamId: string;
  platform: StreamPlatform;
  platformName?: string;
  streamUrl: string;
  streamKey?: string;
  embedCode?: string;
  isPrimary: boolean;
  isActive: boolean;
  viewerCount: number;
  platformStreamId?: string;
  platformData?: Record<string, any>;
  createdAt: Date;
}

export interface StreamAnalytics {
  id: string;
  streamSourceId: string;
  timestamp: Date;
  viewerCount: number;
  engagementData?: Record<string, any>;
}
