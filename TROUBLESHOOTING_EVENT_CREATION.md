# Troubleshooting Event Creation

## Quick Diagnosis

If event creation is failing, follow these steps to identify and fix the issue:

### Step 1: Run the Test Script

```bash
npm install @supabase/supabase-js dotenv
node scripts/test-event-creation.js
```

This will test:
- ✅ Supabase connection
- ✅ User authentication
- ✅ RLS policies
- ✅ Event creation
- ✅ Member assignment
- ✅ Event retrieval

### Step 2: Apply Latest Migration

The latest migration `20260308000001_verify_event_creation.sql` fixes all known RLS issues.

**Option A: Using Supabase CLI (Recommended)**
```bash
npx supabase db push
```

**Option B: Manual Application**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20260308000001_verify_event_creation.sql`
4. Paste and run the SQL

### Step 3: Check Console Logs

The enhanced event service now provides detailed logging:

```
=== EVENT CREATION START ===
✓ User authenticated: <user-id>
✓ Input validation passed
✓ Join code generated: ABC123
Event insert data: {...}
✓ Event created successfully: <event-id>
✓ Creator added as event member: <member-id>
=== EVENT CREATION SUCCESS ===
```

If you see errors, they will include:
- Error message
- Error code
- Detailed hints
- Specific suggestions

## Common Issues and Solutions

### Issue 1: "Not authenticated" Error

**Symptoms:**
- Error message: "Not authenticated. Please sign in first."
- Console log: "No authenticated user found"

**Solution:**
1. Ensure user is logged in
2. Check if auth token is valid
3. Verify Supabase credentials in `.env`

```typescript
// Check auth status
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Issue 2: "Permission denied" Error (Code: 42501)

**Symptoms:**
- Error code: 42501
- Message: "new row violates row-level security policy"

**Solution:**
Apply the latest migration to fix RLS policies:

```bash
npx supabase db push
```

Or manually run `20260308000001_verify_event_creation.sql`

### Issue 3: Duplicate Join Code (Code: 23505)

**Symptoms:**
- Error code: 23505
- Message: "duplicate key value violates unique constraint"

**Solution:**
This is rare but can happen. The app will automatically retry with a new join code. If it persists:

```typescript
// The generateJoinCode function uses random generation
// Collision probability is ~1 in 2 billion
```

### Issue 4: Validation Errors

**Symptoms:**
- "Event name must be at least 3 characters"
- "Event type is required"
- "Location must be at least 2 characters"
- "Start date is required"

**Solution:**
Ensure all required fields are filled:

```typescript
{
  name: "My Event",        // Min 3 chars
  type: "wedding",         // Required
  location: "Nairobi",     // Min 2 chars
  startDate: new Date(),   // Required
  description: "..."       // Optional
}
```

### Issue 5: RLS Policy Error

**Symptoms:**
- Message contains "RLS" or "row-level security"
- Database security policy error

**Solution:**
1. Apply latest migration
2. Verify policies exist:

```sql
-- Check policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'event_members');
```

Expected policies:
- **events**: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- **event_members**: 4 policies (SELECT, INSERT, UPDATE, DELETE)

## Database Verification

### Check RLS Status

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'event_members');
```

Both should show `rowsecurity = true`

### Check Active Policies

```sql
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING clause exists'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK exists'
        ELSE 'No WITH CHECK'
    END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('events', 'event_members')
ORDER BY tablename, cmd;
```

### Test Event Creation Directly

```sql
-- Test as authenticated user
INSERT INTO public.events (
    name,
    type,
    description,
    start_date,
    location,
    join_code,
    created_by
) VALUES (
    'Test Event',
    'meeting',
    'Test description',
    NOW(),
    'Test Location',
    'TEST01',
    auth.uid()
) RETURNING *;
```

## Migration History

All migrations applied (in order):

1. `20240301000001_initial_schema.sql` - Initial database schema
2. `20240301000004_rls_policies.sql` - Initial RLS policies
3. `20260307000001_fix_events_rls_recursion.sql` - Fixed recursion
4. `20260307000002_comprehensive_rls_fix.sql` - Comprehensive fix
5. `20260307000004_proper_rls_policies.sql` - Proper policies
6. `20260307000006_fix_event_creation.sql` - Event creation fix
7. `20260308000001_verify_event_creation.sql` - **LATEST** - Verified fix

## Enhanced Error Messages

The updated event service provides specific error messages:

| Error Code | Message | Solution |
|------------|---------|----------|
| 42501 | Permission denied | Apply latest migration |
| 23505 | Duplicate join code | Retry (automatic) |
| PGRST116 | RLS policy error | Check RLS policies |
| - | Not authenticated | Sign in first |
| - | Validation error | Check input fields |

## Support

If issues persist after following this guide:

1. **Check console logs** - Look for detailed error messages
2. **Run test script** - `node scripts/test-event-creation.js`
3. **Verify migrations** - Ensure all migrations are applied
4. **Check Supabase Dashboard** - Look for errors in logs
5. **Review RLS policies** - Ensure policies are correct

## Success Indicators

When event creation works correctly, you should see:

✅ Event created in database
✅ Join code generated and displayed
✅ Creator added as admin member
✅ Event appears in "My Events" list
✅ Success alert with join code
✅ No errors in console

## Testing Checklist

- [ ] Supabase connection works
- [ ] User is authenticated
- [ ] RLS policies are applied
- [ ] Event can be created
- [ ] Member can be added
- [ ] Event can be retrieved
- [ ] Event appears in UI
- [ ] Join code is displayed
