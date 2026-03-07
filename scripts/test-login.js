// Test login script to verify credentials work
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testing login with admin@eventyangu.com...\n');

  try {
    // Test login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@eventyangu.com',
      password: 'password123',
    });

    if (authError) {
      console.error('❌ Login failed:', authError.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Failed to fetch profile:', profileError.message);
      return;
    }

    console.log('\n👤 User Profile:');
    console.log('Name:', userProfile.name);
    console.log('Role:', userProfile.role);
    console.log('Phone:', userProfile.phone);

    // Sign out
    await supabase.auth.signOut();
    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testLogin();
