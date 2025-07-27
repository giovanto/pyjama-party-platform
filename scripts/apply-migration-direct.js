#!/usr/bin/env node

/**
 * Direct Database Migration via HTTP REST API
 * Uses Supabase's REST API to execute raw SQL with service role privileges
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const MIGRATION_FILE = path.join(__dirname, '../database-migrations/001-enhanced-multilingual-schema.sql');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

/**
 * Execute SQL via direct HTTP request to Supabase REST API
 */
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1];
    const apiUrl = `https://${projectRef}.supabase.co/rest/v1/rpc/sql`;
    
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (err) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * Since RPC approach doesn't work, let's try creating tables individually
 */
async function createTablesIndividually() {
  console.log('🔧 Creating database tables individually...');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Try using the Supabase admin client directly
  try {
    // Test if we can at least query existing tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ Cannot access schema information:', error);
      return false;
    }
    
    console.log('✅ Successfully connected to database');
    console.log('📋 Existing tables:', data.map(t => t.table_name));
    
    // Since we can't execute DDL via the API, we need to use the dashboard
    console.log('\n⚠️  DDL operations require manual execution via Supabase Dashboard');
    console.log('📍 Go to: https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1] + '/editor');
    
    return false;
    
  } catch (err) {
    console.error('❌ Database connection error:', err);
    return false;
  }
}

async function main() {
  console.log('🚂 Direct Database Migration');
  console.log('=============================\n');
  
  // Load migration SQL
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
    process.exit(1);
  }
  
  const migrationSql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(`📊 Migration loaded (${migrationSql.length} characters)`);
  
  // Try the individual table approach
  await createTablesIndividually();
  
  // Since DDL operations via REST API are limited, let's provide manual instructions
  console.log('\n📋 MANUAL MIGRATION REQUIRED:');
  console.log('1. Go to Supabase Dashboard SQL Editor');
  console.log('2. Copy the migration SQL from:', MIGRATION_FILE);
  console.log('3. Paste and execute in the SQL Editor');
  console.log('4. Then run: node scripts/import-triphop-places.js');
  
  // But let's continue and see if the tables already exist
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Test if migration was already applied
  try {
    const { data, error } = await supabase
      .from('places')
      .select('count')
      .limit(0);
    
    if (!error) {
      console.log('\n✅ Places table already exists! Migration may be applied.');
      console.log('🚀 Ready to proceed with TripHop data import');
      return true;
    }
  } catch (err) {
    // Table doesn't exist
  }
  
  console.log('\n❌ Migration not yet applied. Please execute manually.');
  return false;
}

if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(console.error);
}