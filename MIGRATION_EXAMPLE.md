# 🚀 Migration Example - Event Features

This document demonstrates how to create and run a database migration in Event Yangu.

## ✅ Migration Applied Successfully!

**Migration File**: `supabase/migrations/20260302170057_add_event_features.sql`

## 🆕 New Features Added

### 1. **RSVP System**
Track event attendance with RSVP functionality.

**New Table**: `event_rsvps`
- RSVP status (pending, accepted, declined, maybe)
- Response messages
- Automatic timestamp tracking
- Capacity checking

**Features**:
- ✅ Users can RSVP to events
- ✅ Track attendance statistics
- ✅ Automatic capacity enforcement
- ✅ Real-time RSVP updates
- ✅ Response rate calculation

### 2. **Event Tags**
Categorize and filter events with tags.

**New Tables**:
- `event_tags` - Tag definitions
- `event_tag_assignments` - Event-tag relationships

**Default Tags**:
- Urgent (Red)
- Outdoor (Green)
- Virtual (Blue)
- Family-Friendly (Orange)
- Formal (Indigo)
- Casual (Purple)
- Fundraising (Pink)
- Networking (Teal)

### 3. **Enhanced Event Model**
New columns added to `events` table:
- `max_attendees` - Capacity limit
- `is_public` - Public visibility
- `requires_rsvp` - RSVP requirement
- `rsvp_deadline` - RSVP cutoff date
- `cover_image_url` - Event cover image
- `event_url_slug` - SEO-friendly URL

## 📊 New Database Functions

### `get_event_attendance_stats(event_id)`
Returns attendance statistics:
```sql
SELECT * FROM get_event_attendance_stats('event-uuid-here');
```

Returns:
- total_invited
- accepted
- declined
- maybe
- pending
- response_rate

### `check_event_capacity()`
Automatically prevents accepting RSVPs when event is full.

### `update_rsvp_responded_at()`
Automatically updates response timestamp when status changes.

## 🔒 Security (RLS Policies)

**event_rsvps**:
- Users can view RSVPs for their events
- Users can manage their own RSVPs
- Event admins can manage all RSVPs

**event_tags**:
- Anyone can view tags
- Authenticated users can create tags

**event_tag_assignments**:
- Users can view tags for their events
- Event admins can manage tag assignments

## 🛠️ How to Use

### RSVP Service

```typescript
import { rsvpService } from './src/services/rsvp.service';

// Get RSVPs for an event
const rsvps = await rsvpService.getRsvpsForEvent(eventId);

// Respond to RSVP
await rsvpService.respondToRsvp(eventId, 'accepted', 'Looking forward to it!');

// Get attendance stats
const stats = await rsvpService.getAttendanceStats(eventId);
console.log(`Response rate: ${stats.responseRate}%`);

// Invite users
await rsvpService.inviteUsers(eventId, [userId1, userId2]);

// Subscribe to real-time updates
const unsubscribe = rsvpService.subscribeToRsvpUpdates(eventId, (rsvp) => {
  console.log('RSVP updated:', rsvp);
});
```

### Tag Service

```typescript
import { tagService } from './src/services/tag.service';

// Get all tags
const tags = await tagService.getAllTags();

// Create custom tag
const newTag = await tagService.createTag({
  name: 'VIP',
  color: '#FFD700',
  description: 'VIP exclusive events'
});

// Assign tag to event
await tagService.assignTagToEvent(eventId, tagId);

// Get event tags
const eventTags = await tagService.getEventTags(eventId);

// Search events by tag
const events = await tagService.searchEventsByTag(tagId);
```

## 📝 Migration Process

### 1. Create Migration File
```bash
# Windows
Get-Date -Format "yyyyMMddHHmmss"
# Creates: 20260302170057

# Create file: supabase/migrations/20260302170057_add_event_features.sql
```

### 2. Write Migration SQL
- Add new tables
- Add columns to existing tables
- Create indexes
- Add constraints
- Create functions and triggers
- Set up RLS policies
- Insert seed data

### 3. Apply Migration
```bash
# Stop and restart Supabase to apply new migration
npx supabase stop
npx supabase start
```

### 4. Generate TypeScript Types
```bash
npm run db:types
```

### 5. Create Service Layer
- Create service files for new features
- Add TypeScript interfaces
- Implement CRUD operations
- Add real-time subscriptions

## 🧪 Testing the Migration

### Test RSVP System

1. **Open Supabase Studio**: http://127.0.0.1:54323
2. **Go to Table Editor** → `event_rsvps`
3. **Insert test RSVP**:
```sql
INSERT INTO event_rsvps (event_id, user_id, status)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440003',
  'accepted'
);
```

4. **Check attendance stats**:
```sql
SELECT * FROM get_event_attendance_stats('660e8400-e29b-41d4-a716-446655440001');
```

### Test Event Tags

1. **View default tags**:
```sql
SELECT * FROM event_tags;
```

2. **Assign tag to event**:
```sql
INSERT INTO event_tag_assignments (event_id, tag_id)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM event_tags WHERE name = 'Formal')
);
```

3. **Query events with tags**:
```sql
SELECT 
  e.*,
  array_agg(et.name) as tags
FROM events e
LEFT JOIN event_tag_assignments eta ON e.id = eta.event_id
LEFT JOIN event_tags et ON eta.tag_id = et.id
GROUP BY e.id;
```

## 🔄 Rollback (If Needed)

To rollback this migration, create a new migration:

```sql
-- Migration: rollback_event_features.sql

-- Drop tables
DROP TABLE IF EXISTS public.event_tag_assignments CASCADE;
DROP TABLE IF EXISTS public.event_tags CASCADE;
DROP TABLE IF EXISTS public.event_rsvps CASCADE;

-- Remove columns from events
ALTER TABLE public.events 
  DROP COLUMN IF EXISTS max_attendees,
  DROP COLUMN IF EXISTS is_public,
  DROP COLUMN IF EXISTS requires_rsvp,
  DROP COLUMN IF EXISTS rsvp_deadline,
  DROP COLUMN IF EXISTS cover_image_url,
  DROP COLUMN IF EXISTS event_url_slug;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_event_attendance_stats CASCADE;
DROP FUNCTION IF EXISTS public.check_event_capacity CASCADE;
DROP FUNCTION IF EXISTS public.update_rsvp_responded_at CASCADE;

-- Drop types
DROP TYPE IF EXISTS rsvp_status CASCADE;
```

## 📈 Next Steps

1. **Update Mobile UI** to show RSVP options
2. **Add tag filtering** to event list
3. **Show attendance stats** on event details
4. **Implement capacity warnings** in UI
5. **Add RSVP notifications**
6. **Create tag management screen**

## 💡 Best Practices Demonstrated

✅ **Versioned migrations** with timestamps
✅ **Comprehensive constraints** for data integrity
✅ **Performance indexes** on foreign keys
✅ **RLS policies** for security
✅ **Database functions** for complex logic
✅ **Triggers** for automation
✅ **Comments** for documentation
✅ **Default data** for immediate use
✅ **Service layer** abstraction
✅ **TypeScript types** generation

---

**Migration completed successfully! 🎉**