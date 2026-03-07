# Authentication Quick Reference

Quick guide for working with the improved authentication system.

## Common Tasks

### 1. Login User

```typescript
import { useAuthStore } from '../store/authStore';

const { login, isLoading } = useAuthStore();

try {
  await login(email, password);
  // User is now authenticated
} catch (error) {
  // Handle error - see error codes below
}
```

### 2. Register User

```typescript
import { useAuthStore } from '../store/authStore';

const { register, isLoading } = useAuthStore();

try {
  await register(email, password, name, phone, role);
  // User is now registered and authenticated
} catch (error) {
  // Handle error
}
```

### 3. Logout User

```typescript
import { useAuthStore } from '../store/authStore';

const { logout } = useAuthStore();

try {
  await logout();
  // User is now logged out
} catch (error) {
  // Handle error
}
```

### 4. Reset Password

```typescript
import { useAuthStore } from '../store/authStore';

const { resetPassword } = useAuthStore();

// Step 1: Request reset email
try {
  await resetPassword(email);
  // Email sent with reset link
} catch (error) {
  // Handle error
}

// Step 2: User clicks link and enters new password
const { updatePassword } = useAuthStore();

try {
  await updatePassword(newPassword);
  // Password updated
} catch (error) {
  // Handle error
}
```

### 5. Update Profile

```typescript
import { useAuthStore } from '../store/authStore';

const { updateProfile } = useAuthStore();

try {
  await updateProfile({ name: 'New Name', phone: '+1234567890' });
  // Profile updated
} catch (error) {
  // Handle error
}
```

### 6. Check Authentication Status

```typescript
import { useAuthStore } from '../store/authStore';

const { isAuthenticated, user, isInitialized } = useAuthStore();

if (!isInitialized) {
  // Still loading
  return <LoadingScreen />;
}

if (!isAuthenticated) {
  // Show login screen
  return <LoginScreen />;
}

// User is authenticated
return <MainApp user={user} />;
```

### 7. Handle Session Expiry

```typescript
import { useAuthStore } from '../store/authStore';

const { sessionExpired, clearSessionExpired } = useAuthStore();

// SessionExpiredModal component handles this automatically
// But you can also check manually:
if (sessionExpired) {
  // Show message or redirect to login
  clearSessionExpired();
}
```

---

## Error Codes

### Login Errors

| Code | Message | Action |
|------|---------|--------|
| `INVALID_CREDENTIALS` | Invalid email or password | Ask user to check credentials |
| `EMAIL_NOT_CONFIRMED` | Email not confirmed | Ask user to check email |
| `USER_NOT_FOUND` | No account found | Suggest registration |
| `PROFILE_NOT_FOUND` | Profile not found | Contact support |
| `NETWORK_ERROR` | Network error | Check connection |
| `RATE_LIMITED` | Too many attempts | Wait 15 minutes |
| `SESSION_EXPIRED` | Session expired | Re-login required |

### Registration Errors

| Code | Message | Action |
|------|---------|--------|
| `EMAIL_EXISTS` | Email already registered | Suggest login |
| `WEAK_PASSWORD` | Password too weak | Show requirements |
| `REGISTRATION_FAILED` | Registration failed | Try again |
| `NETWORK_ERROR` | Network error | Check connection |

---

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- Special characters recommended but not required

### Password Strength Levels

- **Weak**: 0-2 criteria met (red)
- **Medium**: 3-4 criteria met (orange)
- **Strong**: 5-6 criteria met (green)

---

## Validation Rules

### Email
```typescript
validation.email(email)
// Returns: null if valid, error message if invalid
// Format: standard email format (user@domain.com)
```

### Password
```typescript
validation.password(password)
// Returns: null if valid, error message if invalid
// Requirements: 8+ chars, uppercase, lowercase, number
```

### Name
```typescript
validation.name(name)
// Returns: null if valid, error message if invalid
// Requirements: 2+ characters
```

### Phone
```typescript
validation.phone(phone)
// Returns: null if valid, error message if invalid
// Requirements: 10-15 digits, optional country code
// Note: Phone is optional, returns null for empty string
```

---

## API Integration

