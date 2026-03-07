#!/bin/bash

# Event Yangu - Generate New Migration Script
# This script creates a new migration file with proper naming

set -e

if [ -z "$1" ]; then
    echo "❌ Please provide a migration name"
    echo "Usage: ./scripts/generate-migration.sh <migration_name>"
    echo "Example: ./scripts/generate-migration.sh add_user_preferences"
    exit 1
fi

MIGRATION_NAME=$1
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_${MIGRATION_NAME}.sql"

# Create migration file with template
cat > "$MIGRATION_FILE" << EOF
-- Migration: ${TIMESTAMP}_${MIGRATION_NAME}
-- Description: Add description here

-- Add your SQL statements here

-- Example:
-- ALTER TABLE public.users ADD COLUMN new_field TEXT;

-- Don't forget to:
-- 1. Add appropriate indexes if needed
-- 2. Update RLS policies if required
-- 3. Add any necessary triggers
-- 4. Test the migration locally first
EOF

echo "✅ Created migration file: $MIGRATION_FILE"
echo ""
echo "📝 Next steps:"
echo "1. Edit the migration file with your SQL changes"
echo "2. Test locally: npx supabase db reset"
echo "3. Deploy: npx supabase db push"