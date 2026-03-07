-- Indexes and additional constraints
-- Migration: 20240301000002_indexes_and_constraints

-- Performance indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);

CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_join_code ON public.events(join_code);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_is_active ON public.events(is_active);
CREATE INDEX idx_events_location ON public.events USING gin(to_tsvector('english', location));

CREATE INDEX idx_event_members_event_id ON public.event_members(event_id);
CREATE INDEX idx_event_members_user_id ON public.event_members(user_id);
CREATE INDEX idx_event_members_role ON public.event_members(role);

CREATE INDEX idx_committees_event_id ON public.committees(event_id);
CREATE INDEX idx_committees_name ON public.committees USING gin(to_tsvector('english', name));

CREATE INDEX idx_committee_members_committee_id ON public.committee_members(committee_id);
CREATE INDEX idx_committee_members_user_id ON public.committee_members(user_id);

CREATE INDEX idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX idx_tasks_committee_id ON public.tasks(committee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_title ON public.tasks USING gin(to_tsvector('english', title));

CREATE INDEX idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_user_id ON public.task_assignments(user_id);

CREATE INDEX idx_budgets_event_id ON public.budgets(event_id);

CREATE INDEX idx_budget_categories_budget_id ON public.budget_categories(budget_id);

CREATE INDEX idx_expenses_budget_id ON public.expenses(budget_id);
CREATE INDEX idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX idx_expenses_added_by ON public.expenses(added_by);

CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_vendors_rating ON public.vendors(rating);
CREATE INDEX idx_vendors_is_verified ON public.vendors(is_verified);
CREATE INDEX idx_vendors_services ON public.vendors USING gin(services);
CREATE INDEX idx_vendors_business_name ON public.vendors USING gin(to_tsvector('english', business_name));

CREATE INDEX idx_vendor_reviews_vendor_id ON public.vendor_reviews(vendor_id);
CREATE INDEX idx_vendor_reviews_reviewer_id ON public.vendor_reviews(reviewer_id);
CREATE INDEX idx_vendor_reviews_event_id ON public.vendor_reviews(event_id);
CREATE INDEX idx_vendor_reviews_rating ON public.vendor_reviews(rating);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

CREATE INDEX idx_event_profiles_event_id ON public.event_profiles(event_id);

CREATE INDEX idx_live_streams_event_id ON public.live_streams(event_id);
CREATE INDEX idx_live_streams_is_active ON public.live_streams(is_active);

CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_events_active_by_date ON public.events(is_active, start_date) WHERE is_active = true;
CREATE INDEX idx_tasks_event_status ON public.tasks(event_id, status);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_expenses_budget_date ON public.expenses(budget_id, expense_date);

-- Full-text search indexes
CREATE INDEX idx_events_search ON public.events USING gin(
    to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || location)
);

CREATE INDEX idx_tasks_search ON public.tasks USING gin(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- Create immutable function for vendor search
CREATE OR REPLACE FUNCTION public.vendor_search_text(business_name TEXT, description TEXT, services TEXT[])
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
    SELECT business_name || ' ' || COALESCE(description, '') || ' ' || COALESCE(array_to_string(services, ' '), '');
$$;

-- Vendor search index using immutable function
CREATE INDEX idx_vendors_search ON public.vendors USING gin(
    to_tsvector('english', public.vendor_search_text(business_name, description, services))
);