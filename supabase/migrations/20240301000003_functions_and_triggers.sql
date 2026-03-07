-- Functions and triggers
-- Migration: 20240301000003_functions_and_triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate unique join codes
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
    code_exists BOOLEAN := true;
BEGIN
    WHILE code_exists LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        
        SELECT EXISTS(SELECT 1 FROM public.events WHERE join_code = result) INTO code_exists;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update vendor rating
CREATE OR REPLACE FUNCTION public.update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.vendors 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2) 
            FROM public.vendor_reviews 
            WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM public.vendor_reviews 
            WHERE vendor_id = COALESCE(NEW.vendor_id, OLD.vendor_id)
        )
    WHERE id = COALESCE(NEW.vendor_id, OLD.vendor_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to validate budget allocation
CREATE OR REPLACE FUNCTION public.validate_budget_allocation()
RETURNS TRIGGER AS $$
DECLARE
    total_allocated DECIMAL(12,2);
    budget_total DECIMAL(12,2);
BEGIN
    SELECT total_budget INTO budget_total 
    FROM public.budgets 
    WHERE id = NEW.budget_id;
    
    SELECT COALESCE(SUM(allocated_amount), 0) INTO total_allocated
    FROM public.budget_categories 
    WHERE budget_id = NEW.budget_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF (total_allocated + NEW.allocated_amount) > budget_total THEN
        RAISE EXCEPTION 'Total allocated amount (%) exceeds budget total (%)', 
            (total_allocated + NEW.allocated_amount), budget_total;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate expense against category budget
CREATE OR REPLACE FUNCTION public.validate_expense_amount()
RETURNS TRIGGER AS $$
DECLARE
    category_allocated DECIMAL(12,2);
    category_spent DECIMAL(12,2);
BEGIN
    SELECT allocated_amount INTO category_allocated
    FROM public.budget_categories
    WHERE id = NEW.category_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO category_spent
    FROM public.expenses
    WHERE category_id = NEW.category_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF (category_spent + NEW.amount) > category_allocated THEN
        RAISE EXCEPTION 'Expense amount (%) would exceed category budget. Available: %', 
            NEW.amount, (category_allocated - category_spent);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_id_value UUID;
BEGIN
    -- Try to get user_id from different possible columns
    user_id_value := COALESCE(
        NULLIF(NEW.created_by, NULL),
        NULLIF(NEW.added_by, NULL),
        NULLIF(OLD.created_by, NULL),
        NULLIF(OLD.added_by, NULL),
        auth.uid()
    );
    
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
        user_id_value
    );
    
    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RAISE WARNING 'Audit log failed: %', SQLERRM;
        RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign event creator as admin member
CREATE OR REPLACE FUNCTION public.auto_assign_event_creator()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.event_members (event_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'admin')
    ON CONFLICT (event_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type notification_type,
    p_related_id UUID DEFAULT NULL,
    p_related_table TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, title, message, type, related_id, related_table
    ) VALUES (
        p_user_id, p_title, p_message, p_type, p_related_id, p_related_table
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify task assignees
CREATE OR REPLACE FUNCTION public.notify_task_assignees()
RETURNS TRIGGER AS $$
DECLARE
    assignee_id UUID;
    task_title TEXT;
    event_name TEXT;
BEGIN
    SELECT title INTO task_title FROM public.tasks WHERE id = NEW.task_id;
    SELECT e.name INTO event_name 
    FROM public.events e 
    JOIN public.tasks t ON e.id = t.event_id 
    WHERE t.id = NEW.task_id;
    
    PERFORM public.create_notification(
        NEW.user_id,
        'New Task Assignment',
        format('You have been assigned to task "%s" in event "%s"', task_title, event_name),
        'task',
        NEW.task_id,
        'tasks'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_committees_updated_at 
    BEFORE UPDATE ON public.committees 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
    BEFORE UPDATE ON public.budgets 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
    BEFORE UPDATE ON public.vendors 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_profiles_updated_at 
    BEFORE UPDATE ON public.event_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_live_streams_updated_at 
    BEFORE UPDATE ON public.live_streams 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-generate join codes
CREATE OR REPLACE FUNCTION public.set_join_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
        NEW.join_code = public.generate_join_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_event_join_code
    BEFORE INSERT ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.set_join_code();

-- Trigger to update vendor ratings
CREATE TRIGGER update_vendor_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.vendor_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_vendor_rating();

-- Trigger to validate budget allocation
CREATE TRIGGER validate_budget_allocation_trigger
    BEFORE INSERT OR UPDATE ON public.budget_categories
    FOR EACH ROW EXECUTE FUNCTION public.validate_budget_allocation();

-- Trigger to validate expense amounts
CREATE TRIGGER validate_expense_amount_trigger
    BEFORE INSERT OR UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.validate_expense_amount();

-- Trigger to auto-assign event creator as admin
CREATE TRIGGER auto_assign_event_creator_trigger
    AFTER INSERT ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.auto_assign_event_creator();

-- Trigger to notify task assignees
CREATE TRIGGER notify_task_assignees_trigger
    AFTER INSERT ON public.task_assignments
    FOR EACH ROW EXECUTE FUNCTION public.notify_task_assignees();

-- Audit log triggers (selective tables)
CREATE TRIGGER audit_events_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER audit_tasks_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER audit_expenses_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();