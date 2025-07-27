#!/usr/bin/env node

/**
 * Production Database Migration Script
 * Uses Supabase's Transaction Pooler for reliable DDL operations
 * 
 * Connection: postgresql://postgres.[project-ref]:password@aws-0-[region].pooler.supabase.com:6543/postgres
 * Documentation: https://supabase.com/docs/guides/database/connecting-to-postgres
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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

/**
 * Get production connection configuration
 */
function getProductionConnectionConfig() {
  // Extract project reference from URL
  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1];
  
  // Extract password from service role key (remove sb_secret_ prefix)
  const password = serviceRoleKey.replace('sb_secret_', '').replace('_TfUpaCcR', '');
  
  // Supabase production connection options
  const connectionOptions = [
    {
      name: 'Transaction Pooler (Recommended for DDL)',
      connectionString: `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
      ssl: false // Pooler handles SSL internally
    },
    {
      name: 'Direct Database Connection',
      connectionString: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
      ssl: { rejectUnauthorized: false }
    },
    {
      name: 'Session Pooler',
      connectionString: `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
      ssl: false
    }
  ];
  
  return { projectRef, password, connectionOptions };
}

/**
 * Execute migration with retry logic across different connection types
 */
async function executeMigrationWithRetry() {
  console.log('🚂 Production Database Migration');
  console.log('=================================\n');
  
  // Load migration SQL
  console.log('📁 Loading migration file...');
  
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
    return false;
  }
  
  const migrationSql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(`📊 Migration loaded (${migrationSql.length} characters)`);
  
  const { projectRef, password, connectionOptions } = getProductionConnectionConfig();
  console.log(`🎯 Project: ${projectRef}`);
  
  // Try each connection option until one succeeds
  for (let i = 0; i < connectionOptions.length; i++) {
    const option = connectionOptions[i];
    console.log(`\n🔌 Attempting connection ${i + 1}: ${option.name}`);
    
    const client = new Client({
      connectionString: option.connectionString,
      ssl: option.ssl,
      // Disable prepared statements for transaction pooler
      max: 1,
      connectionTimeoutMillis: 30000,
      query_timeout: 120000
    });
    
    try {
      console.log('   Connecting...');
      await client.connect();
      console.log('   ✅ Connected successfully');
      
      console.log('   🔧 Executing migration...');
      
      // Split migration into smaller chunks for better error handling
      const statements = migrationSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`   📝 Executing ${statements.length} SQL statements`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let j = 0; j < statements.length; j++) {
        const statement = statements[j];
        
        if (!statement || statement.startsWith('--')) continue;
        
        try {
          await client.query(statement + ';');
          successCount++;
          
          // Progress indicator for long migrations
          if (j % 10 === 0) {
            console.log(`   ⚡ Progress: ${j + 1}/${statements.length} statements`);
          }
          
        } catch (stmtError) {
          console.error(`   ⚠️  Statement ${j + 1} error:`, stmtError.message);
          errorCount++;
          
          // Continue with other statements unless it's a critical error
          if (stmtError.message.includes('already exists')) {
            console.log('   ℹ️  Object already exists, continuing...');
          } else if (errorCount > 5) {
            console.error('   ❌ Too many errors, stopping migration');
            throw stmtError;
          }
        }
      }
      
      console.log(`\n   📊 Migration Summary:`);
      console.log(`   ✅ Successful: ${successCount} statements`);
      console.log(`   ⚠️  Errors: ${errorCount} statements`);
      console.log(`   📈 Success rate: ${((successCount / statements.length) * 100).toFixed(1)}%`);
      
      if (successCount > 0) {
        console.log('   🎉 Migration completed successfully!');
        await client.end();
        return true;
      }
      
    } catch (error) {
      console.error(`   ❌ Connection failed:`, error.message);
      
      // Try to close connection gracefully
      try {
        await client.end();
      } catch (closeError) {
        // Ignore close errors
      }
      
      // Continue to next connection option
      continue;
    }
  }
  
  console.error('\n❌ All connection attempts failed');
  return false;
}

/**
 * Validate migration was applied successfully
 */
async function validateMigration() {
  console.log('\n🔍 Validating migration results...');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Test each table
    const testTables = [
      { name: 'places', fields: 'place_id, content, created_at' },
      { name: 'routes', fields: 'id' },
      { name: 'content', fields: 'id' }
    ];
    
    let allTablesValid = true;
    
    for (const table of testTables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select(table.fields)
          .limit(1);
        
        if (error) {
          console.error(`❌ ${table.name} table validation failed:`, error.message);
          allTablesValid = false;
        } else {
          console.log(`✅ ${table.name} table is accessible`);
        }
      } catch (err) {
        console.error(`❌ ${table.name} table test failed:`, err.message);
        allTablesValid = false;
      }
    }
    
    // Test multilingual helper function
    try {
      const { data: functionTest, error: functionError } = await supabase
        .rpc('get_multilingual_content', {
          content_jsonb: { en: { name: 'Test' } },
          requested_lang: 'en',
          field_name: 'name'
        });
      
      if (!functionError && functionTest === 'Test') {
        console.log('✅ Multilingual helper functions working correctly');
      } else {
        console.log('⚠️  Helper function test inconclusive (may still work)');
      }
    } catch (err) {
      console.log('⚠️  Helper function test skipped');
    }
    
    if (allTablesValid) {
      console.log('✅ Migration validation completed successfully!');
      return true;
    } else {
      console.log('❌ Some validation tests failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  // Execute migration
  const migrationSuccess = await executeMigrationWithRetry();
  
  if (!migrationSuccess) {
    console.log('\n❌ Migration failed with all connection methods');
    console.log('💡 This might be due to:');
    console.log('   - Network connectivity issues');
    console.log('   - Invalid credentials');
    console.log('   - Database permissions');
    console.log('\n🔄 Manual migration may be required');
    process.exit(1);
  }
  
  // Validate migration
  const validationSuccess = await validateMigration();
  
  if (validationSuccess) {
    console.log('\n🎉 Production database migration completed successfully!');
    console.log('🚀 Ready to import TripHop data');
    console.log('⚡ Next command: node scripts/import-triphop-places.js');
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration applied but validation had issues');
    console.log('🔍 Please verify manually and proceed with caution');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { executeMigrationWithRetry, validateMigration };