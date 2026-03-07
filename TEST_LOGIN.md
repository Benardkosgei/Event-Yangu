# 🧪 Test Login & Registration

## ✅ Authentication is Fully Integrated with Supabase!

Your app is now pulling real data from the Supabase database for login and registration.

## 🔐 How It Works

### **Login Flow:**
1. User enters email and password
2. `supabase.auth.signInWithPassword()` validates credentials against `auth.users` table
3. App fetches user profile from `public.users` table
4. Returns user data + JWT session token
5. Token stored securely in Expo SecureStore

### **Register Flow:**
1. User enters registration details
2. `supabase.auth.signUp()` creates user in `auth.users` table
3. App creates profile record in `public.users` table
4. Returns user data + JWT session token
5. User is automatically logged in

## 👥 Test Users (Ready to Use!)

All users have been set up with the password: **`password123`**

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@eventyangu.com | password123 | Admin | Full administrative access |
| sarah.committee@example.com | password123 | Committee | Committee management |
| mike.member@example.com | password123 | Member | Regular event member |
| jane.vendor@example.com | password123 | Vendor | Vendor marketplace |
| tom.viewer@example.com | password123 | Viewer | Read-only access |
| alice.organizer@example.com | password123 | Admin | Event organizer |
| bob.helper@example.com | password123 | Member | Task helper |
| carol.caterer@example.com | password123 | Vendor | Catering services |

## 🧪 Test Login

### **Option 1: Via Mobile App**

1. Start the app:
   ```bash
   npm start
   ```

2. Open in Expo Go or simulator

3. Try logging in with:
   - Email: `admin@eventyangu.com`
   - Password: `password123`

4. You should see:
   - ✅ Successful login
   - ✅ User profile loaded from database
   - ✅ Navigation to main app screens
   - ✅ User data displayed (name, role, etc.)

### **Option 2: Via API (cURL)**

Test the authentication endpoint directly:

```bash
curl -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@eventyangu.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "admin@eventyangu.com",
    ...
  }
}
```

### **Option 3: Via Supabase Studio**

1. Open Studio: http://127.0.0.1:54323
2. Go to **Authentication** > **Users**
3. You should see all 8 test users
4. Click on any user to see their details

## 🆕 Test Registration

### **Via Mobile App:**

1. Click "Register" or "Sign Up"
2. Fill in the form:
   - Email: `newuser@test.com`
   - Password: `password123`
   - Name: `Test User`
   - Phone: `+254700000000`
   - Role: `member`

3. Submit the form

4. Check what happens:
   - ✅ User created in `auth.users` table
   - ✅ Profile created in `public.users` table
   - ✅ User automatically logged in
   - ✅ Redirected to main app

### **Verify in Database:**

```sql
-- Check auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'newuser@test.com';

-- Check public.users
SELECT id, email, name, role 
FROM public.users 
WHERE email = 'newuser@test.com';
```

## 🔍 What Data is Being Pulled?

### **On Login:**
```typescript
// From auth.users table:
- User ID
- Email
- Email confirmation status
- Session token

// From public.users table:
- Name
- Phone
- Role (admin, committee, member, vendor, viewer)
- Avatar URL
- Created date
```

### **On Register:**
```typescript
// Creates in auth.users:
- Email
- Encrypted password
- Email confirmation

// Creates in public.users:
- User ID (same as auth.users)
- Email
- Name
- Phone
- Role
- Timestamps
```

## 🔒 Security Features Active

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **JWT Authentication** - Secure token-based auth
✅ **Password Hashing** - Bcrypt encryption
✅ **Email Confirmation** - Can be enabled for production
✅ **Session Management** - Automatic token refresh

## 🐛 Troubleshooting

### **Login Fails:**
1. Check Supabase is running: `npm run db:status`
2. Verify `.env` has correct URL and anon key
3. Check user exists: Query `auth.users` table
4. Verify password is correct: `password123`

### **Profile Not Loading:**
1. Check `public.users` table has matching user ID
2. Verify RLS policies allow access
3. Check network tab for API errors

### **Registration Fails:**
1. Check email doesn't already exist
2. Verify all required fields are provided
3. Check RLS policies allow insert
4. Look for constraint violations

## 📊 Monitor Authentication

### **View Active Sessions:**
```sql
SELECT 
    u.email,
    s.created_at as session_started,
    s.not_after as session_expires
FROM auth.sessions s
JOIN auth.users u ON s.user_id = u.id
ORDER BY s.created_at DESC;
```

### **View Recent Logins:**
```sql
SELECT 
    email,
    last_sign_in_at,
    sign_in_count
FROM auth.users
ORDER BY last_sign_in_at DESC NULLS LAST
LIMIT 10;
```

## ✅ Confirmation

Your authentication is **fully integrated** with Supabase:
- ✅ Real database queries
- ✅ Secure password hashing
- ✅ JWT token management
- ✅ Profile data synchronization
- ✅ Session persistence
- ✅ RLS security enabled

**Ready to test! 🚀**