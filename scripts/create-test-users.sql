-- Create Test Users with Proper Authentication
-- Run this in Supabase SQL Editor or via psql

-- Note: This uses Supabase's auth.users table
-- The password for all users will be: password123

-- First, let's use Supabase's built-in function to create users
-- You'll need to run these one by one in the Supabase Studio SQL Editor

-- User 1: Admin
SELECT auth.uid();

-- Since we can't directly insert into auth.users with proper password hashing,
-- we need to use the Supabase Auth API or create users through the app

-- Alternative: Update existing auth users with a known password hash
-- Password: password123
-- Hash: $2a$10$rHEjfFnCw8qF8qF8qF8qFOKqF8qF8qF8qF8qF8qF8qF8qF8qF8qF8

-- This is a bcrypt hash for 'password123'
UPDATE auth.users 
SET encrypted_password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email IN (
    'admin@eventyangu.com',
    'sarah.committee@example.com',
    'mike.member@example.com',
    'jane.vendor@example.com',
    'tom.viewer@example.com',
    'alice.organizer@example.com',
    'bob.helper@example.com',
    'carol.caterer@example.com'
);

-- Confirm all users are email confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmation_token = '',
    confirmed_at = NOW()
WHERE email IN (
    'admin@eventyangu.com',
    'sarah.committee@example.com',
    'mike.member@example.com',
    'jane.vendor@example.com',
    'tom.viewer@example.com',
    'alice.organizer@example.com',
    'bob.helper@example.com',
    'carol.caterer@example.com'
);

-- Verify users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE '%@eventyangu.com' OR email LIKE '%@example.com'
ORDER BY email;