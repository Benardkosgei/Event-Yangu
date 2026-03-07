-- Initial schema for Event Yangu
-- Migration: 20240301000001_initial_schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'committee', 'member', 'vendor', 'viewer');
CREATE TYPE event_type AS ENUM ('burial', 'wedding', 'fundraiser', 'meeting', 'community', 'corporate', 'other');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE notification_type AS ENUM ('task', 'event', 'budget', 'announcement');
CREATE TYPE stream_visibility AS ENUM ('public', 'members');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'member',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_name_check CHECK (LENGTH(name) >= 2),
    CONSTRAINT users_phone_check CHECK (phone IS NULL OR phone ~* '^[+]?[\d\s\-()]+$')
);

-- Events table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type event_type NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255) NOT NULL,
    join_code VARCHAR(10) UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT events_name_check CHECK (LENGTH(name) >= 3),
    CONSTRAINT events_location_check CHECK (LENGTH(location) >= 2),
    CONSTRAINT events_join_code_check CHECK (LENGTH(join_code) = 6 AND join_code ~ '^[A-Z0-9]+$'),
    CONSTRAINT events_date_check CHECK (end_date IS NULL OR end_date > start_date)
);

-- Event members (many-to-many relationship)
CREATE TABLE public.event_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(event_id, user_id),
    CONSTRAINT event_members_role_check CHECK (role IN ('admin', 'committee', 'member'))
);

-- Committees table
CREATE TABLE public.committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT committees_name_check CHECK (LENGTH(name) >= 2)
);

-- Committee members
CREATE TABLE public.committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(committee_id, user_id),
    CONSTRAINT committee_members_role_check CHECK (role IN ('chair', 'member'))
);

-- Tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    committee_id UUID REFERENCES public.committees(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT tasks_title_check CHECK (LENGTH(title) >= 3),
    CONSTRAINT tasks_priority_check CHECK (priority BETWEEN 1 AND 5)
);

-- Task assignments
CREATE TABLE public.task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    UNIQUE(task_id, user_id)
);

-- Budget table
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    total_budget DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT budgets_total_check CHECK (total_budget > 0),
    CONSTRAINT budgets_currency_check CHECK (LENGTH(currency) = 3)
);

-- Budget categories
CREATE TABLE public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    allocated_amount DECIMAL(12,2) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT budget_categories_name_check CHECK (LENGTH(name) >= 2),
    CONSTRAINT budget_categories_amount_check CHECK (allocated_amount >= 0),
    CONSTRAINT budget_categories_color_check CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Expenses
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.budget_categories(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    added_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT expenses_description_check CHECK (LENGTH(description) >= 3),
    CONSTRAINT expenses_amount_check CHECK (amount > 0)
);

-- Vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    services TEXT[] NOT NULL DEFAULT '{}',
    portfolio_urls TEXT[] DEFAULT '{}',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url TEXT,
    address TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id),
    CONSTRAINT vendors_business_name_check CHECK (LENGTH(business_name) >= 2),
    CONSTRAINT vendors_rating_check CHECK (rating >= 0 AND rating <= 5),
    CONSTRAINT vendors_total_reviews_check CHECK (total_reviews >= 0),
    CONSTRAINT vendors_contact_email_check CHECK (contact_email IS NULL OR contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Vendor reviews
CREATE TABLE public.vendor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(vendor_id, reviewer_id, event_id),
    CONSTRAINT vendor_reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id UUID,
    related_table VARCHAR(50),
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT notifications_title_check CHECK (LENGTH(title) >= 1),
    CONSTRAINT notifications_message_check CHECK (LENGTH(message) >= 1)
);

-- Event profiles (for special events like memorials)
CREATE TABLE public.event_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    honoree_name VARCHAR(255),
    biography TEXT,
    birth_date DATE,
    memorial_date DATE,
    media_urls TEXT[] DEFAULT '{}',
    tribute_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(event_id),
    CONSTRAINT event_profiles_dates_check CHECK (memorial_date IS NULL OR birth_date IS NULL OR memorial_date > birth_date)
);

-- Live streams
CREATE TABLE public.live_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    stream_url TEXT NOT NULL,
    stream_key VARCHAR(255),
    is_active BOOLEAN DEFAULT false,
    visibility stream_visibility DEFAULT 'members',
    max_viewers INTEGER,
    current_viewers INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT live_streams_title_check CHECK (LENGTH(title) >= 3),
    CONSTRAINT live_streams_viewers_check CHECK (current_viewers >= 0 AND (max_viewers IS NULL OR current_viewers <= max_viewers))
);

-- Audit log table for tracking changes
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT audit_logs_action_check CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);