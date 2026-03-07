-- Storage setup for file uploads
-- Migration: 20240301000005_storage_setup

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('event-media', 'event-media', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']),
    ('vendor-portfolio', 'vendor-portfolio', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('expense-receipts', 'expense-receipts', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    ('event-documents', 'event-documents', false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Storage policies for event-media bucket
CREATE POLICY "Event members can upload event media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'event-media' AND
        EXISTS (
            SELECT 1 FROM public.event_members em
            JOIN public.events e ON em.event_id = e.id
            WHERE e.id::text = (storage.foldername(name))[1] AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Event members can view event media" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'event-media' AND
        EXISTS (
            SELECT 1 FROM public.event_members em
            JOIN public.events e ON em.event_id = e.id
            WHERE e.id::text = (storage.foldername(name))[1] AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Event admins can manage event media" ON storage.objects
    FOR ALL USING (
        bucket_id = 'event-media' AND
        EXISTS (
            SELECT 1 FROM public.event_members em
            JOIN public.events e ON em.event_id = e.id
            WHERE e.id::text = (storage.foldername(name))[1] 
            AND em.user_id = auth.uid() 
            AND em.role = 'admin'
        )
    );

-- Storage policies for vendor-portfolio bucket
CREATE POLICY "Vendors can upload their portfolio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vendor-portfolio' AND
        EXISTS (
            SELECT 1 FROM public.vendors v
            WHERE v.user_id = auth.uid() AND v.id::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Vendors can manage their portfolio" ON storage.objects
    FOR ALL USING (
        bucket_id = 'vendor-portfolio' AND
        EXISTS (
            SELECT 1 FROM public.vendors v
            WHERE v.user_id = auth.uid() AND v.id::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Anyone can view vendor portfolios" ON storage.objects
    FOR SELECT USING (bucket_id = 'vendor-portfolio');

-- Storage policies for expense-receipts bucket
CREATE POLICY "Users can upload expense receipts" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'expense-receipts' AND
        EXISTS (
            SELECT 1 FROM public.expenses e
            WHERE e.added_by = auth.uid() AND e.id::text = (storage.foldername(name))[1]
        )
    );

CREATE POLICY "Event members can view expense receipts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'expense-receipts' AND
        EXISTS (
            SELECT 1 FROM public.expenses e
            JOIN public.budget_categories bc ON e.category_id = bc.id
            JOIN public.budgets b ON bc.budget_id = b.id
            JOIN public.event_members em ON b.event_id = em.event_id
            WHERE e.id::text = (storage.foldername(name))[1] AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Expense creators can manage their receipts" ON storage.objects
    FOR ALL USING (
        bucket_id = 'expense-receipts' AND
        EXISTS (
            SELECT 1 FROM public.expenses e
            WHERE e.added_by = auth.uid() AND e.id::text = (storage.foldername(name))[1]
        )
    );

-- Storage policies for event-documents bucket
CREATE POLICY "Event admins can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'event-documents' AND
        EXISTS (
            SELECT 1 FROM public.event_members em
            JOIN public.events e ON em.event_id = e.id
            WHERE e.id::text = (storage.foldername(name))[1] 
            AND em.user_id = auth.uid() 
            AND em.role = 'admin'
        )
    );

CREATE POLICY "Event members can view documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'event-documents' AND
        EXISTS (
            SELECT 1 FROM public.event_members em
            JOIN public.events e ON em.event_id = e.id
            WHERE e.id::text = (storage.foldername(name))[1] AND em.user_id = auth.uid()
        )
    );

CREATE POLICY "Event admins can manage documents" ON storage.objects
    FOR ALL USING (
        bucket_id = 'event-documents' AND
        EXISTS (
            SELECT 1 FROM public.event_members em
            JOIN public.events e ON em.event_id = e.id
            WHERE e.id::text = (storage.foldername(name))[1] 
            AND em.user_id = auth.uid() 
            AND em.role = 'admin'
        )
    );