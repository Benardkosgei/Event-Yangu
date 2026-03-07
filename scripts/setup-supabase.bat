@echo off
REM Event Yangu - Supabase Setup Script for Windows
REM This script sets up the Supabase project with migrations and seed data

echo 🚀 Setting up Event Yangu Supabase project...

REM Check if we're in the right directory
if not exist "supabase\config.toml" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

REM Initialize Supabase (if not already initialized)
if not exist ".supabase" (
    echo 📦 Initializing Supabase project...
    npx supabase init
)

REM Start Supabase local development
echo 🔧 Starting Supabase local development environment...
npx supabase start

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Apply migrations
echo 📊 Applying database migrations...
npx supabase db reset --linked=false

REM Seed the database
echo 🌱 Seeding database with sample data...
npx supabase db seed

REM Generate TypeScript types
echo 🔧 Generating TypeScript types...
npx supabase gen types typescript --local > src\lib\database.types.ts

echo ✅ Supabase setup complete!
echo.
echo 📋 Next steps:
echo 1. Copy your local Supabase credentials to .env:
echo    EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
echo    EXPO_PUBLIC_SUPABASE_ANON_KEY=^<your-anon-key^>
echo.
echo 2. Start your React Native app:
echo    npm start
echo.
echo 3. Access Supabase Studio at: http://localhost:54323
echo.
echo 🔗 Useful commands:
echo    npx supabase status    - Check service status
echo    npx supabase stop      - Stop all services
echo    npx supabase db reset  - Reset database with fresh migrations
echo    npx supabase db seed   - Re-run seed data

pause