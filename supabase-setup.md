# Supabase Setup Guide for Event Yangu

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `event-yangu`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Set up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database-schema.sql`
3. Click "Run" to execute the schema

## 3. Configure Row Level Security (RLS)

Add these RLS policies in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Event policies
CREATE POLICY "Users can view events they're members of" ON events
  FOR SELECT USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM event_members 
      WHERE event_id = events.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Event creators can update their events" ON events
  FOR UPDATE USING (auth.uid() = created_by);

-- Event members policies
CREATE POLICY "Users can view event members for their events" ON event_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_id AND (
        created_by = auth.uid() OR 
        EXISTS (SELECT 1 FROM event_members em WHERE em.event_id = events.id AND em.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Event creators can manage members" ON event_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can join events" ON event_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Committee policies
CREATE POLICY "Users can view committees for their events" ON committees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members 
      WHERE event_id = committees.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Event members can create committees" ON committees
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_members 
      WHERE event_id = committees.event_id AND user_id = auth.uid()
    )
  );

-- Task policies
CREATE POLICY "Users can view tasks for their events" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members 
      WHERE event_id = tasks.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Event members can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM event_members 
      WHERE event_id = tasks.event_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Task creators and assignees can update tasks" ON tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM task_assignments 
      WHERE task_id = tasks.id AND user_id = auth.uid()
    )
  );

-- Budget policies
CREATE POLICY "Users can view budgets for their events" ON budgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_members 
      WHERE event_id = budgets.event_id AND user_id = auth.uid()
    )
  );

-- Vendor policies
CREATE POLICY "Anyone can view vendors" ON vendors
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own vendor profile" ON vendors
  FOR ALL USING (auth.uid() = user_id);

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

## 4. Configure Authentication

1. Go to Authentication > Settings in Supabase dashboard
2. Configure email settings:
   - Enable "Enable email confirmations"
   - Set up SMTP (optional, for custom emails)
3. Configure providers if needed (Google, GitHub, etc.)

## 5. Get Project Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon public key

## 6. Configure Environment Variables

1. Create a `.env` file in your project root:
```bash
cp .env.example .env
```

2. Fill in your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 7. Install Dependencies

```bash
npm install
```

## 8. Test the Integration

1. Start your Expo development server:
```bash
npm start
```

2. Test user registration and login
3. Create a test event
4. Verify data is being stored in Supabase

## 9. Optional: Set up Storage (for images)

1. Go to Storage in Supabase dashboard
2. Create buckets for:
   - `avatars` (user profile pictures)
   - `event-media` (event photos/videos)
   - `vendor-portfolio` (vendor portfolio images)

3. Set up storage policies:
```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view all avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

## 10. Production Considerations

- Set up proper backup policies
- Configure database connection pooling
- Set up monitoring and alerts
- Consider implementing database functions for complex operations
- Set up proper logging

## Troubleshooting

### Common Issues:

1. **RLS Policies**: Make sure all tables have proper RLS policies
2. **Authentication**: Verify JWT secret is correctly configured
3. **CORS**: Ensure your app domain is added to allowed origins
4. **Rate Limiting**: Check if you're hitting API rate limits

### Useful SQL Queries for Testing:

```sql
-- Check if user exists
SELECT * FROM auth.users WHERE email = 'test@example.com';

-- View all events for a user
SELECT e.*, em.role 
FROM events e
JOIN event_members em ON e.id = em.event_id
WHERE em.user_id = 'user-uuid-here';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'events';
```

## Next Steps

1. Test all functionality thoroughly
2. Set up proper error handling and logging
3. Implement offline support with local caching
4. Add push notifications
5. Set up CI/CD pipeline for database migrations