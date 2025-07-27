#!/usr/bin/env node

/**
 * Final Production Migration Script
 * Uses the exact connection string format provided by the user
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

async function applyMigration() {
  console.log('🚂 Final Production Database Migration');
  console.log('======================================\n');
  
  // Load migration SQL
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error(`❌ Migration file not found: ${MIGRATION_FILE}`);
    return false;
  }
  
  const migrationSql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(`📊 Migration loaded (${migrationSql.length} characters)`);
  
  // Extract project reference and create connection string
  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)[1];
  
  // Extract password from service role key - trying different formats
  let password = serviceRoleKey;
  if (password.startsWith('sb_secret_')) {
    password = password.replace('sb_secret_', '');
  }
  
  const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
  
  console.log(`🎯 Project: ${projectRef}`);
  console.log(`🔌 Connection: postgresql://postgres:***@db.${projectRef}.supabase.co:5432/postgres`);
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');
    
    console.log('🔧 Executing migration...');
    await client.query(migrationSql);
    console.log('✅ Migration executed successfully!');
    
    await client.end();
    return true;
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    
    // Try alternative password format
    if (error.message.includes('authentication') || error.message.includes('password')) {
      console.log('\n🔄 Trying alternative password format...');
      
      const altPassword = serviceRoleKey.replace('sb_secret_', '').split('_')[0];
      const altConnectionString = `postgresql://postgres:${altPassword}@db.${projectRef}.supabase.co:5432/postgres`;
      
      const altClient = new Client({
        connectionString: altConnectionString,
        ssl: { rejectUnauthorized: false }
      });
      
      try {
        await altClient.connect();
        console.log('✅ Connected with alternative format');
        
        await altClient.query(migrationSql);
        console.log('✅ Migration executed successfully!');
        
        await altClient.end();
        return true;
        
      } catch (altError) {
        console.error('❌ Alternative connection also failed:', altError.message);
        await altClient.end().catch(() => {});
      }
    }
    
    await client.end().catch(() => {});
    return false;
  }
}

async function validateMigration() {
  console.log('\n🔍 Validating migration...');
  
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    const { data, error } = await supabase
      .from('places')
      .select('place_id')
      .limit(1);
    
    if (!error) {
      console.log('✅ Places table is accessible');
      return true;
    } else {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  } catch (err) {
    console.error('❌ Validation error:', err);
    return false;
  }
}

async function main() {
  const success = await applyMigration();
  
  if (success) {
    const validated = await validateMigration();
    
    if (validated) {
      console.log('\n🎉 Migration completed and validated!');
      console.log('🚀 Ready to import TripHop data');
      process.exit(0);
    }
  }
  
  console.log('\n❌ Migration failed - manual application required');
  process.exit(1);
}

main().catch(console.error);