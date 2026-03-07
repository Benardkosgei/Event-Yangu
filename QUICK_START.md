# 🚀 Event Yangu - Quick Start Guide

## ✅ Setup Complete!

Your Supabase backend is now running locally with all migrations and seed data applied.

## 📊 Access Your Services

- **Supabase Studio**: http://127.0.0.1:54323
- **API URL**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Email Testing**: http://127.0.0.1:54324

## 👥 Test Users (Password: `password123` for all)

| Email | Role | Use Case |
|-------|------|----------|
| admin@eventyangu.com | Admin | Full access to all features |
| sarah.committee@example.com | Committee | Committee management |
| mike.member@example.com | Member | Regular event member |
| jane.vendor@example.com | Vendor | Vendor marketplace |
| alice.organizer@example.com | Admin | Event organizer |
| bob.helper@example.com | Member | Task helper |

## 🎯 Sample Data Included

- **5 Events**: Wedding, Fundraiser, Memorial, Corporate Retreat, Meeting
- **6 Committees**: Various event committees
- **9 Tasks**: With different statuses
- **4 Budgets**: With categories and expenses
- **2 Vendors**: With reviews
- **5 Notifications**: Sample notifications

## 🚀 Start the Mobile App

```bash
# Install dependencies (if not done)
npm install

# Start Expo
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web
- Scan QR code with Expo Go app

## 🔑 Login to Test

1. Open the app
2. Use any test user email (e.g., `admin@eventyangu.com`)
3. Password: `password123`
4. Explore the features!

## 📱 Features to Test

### Events
- ✅ View existing events
- ✅ Create new event
- ✅ Join event with code (try: `WED001`, `FUND01`, `MEM001`)
- ✅ View event details

### Tasks
- ✅ View tasks for events
- ✅ Update task status
- ✅ Create new tasks
- ✅ Assign tasks to members

### Budget
- ✅ View budget overview
- ✅ Add expenses
- ✅ Track spending by category
- ✅ View expense history

### Vendors
- ✅ Browse vendor marketplace
- ✅ View vendor profiles
- ✅ Read reviews
- ✅ Create vendor profile (if vendor role)

### Real-time Features
- ✅ Live task updates
- ✅ Real-time notifications
- ✅ Committee member changes

## 🛠️ Development Commands

```bash
# Supabase
npm run db:status      # Check Supabase status
npm run db:stop        # Stop Supabase
npm run db:start       # Start Supabase
npm run db:reset       # Reset database with fresh data
npm run db:types       # Regenerate TypeScript types

# App
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run in browser
```

## 🔍 Explore the Database

Open Supabase Studio: http://127.0.0.1:54323

- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users
- **Storage**: View uploaded files
- **Database**: See schema and relationships

## 📊 Sample Queries to Try

```sql
-- View all events with member count
SELECT 
    e.*,
    COUNT(em.id) as member_count
FROM events e
LEFT JOIN event_members em ON e.id = em.event_id
GROUP BY e.id;

-- View tasks by status
SELECT 
    status,
    COUNT(*) as count
FROM tasks
GROUP BY status;

-- View budget utilization
SELECT 
    e.name as event_name,
    b.total_budget,
    COALESCE(SUM(ex.amount), 0) as total_spent,
    b.total_budget - COALESCE(SUM(ex.amount), 0) as remaining
FROM events e
JOIN budgets b ON e.id = b.event_id
LEFT JOIN budget_categories bc ON b.id = bc.budget_id
LEFT JOIN expenses ex ON bc.id = ex.category_id
GROUP BY e.id, e.name, b.total_budget;
```

## 🐛 Troubleshooting

### App won't connect to Supabase
- Check Supabase is running: `npm run db:status`
- Verify `.env` file has correct URL and key
- Restart Expo: `npm start`

### Database errors
- Reset database: `npm run db:reset`
- Check logs: `npx supabase logs`

### Port conflicts
- Stop Supabase: `npm run db:stop`
- Start again: `npm run db:start`

## 🌐 Deploy to Production

When ready to deploy:

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Link project**: `npx supabase link --project-ref your-ref`
3. **Deploy migrations**: `npx supabase db push`
4. **Update .env** with production credentials
5. **Build app**: Follow Expo build guide

## 📚 Next Steps

- [ ] Customize the app UI
- [ ] Add more features
- [ ] Set up push notifications
- [ ] Configure file uploads
- [ ] Add analytics
- [ ] Deploy to app stores

## 💡 Tips

- Use Supabase Studio to explore data visually
- Check real-time updates by opening app on multiple devices
- Test RLS policies by logging in as different users
- Monitor API calls in the Network tab

## 🆘 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Expo Docs**: https://docs.expo.dev
- **React Navigation**: https://reactnavigation.org

---

**Happy coding! 🎉**