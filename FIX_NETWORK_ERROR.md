# 🔧 Fix Network Request Failed Error

## ❌ Problem
```
ERROR [TypeError: Network request failed]
```

This happens because mobile devices can't connect to `http://127.0.0.1:54321` (localhost).

## ✅ Solution

### **Step 1: Update .env File**

Your `.env` has been updated to use your computer's IP address:

```env
# OLD (doesn't work on mobile)
# EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# NEW (works on mobile)
EXPO_PUBLIC_SUPABASE_URL=http://192.168.100.5:54321
```

### **Step 2: Restart Expo**

1. Stop the current Expo server (Ctrl+C)
2. Clear cache and restart:
   ```bash
   npx expo start --clear
   ```

### **Step 3: Reconnect Your Device**

- Scan the QR code again
- Or press `r` to reload the app

## 🧪 Test It

Try logging in again:
- Email: `admin@eventyangu.com`
- Password: `password123`

Should work now! ✅

---

## 🌐 Different Scenarios

### **Testing on Physical Device (Same WiFi)**
```env
EXPO_PUBLIC_SUPABASE_URL=http://192.168.100.5:54321
```
✅ Works when device is on same network

### **Testing on Web Browser**
```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```
✅ Works for web only

### **Testing on Android Emulator**
```env
EXPO_PUBLIC_SUPABASE_URL=http://10.0.2.2:54321
```
✅ Special IP for Android emulator

### **Testing on iOS Simulator**
```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
```
✅ Localhost works on iOS simulator

### **External Testing (Not on Same Network)**
You need cloud Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```
✅ Works anywhere with internet

---

## 🔍 How to Find Your IP Address

### **Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### **Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### **Quick Check:**
Your current IP is: **192.168.100.5**

---

## 🚨 Troubleshooting

### **Still Getting Network Error?**

1. **Check Supabase is Running:**
   ```bash
   npm run db:status
   ```

2. **Check Firewall:**
   - Windows Firewall might block port 54321
   - Allow Node.js through firewall

3. **Verify IP Address:**
   ```bash
   ipconfig
   ```
   Make sure it matches your `.env`

4. **Check Same Network:**
   - Phone and computer must be on same WiFi
   - Corporate networks might block connections

5. **Try Different Port:**
   If 54321 is blocked, you can change it in `supabase/config.toml`

### **Connection Refused?**

Make sure Supabase is accessible:
```bash
# Test from your computer
curl http://192.168.100.5:54321/rest/v1/

# Should return API info
```

### **Timeout Error?**

- Check your WiFi connection
- Restart Supabase: `npm run db:stop && npm run db:start`
- Restart your router if needed

---

## 📱 Platform-Specific Solutions

### **Expo Go on Physical Device:**
```env
EXPO_PUBLIC_SUPABASE_URL=http://192.168.100.5:54321
```

### **Android Emulator:**
```env
EXPO_PUBLIC_SUPABASE_URL=http://10.0.2.2:54321
```

### **iOS Simulator:**
```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
```

### **Web Browser:**
```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
```

---

## ✅ Verification

After fixing, you should see:
1. ✅ App loads without network error
2. ✅ Login screen appears
3. ✅ Can enter credentials
4. ✅ Login succeeds
5. ✅ User data loads from database

---

**Your .env is now configured correctly! Restart Expo and try again.** 🚀