#!/bin/bash

# Event Yangu - Supabase Production Deployment Script
# This script deploys migrations and functions to production

set -e

echo "🚀 Deploying Event Yangu to Supabase production..."

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Project is not linked to Supabase. Please run:"
    echo "   npx supabase link --project-ref <your-project-ref>"
    exit 1
fi

# Confirm deployment
echo "⚠️  This will deploy to production. Are you sure? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Deploy database migrations
echo "📊 Deploying database migrations..."
npx supabase db push

# Deploy Edge Functions
echo "🔧 Deploying Edge Functions..."
npx supabase functions deploy create-user-profile
npx supabase functions deploy send-notification
npx supabase functions deploy generate-event-report

# Generate and update TypeScript types
echo "🔧 Generating production TypeScript types..."
npx supabase gen types typescript --linked > src/lib/database.types.ts

# Set up database webhooks (optional)
echo "🔗 Setting up database webhooks..."
if [ -f ".env.production" ]; then
    npx supabase secrets set --env-file .env.production
fi

echo "✅ Production deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. ✅ Update your .env with production credentials"
echo "2. ✅ Test authentication flow"
echo "3. ✅ Verify RLS policies are working"
echo "4. ✅ Test real-time subscriptions"
echo "5. ✅ Check Edge Functions are responding"
echo "6. ✅ Verify file uploads to Storage"
echo ""
echo "🔗 Production URLs:"
echo "   Dashboard: https://app.supabase.com/project/<your-project-ref>"
echo "   API: https://<your-project-ref>.supabase.co"