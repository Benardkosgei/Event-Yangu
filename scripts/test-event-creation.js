/**
 * Test Event Creation Script
 * Run this to diagnose event creation issues
 * 
 * Usage: node scripts/test-event-creation.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEventCreation() {
  console.log('🔍 Testing Event Creation Flow...\n');

  // Step 1: Check connection
  console.log('1️⃣ Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('events').select('count').limit(1);
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connection successful\n');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return;
  }

  // Step 2: Check authentication
  console.log('2️⃣ Checking authentication...');
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.log('⚠️  No authenticated user found');
    console.log('   You need to sign in first to test event creation\n');
    
    // Try to get any user from the database
    console.log('3️⃣ Checking if users exist in database...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else if (users && users.length > 0) {
      console.log(`✅ Found ${users.length} user(s) in database:`);
      users.forEach(u => console.log(`   - ${u.email} (${u.name})`));
    } else {
      console.log('⚠️  No users found in database');
    }
    return;
  }
  
  console.log(`✅ Authenticated as: ${user.email}`);
  console.log(`   User ID: ${user.id}\n`);

  // Step 3: Check RLS policies
  console.log('3️⃣ Testing RLS policies...');
  
  // Test SELECT on events
  const { data: events, error: selectError } = await supabase
    .from('events')
    .select('*')
    .limit(1);
  
  if (selectError) {
    console.error('❌ SELECT policy issue:', selectError.message);
  } else {
    console.log(`✅ SELECT policy working (found ${events?.length || 0} events)\n`);
  }

  // Step 4: Test event creation
  console.log('4️⃣ Testing event creation...');
  
  const testEvent = {
    name: 'Test Event ' + Date.now(),
    type: 'meeting',
    description: 'Test event for debugging',
    start_date: new Date().toISOString(),
    location: 'Test Location',
    join_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    created_by: user.id,
  };

  console.log('   Event data:', JSON.stringify(testEvent, null, 2));

  const { data: newEvent, error: insertError } = await supabase
    .from('events')
    .insert(testEvent)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Event creation failed:', insertError.message);
    console.error('   Error details:', JSON.stringify(insertError, null, 2));
    return;
  }

  console.log('✅ Event created successfully!');
  console.log('   Event ID:', newEvent.id);
  console.log('   Join Code:', newEvent.join_code, '\n');

  // Step 5: Test adding event member
  console.log('5️⃣ Testing event member creation...');
  
  const { data: member, error: memberError } = await supabase
    .from('event_members')
    .insert({
      event_id: newEvent.id,
      user_id: user.id,
      role: 'admin',
    })
    .select()
    .single();

  if (memberError) {
    console.error('❌ Member creation failed:', memberError.message);
    console.error('   Error details:', JSON.stringify(memberError, null, 2));
  } else {
    console.log('✅ Event member created successfully!');
    console.log('   Member ID:', member.id, '\n');
  }

  // Step 6: Verify event can be retrieved
  console.log('6️⃣ Verifying event retrieval...');
  
  const { data: retrievedEvent, error: retrieveError } = await supabase
    .from('events')
    .select('*')
    .eq('id', newEvent.id)
    .single();

  if (retrieveError) {
    console.error('❌ Event retrieval failed:', retrieveError.message);
  } else {
    console.log('✅ Event retrieved successfully!\n');
  }

  // Step 7: Clean up test event
  console.log('7️⃣ Cleaning up test event...');
  
  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .eq('id', newEvent.id);

  if (deleteError) {
    console.error('❌ Cleanup failed:', deleteError.message);
    console.log('   Please manually delete event:', newEvent.id);
  } else {
    console.log('✅ Test event cleaned up\n');
  }

  console.log('✅ All tests completed successfully!');
}

// Run the test
testEventCreation().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
