#!/usr/bin/env node

/**
 * PostgreSQL Direct Database Migration
 * Uses node-postgres to execute DDL operations with service role privileges
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
  process.exit(1);
}

/**
 * Extract connection details from Supabase URL and service key
 */
function getConnectionConfig() {
  // Extract project reference from URL
  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1];
  
  // Supabase connection format
  return {
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: serviceRoleKey.replace('sb_secret_', '').replace('_TfUpaCcR', ''),
    ssl: { rejectUnauthorized: false }
  };
}

/**
 * Execute migration SQL
 */
async function executeMigration() {
  const connectionConfig = getConnectionConfig();
  console.log('🔌 Connecting to Supabase PostgreSQL...');
  console.log(`   Host: ${connectionConfig.host}`);
  console.log(`   Database: ${connectionConfig.database}`);
  
  const client = new Client(connectionConfig);
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to database');
    
    // Load migration SQL
    if (!fs.existsSync(MIGRATION_FILE)) {
      console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
      return false;
    }
    
    const migrationSql = fs.readFileSync(MIGRATION_FILE, 'utf8');
    console.log(`📊 Executing migration (${migrationSql.length} characters)...`);
    
    // Execute the migration
    const result = await client.query(migrationSql);
    console.log('✅ Migration executed successfully');
    
    return true;
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    
    // If it's an authentication error, try alternative connection
    if (error.message.includes('authentication') || error.message.includes('password')) {
      console.log('\n🔄 Trying alternative connection format...');
      return await tryAlternativeConnection();
    }
    
    return false;
    
  } finally {
    await client.end();
  }
}

/**
 * Try alternative connection using connection pooler
 */
async function tryAlternativeConnection() {
  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1];
  
  // Try different connection formats
  const connectionConfigs = [
    {
      connectionString: `postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`,
      description: 'Direct database connection'
    },
    {
      connectionString: `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
      description: 'Connection pooler'
    }
  ];
  
  for (const config of connectionConfigs) {
    console.log(`🔄 Trying ${config.description}...`);
    
    try {
      const client = new Client({
        connectionString: config.connectionString.replace('[YOUR-PASSWORD]', serviceRoleKey.replace('sb_secret_', ''))
      });
      
      await client.connect();
      console.log(`✅ Connected via ${config.description}`);
      
      // Load and execute migration
      const migrationSql = fs.readFileSync(MIGRATION_FILE, 'utf8');
      await client.query(migrationSql);
      console.log('✅ Migration executed successfully');
      
      await client.end();
      return true;
      
    } catch (error) {
      console.log(`❌ ${config.description} failed:`, error.message);
      continue;
    }
  }
  
  return false;
}

/**
 * Validate migration was applied
 */
async function validateMigration() {
  console.log('\n🔍 Validating migration...');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Test if places table exists
    const { data, error } = await supabase
      .from('places')
      .select('place_id')
      .limit(1);
    
    if (error) {
      console.error('❌ Places table not accessible:', error.message);
      return false;
    }
    
    console.log('✅ Places table exists and is accessible');
    
    // Test routes table
    const { error: routesError } = await supabase
      .from('routes')
      .select('id')
      .limit(1);
    
    if (routesError) {
      console.error('❌ Routes table not accessible:', routesError.message);
      return false;
    }
    
    console.log('✅ Routes table exists and is accessible');
    
    // Test content table
    const { error: contentError } = await supabase
      .from('content')
      .select('id')
      .limit(1);
    
    if (contentError) {
      console.error('❌ Content table not accessible:', contentError.message);
      return false;
    }
    
    console.log('✅ Content table exists and is accessible');
    console.log('✅ Migration validation successful!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    return false;
  }
}

async function main() {
  console.log('🚂 PostgreSQL Database Migration');
  console.log('=================================\n');
  
  // Execute migration
  const migrationSuccess = await executeMigration();
  
  if (!migrationSuccess) {
    console.log('\n❌ Migration failed');
    console.log('📋 Please apply the migration manually:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');  
    console.log('2. Copy content from:', MIGRATION_FILE);
    console.log('3. Execute the SQL');
    console.log('4. Then run: node scripts/import-triphop-places.js');
    process.exit(1);
  }
  
  // Validate migration
  const validationSuccess = await validateMigration();
  
  if (validationSuccess) {
    console.log('\n🎉 Database migration completed successfully!');
    console.log('🚀 Ready to import TripHop data');
    process.exit(0);
  } else {
    console.log('\n⚠️  Migration may have been applied but validation failed');
    console.log('🔍 Please check manually and proceed with data import if tables exist');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}