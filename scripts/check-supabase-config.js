#!/usr/bin/env node

// Quick diagnostic script to check Supabase configuration
// Run with: node scripts/check-supabase-config.js

import { createClient } from '@supabase/supabase-js';

console.log('🔍 Checking Supabase Configuration...\n');

// Check environment variables
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('\nPlease ensure the following are set in your .env.local:');
  console.log('  - EXPO_PUBLIC_SUPABASE_URL');
  console.log('  - EXPO_PUBLIC_SUPABASE_KEY');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   URL: ${url.substring(0, 30)}...`);
console.log(`   Key: ${key.substring(0, 20)}...`);

// Create Supabase client
const supabase = createClient(url, key);

console.log('\n✅ Supabase client created');

// Check if signInAnonymously exists
if (typeof supabase.auth.signInAnonymously === 'function') {
  console.log('✅ signInAnonymously method is available');
} else {
  console.error('❌ signInAnonymously method is NOT available');
  console.log('\nPossible solutions:');
  console.log('  1. Update @supabase/supabase-js to v2.39.0 or higher');
  console.log('  2. Run: npm install @supabase/supabase-js@latest');
}

// Test anonymous sign-in
console.log('\n🔐 Testing anonymous sign-in...');
try {
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    console.error('❌ Anonymous sign-in failed:', error.message);
    console.log('\nPossible causes:');
    console.log('  1. Anonymous auth not enabled in Supabase Dashboard');
    console.log('  2. Go to: Authentication > Settings > Enable anonymous sign-ins');
    console.log('  3. Rate limiting or other project settings');
  } else {
    console.log('✅ Anonymous sign-in successful!');
    console.log('   User ID:', data.user?.id);
    console.log('   Is Anonymous:', data.user?.is_anonymous);
    
    // Clean up - sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out (cleanup)');
  }
} catch (error) {
  console.error('❌ Unexpected error:', error.message);
}

console.log('\n✨ Diagnostic complete!\n');