### Making Authenticated Requests

```typescript
import { api } from '../services/api';

// Token is automatically added to headers
const response = await api.get('/endpoint');

// On 401 error, token is automatically refreshed
// If refresh fails, user is logged out
```

### Manual Token Access

```typescript
import { getAuthToken } from '../services/api';

const token = await getAuthToken();
// Returns: access_token from Supabase session or null
```

---

## Database Functions

### Check Rate Limit

```sql
SELECT public.check_rate_limit('user@example.com', '192.168.1.1');
-- Returns: true if allowed, false if rate limited
```

### Record Login Attempt

```sql
SELECT public.record_login_attempt('user@example.com', '192.168.1.1', true);
-- Records attempt and cleans up old records
```

---

## Navigation

### Auth Screens

- `Splash` - Initial loading screen
- `Welcome` - Welcome/onboarding screen
- `Login` - Login form
- `Register` - Registration form (step 1)
- `RoleSelection` - Role selection (step 2)
- `ForgotPassword` - Password reset request
- `ResetPassword` - New password entry

### Navigation Example

```typescript
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const navigation = useNavigation<NavigationProp>();

// Navigate to forgot password
navigation.navigate('ForgotPassword');

// Navigate to login
navigation.navigate('Login');
```

---

## Components

### PasswordStrengthIndicator

```typescript
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';

<PasswordStrengthIndicator password={password} />
// Shows visual strength indicator and feedback
```

### SessionExpiredModal

```typescript
import { SessionExpiredModal } from '../components/SessionExpiredModal';

// Add to root navigator (already done)
<SessionExpiredModal />
// Automatically shows when session expires
```

---

## Utilities

### Parse Auth Error

```typescript
import { parseAuthError } from '../utils/authErrors';

try {
  await login(email, password);
} catch (error) {
  const { title, message, code } = parseAuthError(error);
  Alert.alert(title, message);
}
```

### Get Password Strength

```typescript
import { getPasswordStrength } from '../utils/authErrors';

const { strength, score, feedback } = getPasswordStrength(password);
// strength: 'weak' | 'medium' | 'strong'
// score: 0-6
// feedback: string[] of suggestions
```

---

## Testing

### Test Users

Create test users with:
```bash
supabase db reset
# This runs seed.sql which creates test users
```

Default test credentials:
- Email: `admin@eventyangu.com`
- Password: `password123` (update to meet new requirements)

### Test Login

```bash
node scripts/test-login.js
```

---

## Troubleshooting

### "Profile not found" error
- Check RLS policies are applied
- Verify migration ran successfully
- Check user exists in both auth.users and public.users

### "Session expired" keeps appearing
- Check token refresh is working
- Verify Supabase URL and keys are correct
- Check network connectivity

### "Rate limited" error
- Wait 15 minutes
- Check login_attempts table
- Clear old attempts if needed

### Registration fails silently
- Check console for errors
- Verify RLS INSERT policy exists
- Check database trigger is active

---

## Best Practices

1. **Always handle errors**: Use try-catch and parseAuthError()
2. **Show loading states**: Use isLoading from auth store
3. **Validate before submit**: Use validation utilities
4. **Clear sensitive data**: Don't log passwords or tokens
5. **Test error scenarios**: Network errors, invalid input, etc.
6. **Use TypeScript types**: Import from navigation/types
7. **Check authentication**: Use isAuthenticated and isInitialized
8. **Handle session expiry**: SessionExpiredModal does this automatically

---

## Migration Checklist

When deploying to production:

- [ ] Update Supabase config for production
- [ ] Enable email confirmations
- [ ] Set up email templates
- [ ] Configure password reset redirect URL
- [ ] Test all auth flows
- [ ] Set up monitoring for failed logins
- [ ] Configure rate limiting alerts
- [ ] Set up scheduled cleanup job for orphaned users
- [ ] Update environment variables
- [ ] Test on production database

---

## Support

For issues:
1. Check console logs
2. Verify Supabase connection
3. Check migration status: `supabase migration list`
4. Review AUTH_IMPROVEMENTS.md for detailed info
5. Check Supabase dashboard for auth logs
