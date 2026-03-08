# Event Yangu Scripts

Utility scripts for testing and debugging the Event Yangu application.

## Available Scripts

### test-event-creation.js

Tests the complete event creation flow to diagnose issues.

**Usage:**
```bash
# Install dependencies first (if not already installed)
npm install @supabase/supabase-js dotenv

# Run the test
node scripts/test-event-creation.js
```

**What it tests:**
1. ✅ Supabase connection
2. ✅ User authentication status
3. ✅ RLS policies (SELECT)
4. ✅ Event creation (INSERT)
5. ✅ Event member creation
6. ✅ Event retrieval
7. ✅ Cleanup (DELETE)

**Output:**
- Detailed step-by-step results
- Error messages with context
- Success/failure indicators
- Recommendations for fixes

**Requirements:**
- `.env` file with Supabase credentials
- Active Supabase project
- (Optional) Authenticated user session

## Adding New Scripts

When adding new scripts:

1. Create the script in this directory
2. Add documentation here
3. Include usage examples
4. Document requirements
5. Add error handling
6. Include cleanup logic

## Notes

- All scripts use the same Supabase configuration from `.env`
- Scripts are for development/debugging only
- Always test scripts in a development environment first
- Clean up any test data created by scripts
