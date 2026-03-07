#!/bin/bash

# Event Yangu - Supabase Setup Script
# This script sets up the Supabase project with migrations and seed data

set -e

echo "🚀 Setting up Event Yangu Supabase project..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Initialize Supabase (if not already initialized)
if [ ! -d ".supabase" ]; then
    echo "📦 Initializing Supabase project..."
    npx supabase init
fi

# Start Supabase local development
echo "🔧 Starting Supabase local development environment..."
npx supabase start

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Apply migrations
echo "📊 Applying database migrations..."
npx supabase db reset --linked=false

# Seed the database
echo "🌱 Seeding database with sample data..."
npx supabase db seed

# Generate TypeScript types
echo "🔧 Generating TypeScript types..."
npx supabase gen types typescript --local > src/lib/database.types.ts

echo "✅ Supabase setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your local Supabase credentials to .env:"
echo "   EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321"
echo "   EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>"
echo ""
echo "2. Start your React Native app:"
echo "   npm start"
echo ""
echo "3. Access Supabase Studio at: http://localhost:54323"
echo ""
echo "🔗 Useful commands:"
echo "   npx supabase status    - Check service status"
echo "   npx supabase stop      - Stop all services"
echo "   npx supabase db reset  - Reset database with fresh migrations"
echo "   npx supabase db seed   - Re-run seed data"