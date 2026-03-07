# Event Yangu - Event Management App

A comprehensive React Native/Expo application for managing events, committees, tasks, budgets, and vendor services. Built with Supabase backend integration for real-time collaboration.

## Features

### 🎉 Event Management
- Create and manage various event types (weddings, burials, fundraisers, meetings, etc.)
- Join events using unique codes
- Real-time event updates
- Event profiles with media support

### 👥 Committee Organization
- Create and manage event committees
- Assign members to committees
- Role-based permissions

### ✅ Task Management
- Create, assign, and track tasks
- Task status updates (pending, in progress, completed)
- Due date tracking
- Real-time task updates

### 💰 Budget Tracking
- Create event budgets with categories
- Track expenses by category
- Budget utilization monitoring
- Expense history and reporting

### 🏪 Vendor Marketplace
- Browse vendor services
- Vendor profiles with portfolios
- Service engagement system
- Vendor ratings and reviews

### 🔔 Real-time Notifications
- Task assignments and updates
- Event announcements
- Budget alerts
- Live collaboration updates

## Tech Stack

- **Frontend**: React Native with Expo SDK 54
- **Language**: TypeScript
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth with secure token storage
- **Navigation**: React Navigation 7
- **Storage**: Expo SecureStore + AsyncStorage

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │    │    Supabase      │    │   PostgreSQL    │
│   Components    │◄──►│   API + Auth     │◄──►│   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│ Zustand Stores  │    │  Real-time       │
│ (State Mgmt)    │    │  Subscriptions   │
└─────────────────┘    └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Local Storage   │
│ (AsyncStorage + │
│  SecureStore)   │
└─────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account

### 1. Clone and Install
```bash
npx supabase db push --include-all
Remove-Item -Recurse -Force node_modules
git clone <repository-url>
cd event-yangu
npm install
```

### 2. Set up Supabase
1. Create a new Supabase project
2. Run the SQL schema from `database-schema.sql`
3. Set up Row Level Security policies (see `supabase-setup.md`)
4. Get your project URL and anon key

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Start Development
```bash
npm start
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/          # App constants (colors, etc.)
├── lib/               # Third-party integrations
│   └── supabase.ts    # Supabase client configuration
├── navigation/        # Navigation setup
├── screens/          # Screen components
│   ├── auth/         # Authentication screens
│   ├── events/       # Event management screens
│   ├── home/         # Dashboard and home screens
│   ├── profile/      # User profile screens
│   ├── vendors/      # Vendor marketplace screens
│   └── budget/       # Budget management screens
├── services/         # API service layers
├── store/           # Zustand state stores
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Key Features Implementation

### Authentication Flow
- Secure registration and login with Supabase Auth
- Persistent sessions with Expo SecureStore
- Role-based access control (Admin, Committee, Member, Vendor, Viewer)

### Real-time Updates
- Live task status changes
- Committee member updates
- Event announcements
- Budget expense tracking

### Offline Support
- Local data caching with AsyncStorage
- Zustand persistence for app state
- Graceful offline/online transitions

## Database Schema

The app uses a comprehensive PostgreSQL schema with:
- **Users**: Authentication and profiles
- **Events**: Event management with join codes
- **Committees**: Event organization structure
- **Tasks**: Task management with assignments
- **Budgets**: Financial tracking with categories
- **Vendors**: Service provider marketplace
- **Notifications**: Real-time communication

See `database-schema.sql` for complete schema definition.

## Development

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

### Code Style
- TypeScript strict mode enabled
- Consistent component structure
- Comprehensive error handling
- Type-safe API integration

## Deployment

### Mobile App
1. Build with Expo Application Services (EAS)
2. Submit to App Store and Google Play
3. Configure environment variables for production

### Backend
1. Supabase handles all backend infrastructure
2. Configure production database settings
3. Set up proper backup and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security

- All sensitive data encrypted with Expo SecureStore
- Row Level Security (RLS) policies in Supabase
- JWT-based authentication
- Input validation and sanitization

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the `supabase-setup.md` for setup help
- Review the troubleshooting section in setup guide

---

Built with ❤️ using React Native, Expo, and Supabase