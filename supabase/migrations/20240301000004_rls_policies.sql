-- Row Level Security (RLS) Policies
-- Migration: 20240301000004_rls_policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile during registration" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view other users in same events" ON public.users
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT em.user_id 
            FROM public.event_members em
            WHERE em.event_id IN (
                SELECT event_id FROM public.event_members WHERE user_id = auth.uid()
            )
        )
    );

-- Events policies
CREATE POLICY "Users can view events they're members of" ON public.events
    FOR SELECT USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = events.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators and admins can update events" ON public.events
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = events.id AND user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Event creators can delete events" ON public.events
    FOR DELETE USING (auth.uid() = created_by);

-- Event members policies
CREATE POLICY "Users can view event members for their events" ON public.event_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND (
                created_by = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM public.event_members em 
                    WHERE em.event_id = events.id AND em.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Event creators and admins can manage members" ON public.event_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.event_members em
                    WHERE em.event_id = events.id AND em.user_id = auth.uid() AND em.role = 'admin'
                )
            )
        )
    );

CREATE POLICY "Users can join events" ON public.event_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Committees policies
CREATE POLICY "Users can view committees for their events" ON public.committees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = committees.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event members can create committees" ON public.committees
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = committees.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Committee chairs and event admins can update committees" ON public.committees
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.committee_members 
            WHERE committee_id = committees.id AND user_id = auth.uid() AND role = 'chair'
        ) OR
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = committees.event_id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Committee members policies
CREATE POLICY "Users can view committee members for their committees" ON public.committee_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.committees c
            JOIN public.event_members em ON c.event_id = em.event_id
            WHERE c.id = committee_members.committee_id AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Committee chairs can manage members" ON public.committee_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.committee_members cm
            WHERE cm.committee_id = committee_members.committee_id 
            AND cm.user_id = auth.uid() AND cm.role = 'chair'
        )
    );

-- Tasks policies
CREATE POLICY "Users can view tasks for their events" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = tasks.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event members can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = tasks.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Task creators, assignees, and event admins can update tasks" ON public.tasks
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.task_assignments 
            WHERE task_id = tasks.id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = tasks.event_id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Task assignments policies
CREATE POLICY "Users can view task assignments for their events" ON public.task_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            JOIN public.event_members em ON t.event_id = em.event_id
            WHERE t.id = task_assignments.task_id AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Task creators and event admins can assign tasks" ON public.task_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_assignments.task_id AND t.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.tasks t
            JOIN public.event_members em ON t.event_id = em.event_id
            WHERE t.id = task_assignments.task_id AND em.user_id = auth.uid() AND em.role = 'admin'
        )
    );

-- Budget policies
CREATE POLICY "Users can view budgets for their events" ON public.budgets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = budgets.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event admins can manage budgets" ON public.budgets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = budgets.event_id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Budget categories policies
CREATE POLICY "Users can view budget categories for their events" ON public.budget_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.budgets b
            JOIN public.event_members em ON b.event_id = em.event_id
            WHERE b.id = budget_categories.budget_id AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Event admins can manage budget categories" ON public.budget_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.budgets b
            JOIN public.event_members em ON b.event_id = em.event_id
            WHERE b.id = budget_categories.budget_id AND em.user_id = auth.uid() AND em.role = 'admin'
        )
    );

-- Expenses policies
CREATE POLICY "Users can view expenses for their events" ON public.expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.budget_categories bc
            JOIN public.budgets b ON bc.budget_id = b.id
            JOIN public.event_members em ON b.event_id = em.event_id
            WHERE bc.id = expenses.category_id AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Event members can add expenses" ON public.expenses
    FOR INSERT WITH CHECK (
        auth.uid() = added_by AND
        EXISTS (
            SELECT 1 FROM public.budget_categories bc
            JOIN public.budgets b ON bc.budget_id = b.id
            JOIN public.event_members em ON b.event_id = em.event_id
            WHERE bc.id = expenses.category_id AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Expense creators and event admins can update expenses" ON public.expenses
    FOR UPDATE USING (
        auth.uid() = added_by OR
        EXISTS (
            SELECT 1 FROM public.budget_categories bc
            JOIN public.budgets b ON bc.budget_id = b.id
            JOIN public.event_members em ON b.event_id = em.event_id
            WHERE bc.id = expenses.category_id AND em.user_id = auth.uid() AND em.role = 'admin'
        )
    );

-- Vendors policies
CREATE POLICY "Anyone can view verified vendors" ON public.vendors
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can view all vendors" ON public.vendors
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own vendor profile" ON public.vendors
    FOR ALL USING (auth.uid() = user_id);

-- Vendor reviews policies
CREATE POLICY "Anyone can view vendor reviews" ON public.vendor_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for events they participated in" ON public.vendor_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        (event_id IS NULL OR EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = vendor_reviews.event_id AND user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can update their own reviews" ON public.vendor_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Event profiles policies
CREATE POLICY "Users can view event profiles for their events" ON public.event_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = event_profiles.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event admins can manage event profiles" ON public.event_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = event_profiles.event_id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Live streams policies
CREATE POLICY "Users can view live streams for their events" ON public.live_streams
    FOR SELECT USING (
        visibility = 'public' OR
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = live_streams.event_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Event admins can manage live streams" ON public.live_streams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.event_members 
            WHERE event_id = live_streams.event_id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Audit logs policies (admin only)
CREATE POLICY "Event admins can view audit logs for their events" ON public.audit_logs
    FOR SELECT USING (
        table_name = 'events' AND EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = audit_logs.record_id AND created_by = auth.uid()
        ) OR
        table_name = 'tasks' AND EXISTS (
            SELECT 1 FROM public.tasks t
            JOIN public.event_members em ON t.event_id = em.event_id
            WHERE t.id = audit_logs.record_id AND em.user_id = auth.uid() AND em.role = 'admin'
        ) OR
        table_name = 'expenses' AND EXISTS (
            SELECT 1 FROM public.expenses e
            JOIN public.budget_categories bc ON e.category_id = bc.id
            JOIN public.budgets b ON bc.budget_id = b.id
            JOIN public.event_members em ON b.event_id = em.event_id
            WHERE e.id = audit_logs.record_id AND em.user_id = auth.uid() AND em.role = 'admin'
        )
    );