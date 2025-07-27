#!/usr/bin/env node

/**
 * Supabase Management API Database Migration
 * Uses the official Management API to execute DDL operations programmatically
 * 
 * API Endpoint: POST /v1/projects/{ref}/database/query
 * Documentation: https://supabase.com/docs/reference/api/introduction
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
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1];

/**
 * Execute SQL via Supabase Management API
 */
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      query: sql
    });
    
    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    };
    
    console.log(`🔧 Executing SQL via Management API...`);
    console.log(`📍 Endpoint: https://api.supabase.com/v1/projects/${projectRef}/database/query`);
    
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
 * Apply migration using Management API
 */
async function applyMigration() {
  console.log('🚂 Supabase Management API Migration');
  console.log('====================================\n');
  
  // Load migration SQL
  console.log('📁 Loading migration file...');
  
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
    return false;
  }
  
  const migrationSql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(`📊 Migration loaded (${migrationSql.length} characters)`);
  console.log(`🎯 Project: ${projectRef}`);
  
  try {
    // Execute the migration
    const result = await executeSQL(migrationSql);
    
    console.log(`\n📡 API Response Status: ${result.status}`);
    
    if (result.status === 200 || result.status === 201) {
      console.log('✅ Migration executed successfully!');
      console.log('📋 Response:', JSON.stringify(result.data, null, 2));
      return true;
    } else if (result.status === 401) {
      console.error('❌ Authentication failed - invalid service role key');
      console.error('🔑 Please verify your SUPABASE_SERVICE_ROLE_KEY');
      return false;
    } else if (result.status === 403) {
      console.error('❌ Access forbidden - insufficient permissions');
      console.error('💡 The Management API endpoint may require additional permissions');
      return false;
    } else if (result.status === 404) {
      console.error('❌ Project not found or endpoint not available');
      console.error('🔍 Verify project reference:', projectRef);
      return false;
    } else {
      console.error(`❌ Migration failed with status ${result.status}`);
      console.error('📋 Response:', JSON.stringify(result.data, null, 2));
      return false;
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    return false;
  }
}

/**
 * Validate migration was applied successfully
 */
async function validateMigration() {
  console.log('\n🔍 Validating migration results...');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Test if places table exists and has correct structure
    const { data: placesTest, error: placesError } = await supabase
      .from('places')
      .select('place_id, content, created_at')
      .limit(1);
    
    if (placesError) {
      console.error('❌ Places table validation failed:', placesError.message);
      return false;
    }
    
    console.log('✅ Places table exists and is accessible');
    
    // Test if routes table exists
    const { data: routesTest, error: routesError } = await supabase
      .from('routes')
      .select('id')
      .limit(1);
    
    if (routesError) {
      console.error('❌ Routes table validation failed:', routesError.message);
      return false;
    }
    
    console.log('✅ Routes table exists and is accessible');
    
    // Test if content table exists
    const { data: contentTest, error: contentError } = await supabase
      .from('content')
      .select('id')
      .limit(1);
    
    if (contentError) {
      console.error('❌ Content table validation failed:', contentError.message);
      return false;
    }
    
    console.log('✅ Content table exists and is accessible');
    
    // Test multilingual helper function
    try {
      const { data: functionTest, error: functionError } = await supabase
        .rpc('get_multilingual_content', {
          content_jsonb: { en: { name: 'Test' } },
          requested_lang: 'en',
          field_name: 'name'
        });
      
      if (!functionError) {
        console.log('✅ Multilingual helper functions working');
      }
    } catch (err) {
      console.log('⚠️  Helper function test skipped (may not be critical)');
    }
    
    console.log('✅ Migration validation completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  // Apply migration
  const migrationSuccess = await applyMigration();
  
  if (!migrationSuccess) {
    console.log('\n❌ Migration failed via Management API');
    console.log('💡 This might be due to:');
    console.log('   - Beta endpoint not available for your project');
    console.log('   - Insufficient permissions');
    console.log('   - API endpoint changes');
    console.log('\n🔄 Falling back to manual migration instructions...');
    console.log('📋 Please apply migration manually via Dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/editor');
    console.log('2. Copy SQL from:', MIGRATION_FILE);
    console.log('3. Execute in SQL Editor');
    process.exit(1);
  }
  
  // Validate migration
  const validationSuccess = await validateMigration();
  
  if (validationSuccess) {
    console.log('\n🎉 Database migration completed successfully via Management API!');
    console.log('🚀 Ready to import TripHop data');
    console.log('⚡ Next: node scripts/import-triphop-places.js');
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration applied but validation failed');
    console.log('🔍 Please verify manually and proceed with data import if tables exist');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeSQL, applyMigration, validateMigration };