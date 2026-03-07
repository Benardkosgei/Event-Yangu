# 🚀 Deployment & Testing Guide

## 📱 Sharing App for Testing

### **Option 1: Expo Go (Easiest for Testing)**

**For Local Network Testing:**
1. Make sure your `.env` uses your computer's IP:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://192.168.100.5:54321
   ```

2. Start Expo:
   ```bash
   npm start
   ```

3. Share with testers on **same WiFi network**:
   - They install Expo Go app
   - Scan your QR code
   - App connects to your local Supabase

**Limitations:**
- ❌ Testers must be on same network
- ❌ Your computer must be running
- ❌ Not suitable for external testers

### **Option 2: Expo Development Build (Better for Testing)**

**Setup:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Create development build
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

**For Testing:**
1. Build includes your local IP
2. Share APK/IPA with testers
3. They can test on their devices
4. Still connects to your local Supabase

**Limitations:**
- ❌ Still requires your computer running
- ❌ Testers need to be on your network or use VPN

### **Option 3: Cloud Supabase (Best for External Testing)**

**Setup Supabase Cloud:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to provision (~2 minutes)
4. Get your credentials from Settings > API

**Deploy Database:**
```bash
# Link to your cloud project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push

# Optional: Seed with test data
npx supabase db seed
```

**Update Environment:**
```env
# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

**Build for Testing:**
```bash
# Build with production environment
eas build --profile preview --platform android
```

**Share with Testers:**
- ✅ Works anywhere with internet
- ✅ No need for your computer running
- ✅ Professional testing experience
- ✅ Can share via TestFlight (iOS) or APK link (Android)

---

## 🌐 Production Deployment

### **Phase 1: Supabase Production Setup**

#### **1. Create Production Project**
```bash
# Go to supabase.com and create project
# Choose region closest to your users
# Note: Free tier includes:
# - 500MB database
# - 1GB file storage
# - 50,000 monthly active users
```

#### **2. Deploy Database Schema**
```bash
# Link to production
npx supabase link --project-ref your-prod-ref

# Push all migrations
npx supabase db push

# Verify migrations
npx supabase db remote commit
```

#### **3. Configure Production Settings**

**In Supabase Dashboard:**
- **Authentication** > **Settings**:
  - ✅ Enable email confirmations
  - ✅ Set up SMTP for emails
  - ✅ Configure redirect URLs
  - ✅ Set password requirements

- **Storage** > **Policies**:
  - ✅ Review and test RLS policies
  - ✅ Set up storage buckets
  - ✅ Configure CORS if needed

- **Database** > **Settings**:
  - ✅ Enable connection pooling
  - ✅ Set up backups
  - ✅ Configure extensions

#### **4. Deploy Edge Functions**
```bash
# Deploy all functions
npx supabase functions deploy create-user-profile
npx supabase functions deploy send-notification
npx supabase functions deploy generate-event-report

# Set environment variables
npx supabase secrets set SMTP_HOST=smtp.gmail.com
npx supabase secrets set SMTP_PORT=587
```

#### **5. Generate Production Types**
```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

### **Phase 2: Mobile App Production Build**

#### **1. Environment Configuration**

Create environment-specific files:

**`.env.development`** (Local):
```env
EXPO_PUBLIC_SUPABASE_URL=http://192.168.100.5:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=local-anon-key
EXPO_PUBLIC_ENV=development
```

**`.env.staging`** (Testing):
```env
EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
EXPO_PUBLIC_ENV=staging
```

**`.env.production`** (Live):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
EXPO_PUBLIC_ENV=production
```

#### **2. Configure EAS Build**

**`eas.json`**:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### **3. Build Production App**

**For Android:**
```bash
# Build production APK/AAB
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

**For iOS:**
```bash
# Build production IPA
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### **Phase 3: Testing Strategy**

#### **Development Testing**
```bash
# Local Supabase + Expo Go
npm start
```
- ✅ Fast iteration
- ✅ Hot reload
- ✅ Local database

#### **Staging Testing**
```bash
# Cloud Supabase + Development Build
eas build --profile preview
```
- ✅ Real backend
- ✅ External testers
- ✅ Production-like environment

#### **Production Testing**
```bash
# TestFlight (iOS) or Internal Testing (Android)
eas build --profile production
```
- ✅ Final validation
- ✅ Limited user group
- ✅ Real production environment

---

## 🔄 Environment Switching

### **Automatic Environment Detection**

Update `src/lib/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get environment from build config
const ENV = process.env.EXPO_PUBLIC_ENV || 'development';

// Environment-specific URLs
const SUPABASE_CONFIG = {
  development: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://192.168.100.5:54321',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'local-key',
  },
  staging: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://staging.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'staging-key',
  },
  production: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://prod.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'prod-key',
  },
};

const config = SUPABASE_CONFIG[ENV as keyof typeof SUPABASE_CONFIG];

console.log(`🚀 Running in ${ENV} mode`);
console.log(`📡 Supabase URL: ${config.url}`);

export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 📊 Monitoring & Analytics

### **Supabase Dashboard**
- Monitor API usage
- Track database performance
- View authentication metrics
- Check storage usage

### **Expo Analytics**
- Track app crashes
- Monitor performance
- View user engagement
- Analyze build metrics

### **Custom Analytics**
```typescript
// Add to your app
import * as Analytics from 'expo-firebase-analytics';

// Track events
Analytics.logEvent('user_login', {
  method: 'email',
  timestamp: new Date().toISOString(),
});
```

---

## 🔒 Security Checklist

### **Before Production:**
- [ ] Enable email confirmation
- [ ] Set up SMTP for emails
- [ ] Configure password requirements
- [ ] Review all RLS policies
- [ ] Test with different user roles
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Review API keys (never commit!)
- [ ] Enable 2FA for Supabase account
- [ ] Set up monitoring alerts
- [ ] Test error handling
- [ ] Implement proper logging
- [ ] Add crash reporting

---

## 💰 Cost Estimation

### **Supabase Free Tier:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth
- **Cost: $0/month**

### **Supabase Pro ($25/month):**
- 8GB database
- 100GB file storage
- 100,000 monthly active users
- 50GB bandwidth
- Daily backups
- Email support

### **Expo EAS:**
- Free tier: Limited builds
- Production: $29/month (unlimited builds)

### **App Store Fees:**
- Apple App Store: $99/year
- Google Play Store: $25 one-time

---

## 🚀 Quick Deployment Commands

```bash
# 1. Set up production Supabase
npx supabase link --project-ref your-ref
npx supabase db push

# 2. Build production app
eas build --platform all --profile production

# 3. Submit to stores
eas submit --platform ios
eas submit --platform android

# 4. Monitor deployment
eas build:list
```

---

## 📱 Testing Workflow Summary

| Stage | Environment | Supabase | Build Type | Testers |
|-------|-------------|----------|------------|---------|
| **Development** | Local | Local Docker | Expo Go | Developers only |
| **Internal Testing** | Staging | Cloud (Staging) | Development Build | Internal team |
| **Beta Testing** | Staging | Cloud (Staging) | Preview Build | Beta testers |
| **Production** | Production | Cloud (Production) | Production Build | All users |

---

**Need help with any step? Let me know!** 🚀