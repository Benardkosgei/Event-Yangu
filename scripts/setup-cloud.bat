@echo off
REM Event Yangu - Supabase Cloud Setup Script
REM This script helps you set up Supabase cloud project

echo 🚀 Setting up Event Yangu with Supabase Cloud...
echo.
echo 📋 Prerequisites:
echo 1. Create a Supabase project at https://supabase.com
echo 2. Get your project reference ID from the URL
echo 3. Get your API keys from Settings ^> API
echo.
echo ⚠️  Make sure you have:
echo - Project URL (https://your-project-ref.supabase.co)
echo - Anon public key
echo - Service role key (keep this secret!)
echo.

set /p PROJECT_REF="Enter your Supabase project reference ID: "
if "%PROJECT_REF%"=="" (
    echo ❌ Project reference ID is required
    pause
    exit /b 1
)

echo.
echo 🔗 Linking to Supabase project...
npx supabase link --project-ref %PROJECT_REF%

if %errorlevel% neq 0 (
    echo ❌ Failed to link project. Please check your project reference ID.
    pause
    exit /b 1
)

echo.
echo 📊 Deploying database migrations...
npx supabase db push

if %errorlevel% neq 0 (
    echo ❌ Failed to deploy migrations.
    pause
    exit /b 1
)

echo.
echo 🔧 Generating TypeScript types...
npx supabase gen types typescript --linked > src\lib\database.types.ts

echo.
echo 🌱 Would you like to seed the database with sample data? (y/N)
set /p SEED_CHOICE=""
if /i "%SEED_CHOICE%"=="y" (
    echo Seeding database...
    npx supabase db seed
)

echo.
echo ✅ Supabase cloud setup complete!
echo.
echo 📋 Next steps:
echo 1. Update your .env file with your Supabase credentials:
echo    EXPO_PUBLIC_SUPABASE_URL=https://%PROJECT_REF%.supabase.co
echo    EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
echo.
echo 2. Start your React Native app:
echo    npm start
echo.
echo 3. Access your Supabase dashboard:
echo    https://app.supabase.com/project/%PROJECT_REF%
echo.

pause