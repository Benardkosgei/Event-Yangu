-- Seed data for Event Yangu
-- This file contains sample data for development and testing

-- First, create auth users (this is required before creating profiles)
-- Note: Password is 'password123' for all test users
-- Password hash generated with: bcrypt.hash('password123', 10)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', 'admin@eventyangu.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"John Admin"}', false, 'authenticated', 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000000', 'sarah.committee@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Sarah Committee"}', false, 'authenticated', 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000000', 'mike.member@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Mike Member"}', false, 'authenticated', 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000000', 'jane.vendor@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Jane Vendor"}', false, 'authenticated', 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440005', '00000000-0000-0000-0000-000000000000', 'tom.viewer@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Tom Viewer"}', false, 'authenticated', 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440006', '00000000-0000-0000-0000-000000000000', 'alice.organizer@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Alice Organizer"}', false, 'authenticated', 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440007', '00000000-0000-0000-0000-000000000000', 'bob.helper@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Bob Helper"}', false, 'authenticated', 'authenticated'),
    ('550e8400-e29b-41d4-a716-446655440008', '00000000-0000-0000-0000-000000000000', 'carol.caterer@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Carol Caterer"}', false, 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create identities for auth users
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '{"sub":"550e8400-e29b-41d4-a716-446655440001","email":"admin@eventyangu.com"}', 'email', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '{"sub":"550e8400-e29b-41d4-a716-446655440002","email":"sarah.committee@example.com"}', 'email', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '{"sub":"550e8400-e29b-41d4-a716-446655440003","email":"mike.member@example.com"}', 'email', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '{"sub":"550e8400-e29b-41d4-a716-446655440004","email":"jane.vendor@example.com"}', 'email', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '{"sub":"550e8400-e29b-41d4-a716-446655440005","email":"tom.viewer@example.com"}', 'email', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '{"sub":"550e8400-e29b-41d4-a716-446655440006","email":"alice.organizer@example.com"}', 'email', '550e8400-e29b-41d4-a716-446655440006', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', '{"sub":"550e8400-e29b-41d4-a716-446655440007","email":"bob.helper@example.com"}', 'email', '550e8400-e29b-41d4-a716-446655440007', NOW(), NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', '{"sub":"550e8400-e29b-41d4-a716-446655440008","email":"carol.caterer@example.com"}', 'email', '550e8400-e29b-41d4-a716-446655440008', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Now insert user profiles (these reference auth.users)
INSERT INTO public.users (id, email, name, phone, role, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@eventyangu.com', 'John Admin', '+254701234567', 'admin', NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'sarah.committee@example.com', 'Sarah Committee', '+254701234568', 'committee', NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'mike.member@example.com', 'Mike Member', '+254701234569', 'member', NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'jane.vendor@example.com', 'Jane Vendor', '+254701234570', 'vendor', NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'tom.viewer@example.com', 'Tom Viewer', '+254701234571', 'viewer', NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', 'alice.organizer@example.com', 'Alice Organizer', '+254701234572', 'admin', NOW()),
    ('550e8400-e29b-41d4-a716-446655440007', 'bob.helper@example.com', 'Bob Helper', '+254701234573', 'member', NOW()),
    ('550e8400-e29b-41d4-a716-446655440008', 'carol.caterer@example.com', 'Carol Caterer', '+254701234574', 'vendor', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample events
INSERT INTO public.events (id, name, type, description, start_date, end_date, location, join_code, created_by, is_active) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'Smith Family Wedding', 'wedding', 'Join us in celebrating the union of John and Jane Smith. A beautiful ceremony followed by reception.', '2026-06-15 14:00:00+00', '2026-06-15 23:00:00+00', 'Nairobi Safari Club, Nairobi', 'WED001', '550e8400-e29b-41d4-a716-446655440001', true),
    ('660e8400-e29b-41d4-a716-446655440002', 'Community Fundraiser for Education', 'fundraiser', 'Supporting local schools with educational materials and infrastructure improvements.', '2026-04-20 09:00:00+00', '2026-04-20 17:00:00+00', 'Mombasa Community Center, Mombasa', 'FUND01', '550e8400-e29b-41d4-a716-446655440006', true),
    ('660e8400-e29b-41d4-a716-446655440003', 'Memorial Service for Elder Johnson', 'burial', 'Celebrating the life and legacy of Elder Johnson, a pillar of our community.', '2026-03-10 10:00:00+00', '2026-03-10 16:00:00+00', 'St. Peters Church, Kisumu', 'MEM001', '550e8400-e29b-41d4-a716-446655440002', true),
    ('660e8400-e29b-41d4-a716-446655440004', 'Annual Company Retreat', 'corporate', 'Team building and strategic planning session for the upcoming year.', '2026-05-05 08:00:00+00', '2026-05-07 18:00:00+00', 'Lake Nakuru Lodge, Nakuru', 'CORP01', '550e8400-e29b-41d4-a716-446655440001', true),
    ('660e8400-e29b-41d4-a716-446655440005', 'Neighborhood Watch Meeting', 'meeting', 'Monthly community safety and security planning meeting.', '2026-03-25 19:00:00+00', '2026-03-25 21:00:00+00', 'Community Hall, Karen', 'MEET01', '550e8400-e29b-41d4-a716-446655440003', true)
ON CONFLICT (id) DO NOTHING;

-- Insert event members
INSERT INTO public.event_members (event_id, user_id, role, joined_at) VALUES
    -- Smith Family Wedding
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin', NOW()),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'committee', NOW()),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'member', NOW()),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007', 'member', NOW()),
    
    -- Community Fundraiser
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'admin', NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'committee', NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'member', NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'member', NOW()),
    
    -- Memorial Service
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'admin', NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'committee', NOW()),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', 'member', NOW()),
    
    -- Company Retreat
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'admin', NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'member', NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'member', NOW()),
    
    -- Neighborhood Meeting
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'admin', NOW()),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', 'member', NOW())
ON CONFLICT (event_id, user_id) DO NOTHING;

