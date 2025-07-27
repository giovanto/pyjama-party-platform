#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 Checking if migration is already applied...');

Promise.all([
  supabase.from('places').select('place_id').limit(1),
  supabase.from('routes').select('id').limit(1), 
  supabase.from('content').select('id').limit(1)
]).then(results => {
  const [placesResult, routesResult, contentResult] = results;
  
  console.log('Places table:', placesResult.error ? '❌ Missing' : '✅ Exists');
  console.log('Routes table:', routesResult.error ? '❌ Missing' : '✅ Exists');
  console.log('Content table:', contentResult.error ? '❌ Missing' : '✅ Exists');
  
  if (!placesResult.error && !routesResult.error && !contentResult.error) {
    console.log('\n🎉 All tables exist! Migration already applied.');
    console.log('🚀 Ready to proceed with TripHop data import');
    process.exit(0);
  } else {
    console.log('\n📋 Migration needed. Please apply manually via Dashboard.');
    console.log('🔗 Dashboard URL: https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1] + '/editor');
    process.exit(1);
  }
}).catch(err => {
  console.log('❌ Error:', err);
  process.exit(1);
});