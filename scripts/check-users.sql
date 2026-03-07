-- Check if users exist in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'admin@eventyangu.com';

-- Check if user profile exists
SELECT id, email, name, role 
FROM public.users 
WHERE email = 'admin@eventyangu.com';