-- Insert committees
INSERT INTO public.committees (id, event_id, name, description) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Venue & Decoration', 'Responsible for venue setup, decoration, and ambiance'),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Catering & Refreshments', 'Manages all food and beverage arrangements'),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Photography & Entertainment', 'Handles photography, videography, and entertainment'),
    ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Fundraising Team', 'Coordinates fundraising activities and donor outreach'),
    ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Logistics Team', 'Manages event logistics and coordination'),
    ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', 'Memorial Arrangements', 'Coordinates memorial service arrangements')
ON CONFLICT (id) DO NOTHING;

-- Insert committee members
INSERT INTO public.committee_members (committee_id, user_id, role) VALUES
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'chair'),
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'member'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'chair'),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'chair'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 'chair'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'member'),
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'chair'),
    ('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'chair')
ON CONFLICT (committee_id, user_id) DO NOTHING;

-- Insert tasks
INSERT INTO public.tasks (id, event_id, committee_id, title, description, status, priority, due_date, created_by) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Book wedding venue', 'Reserve the main hall and confirm availability for the wedding date', 'completed', 5, '2026-03-01 17:00:00+00', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Order flowers and decorations', 'Contact florist and place order for bridal bouquet and venue decorations', 'in_progress', 4, '2026-04-15 12:00:00+00', '550e8400-e29b-41d4-a716-446655440002'),
    ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Finalize catering menu', 'Meet with caterer to finalize menu options and dietary requirements', 'pending', 5, '2026-04-30 15:00:00+00', '550e8400-e29b-41d4-a716-446655440007'),
    ('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'Hire photographer', 'Research and book professional photographer for the ceremony', 'in_progress', 4, '2026-05-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440003'),
    ('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', 'Create fundraising materials', 'Design flyers, brochures, and online content for fundraising campaign', 'completed', 3, '2026-03-15 16:00:00+00', '550e8400-e29b-41d4-a716-446655440006'),
    ('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', 'Coordinate with schools', 'Meet with school administrators to understand specific needs', 'pending', 5, '2026-04-10 14:00:00+00', '550e8400-e29b-41d4-a716-446655440003'),
    ('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440006', 'Prepare memorial program', 'Create order of service and memorial program booklets', 'in_progress', 4, '2026-03-08 12:00:00+00', '550e8400-e29b-41d4-a716-446655440002'),
    ('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440004', NULL, 'Book accommodation', 'Reserve rooms at the lodge for all team members', 'completed', 5, '2026-03-20 17:00:00+00', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440005', NULL, 'Prepare agenda', 'Create meeting agenda and distribute to all members', 'pending', 2, '2026-03-23 18:00:00+00', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Insert task assignments
INSERT INTO public.task_assignments (task_id, user_id, assigned_by) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006'),
    ('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006'),
    ('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006'),
    ('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
    ('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
    ('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (task_id, user_id) DO NOTHING;

-- Insert budgets
INSERT INTO public.budgets (id, event_id, total_budget, currency) VALUES
    ('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 500000.00, 'KES'),
    ('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 200000.00, 'KES'),
    ('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 150000.00, 'KES'),
    ('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004', 800000.00, 'KES')
ON CONFLICT (id) DO NOTHING;

-- Insert budget categories
INSERT INTO public.budget_categories (id, budget_id, name, allocated_amount, color) VALUES
    -- Wedding budget categories
    ('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'Venue & Decoration', 200000.00, '#3B82F6'),
    ('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 'Catering', 180000.00, '#10B981'),
    ('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', 'Photography', 80000.00, '#F59E0B'),
    ('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440001', 'Entertainment', 40000.00, '#EF4444'),
    
    -- Fundraiser budget categories
    ('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440002', 'Educational Materials', 120000.00, '#8B5CF6'),
    ('aa0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440002', 'Infrastructure', 60000.00, '#06B6D4'),
    ('aa0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440002', 'Event Costs', 20000.00, '#84CC16'),
    
    -- Memorial budget categories
    ('aa0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440003', 'Service Arrangements', 80000.00, '#6366F1'),
    ('aa0e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440003', 'Refreshments', 50000.00, '#EC4899'),
    ('aa0e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440003', 'Memorial Items', 20000.00, '#14B8A6'),
    
    -- Corporate retreat budget categories
    ('aa0e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440004', 'Accommodation', 400000.00, '#F97316'),
    ('aa0e8400-e29b-41d4-a716-446655440012', '990e8400-e29b-41d4-a716-446655440004', 'Meals & Catering', 250000.00, '#22C55E'),
    ('aa0e8400-e29b-41d4-a716-446655440013', '990e8400-e29b-41d4-a716-446655440004', 'Activities & Team Building', 100000.00, '#A855F7'),
    ('aa0e8400-e29b-41d4-a716-446655440014', '990e8400-e29b-41d4-a716-446655440004', 'Transportation', 50000.00, '#EAB308')
ON CONFLICT (id) DO NOTHING;

-- Insert sample expenses
INSERT INTO public.expenses (id, budget_id, category_id, description, amount, expense_date, added_by) VALUES
    ('bb0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'Venue booking deposit', 50000.00, '2026-02-15', '550e8400-e29b-41d4-a716-446655440001'),
    ('bb0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'Decoration materials', 25000.00, '2026-02-20', '550e8400-e29b-41d4-a716-446655440002'),
    ('bb0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440002', 'Catering advance payment', 60000.00, '2026-02-25', '550e8400-e29b-41d4-a716-446655440007'),
    ('bb0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440005', 'Textbooks purchase', 45000.00, '2026-03-01', '550e8400-e29b-41d4-a716-446655440006'),
    ('bb0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440007', 'Event venue rental', 15000.00, '2026-03-05', '550e8400-e29b-41d4-a716-446655440003'),
    ('bb0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440008', 'Church service fees', 30000.00, '2026-02-28', '550e8400-e29b-41d4-a716-446655440002'),
    ('bb0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440011', 'Lodge booking deposit', 200000.00, '2026-02-10', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert vendor profiles
INSERT INTO public.vendors (id, user_id, business_name, description, services, contact_email, contact_phone, website_url, is_verified) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Elegant Events Catering', 'Premium catering services for weddings, corporate events, and special occasions. We specialize in both local and international cuisine.', ARRAY['Wedding Catering', 'Corporate Catering', 'Event Planning', 'Buffet Services'], 'info@elegantevents.co.ke', '+254701234570', 'https://elegantevents.co.ke', true),
    ('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', 'Carol''s Kitchen', 'Affordable and delicious catering for community events, fundraisers, and family gatherings.', ARRAY['Community Catering', 'Traditional Cuisine', 'Baking Services', 'Event Coordination'], 'carol@carolskitchen.com', '+254701234574', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Insert vendor reviews
INSERT INTO public.vendor_reviews (vendor_id, reviewer_id, event_id, rating, comment) VALUES
    ('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 5, 'Excellent service! The food was amazing and the presentation was perfect for our wedding.'),
    ('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', 4, 'Great food quality and professional service. Would recommend for corporate events.'),
    ('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 5, 'Carol provided excellent catering for our fundraiser. Very affordable and delicious food!')
ON CONFLICT (vendor_id, reviewer_id, event_id) DO NOTHING;

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type, related_id, related_table) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', 'New Task Assignment', 'You have been assigned to task "Order flowers and decorations" in Smith Family Wedding', 'task', '880e8400-e29b-41d4-a716-446655440002', 'tasks'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Task Due Soon', 'Task "Hire photographer" is due in 2 days', 'task', '880e8400-e29b-41d4-a716-446655440004', 'tasks'),
    ('550e8400-e29b-41d4-a716-446655440007', 'Budget Update', 'New expense added to Wedding budget: Catering advance payment', 'budget', 'bb0e8400-e29b-41d4-a716-446655440003', 'expenses'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Event Announcement', 'Fundraiser event details have been updated', 'event', '660e8400-e29b-41d4-a716-446655440002', 'events'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Welcome to Event', 'You have successfully joined the Neighborhood Watch Meeting', 'event', '660e8400-e29b-41d4-a716-446655440005', 'events')
ON CONFLICT DO NOTHING;

-- Insert event profiles (for memorial service)
INSERT INTO public.event_profiles (event_id, honoree_name, biography, birth_date, memorial_date, tribute_message) VALUES
    ('660e8400-e29b-41d4-a716-446655440003', 'Elder Johnson Mwangi', 'Elder Johnson Mwangi was a beloved community leader, devoted family man, and pillar of faith. He served as a church elder for over 30 years and was instrumental in numerous community development projects. His wisdom, kindness, and unwavering commitment to helping others will be deeply missed.', '1945-08-15', '2026-03-05', 'A life well lived, a legacy that will endure. Elder Johnson touched countless lives with his generosity and wisdom.')
ON CONFLICT (event_id) DO NOTHING;

-- Update statistics (this would normally be done by triggers)
UPDATE public.vendors SET 
    rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.vendor_reviews WHERE vendor_id = vendors.id),
    total_reviews = (SELECT COUNT(*) FROM public.vendor_reviews WHERE vendor_id = vendors.id)
WHERE id IN ('cc0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440002');