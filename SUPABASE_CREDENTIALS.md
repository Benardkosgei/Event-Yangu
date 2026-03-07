# 🔑 Supabase Local Development Credentials

## 📋 Connection Details

### API Endpoints
```
API URL:        http://127.0.0.1:54321
GraphQL URL:    http://127.0.0.1:54321/graphql/v1
Storage URL:    http://127.0.0.1:54321/storage/v1/s3
Database URL:   postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL:     http://127.0.0.1:54323
Inbucket URL:   http://127.0.0.1:54324
```

### Authentication Keys

**Anon Key** (Public - Safe for client-side):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

**Service Role Key** (Secret - Server-side only):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**JWT Secret**:
```
super-secret-jwt-token-with-at-least-32-characters-long
```

### S3 Storage Credentials

```
Access Key:  625729a08b95bf1b7ff351a663f3a23c
Secret Key:  850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
Region:      local
```

## 📱 Mobile App Configuration

Your `.env` file should contain:

```env
# Supabase Configuration (Local Development)
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## 🗄️ Database Access

### Direct PostgreSQL Connection

```bash
# Using psql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Using connection string in tools
Host:     127.0.0.1
Port:     54322
Database: postgres
Username: postgres
Password: postgres
```

### Via Supabase Studio
Open: http://127.0.0.1:54323

## 👥 Test User Accounts

All test users have the password: `password123`

| Email | Role | Description |
|-------|------|-------------|
| admin@eventyangu.com | Admin | Full administrative access |
| sarah.committee@example.com | Committee | Committee management |
| mike.member@example.com | Member | Regular event member |
| jane.vendor@example.com | Vendor | Vendor marketplace access |
| tom.viewer@example.com | Viewer | Read-only access |
| alice.organizer@example.com | Admin | Event organizer |
| bob.helper@example.com | Member | Task helper |
| carol.caterer@example.com | Vendor | Catering vendor |

## 📧 Email Testing

Access Inbucket at: http://127.0.0.1:54324

All emails sent by the app (password resets, notifications, etc.) will appear here instead of being sent to real email addresses.

## 🔐 Security Notes

### ⚠️ Important

1. **These are LOCAL DEVELOPMENT credentials only**
2. **Never commit these to version control** (already in .gitignore)
3. **Never use these in production**
4. **Service role key bypasses RLS** - use with caution

### Production Setup

When deploying to production:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your production credentials from Settings > API
3. Update `.env` with production values
4. Use environment-specific configuration

```env
# Production .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## 🧪 Testing API Calls

### Using cURL

```bash
# Get events (requires authentication)
curl -X GET 'http://127.0.0.1:54321/rest/v1/events' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN"

# Get public data (no auth needed)
curl -X GET 'http://127.0.0.1:54321/rest/v1/event_tags' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
```

### Using Postman/Insomnia

**Base URL**: `http://127.0.0.1:54321`

**Headers**:
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
Authorization: Bearer <user-jwt-token>
Content-Type: application/json
```

## 🔄 Regenerating Credentials

If you need to regenerate local credentials:

```bash
# Stop Supabase
npm run db:stop

# Remove local data
docker volume rm supabase_db_event-yangu

# Start fresh
npm run db:start
```

**Note**: This will give you new credentials and reset all data.

## 📊 Monitoring

### Check Service Status
```bash
npm run db:status
```

### View Logs
```bash
npx supabase logs
```

### Database Logs
```bash
npx supabase db logs
```

## 🆘 Troubleshooting

### Can't Connect to API
1. Check Supabase is running: `npm run db:status`
2. Verify URL in `.env` matches: `http://127.0.0.1:54321`
3. Check anon key is correct
4. Restart Supabase: `npm run db:stop && npm run db:start`

### Authentication Errors
1. Verify you're using the correct anon key
2. Check JWT token hasn't expired
3. Ensure RLS policies allow the operation
4. Test with service role key (bypasses RLS)

### Database Connection Issues
1. Check port 54322 is not in use
2. Verify Docker is running
3. Check database logs: `npx supabase db logs`

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **API Reference**: https://supabase.com/docs/reference/javascript
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide**: https://supabase.com/docs/guides/storage

---

**Keep these credentials secure and never commit them to public repositories!** 🔒