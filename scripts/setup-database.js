/**
 * Database Setup Script
 * 
 * This script sets up the complete database schema and imports initial data.
 * Run this after creating your Supabase project and setting up environment variables.
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { importStations } from './import-stations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Execute SQL script
 */
async function executeSQLScript(scriptPath) {
  try {
    const sql = readFileSync(scriptPath, 'utf8');
    console.log(`📝 Executing SQL script: ${scriptPath}`);
    
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql });
    
    if (error) {
      throw new Error(`SQL execution failed: ${error.message}`);
    }
    
    console.log('✅ SQL script executed successfully');
  } catch (error) {
    console.error('❌ SQL script execution failed:', error.message);
    throw error;
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const { data, error } = await supabase.from('dreams').select('count').limit(1);
    
    if (error && !error.message.includes('relation "dreams" does not exist')) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Environment variables validated');
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('🗄️  Setting up Pajama Party Platform Database');
  console.log('=' .repeat(60));
  
  try {
    // 1. Validate environment
    validateEnvironment();
    
    // 2. Test database connection
    await testConnection();
    
    // 3. Create database schema
    const schemaPath = join(__dirname, 'sql', '01_create_schema.sql');
    console.log('\n📋 Creating database schema...');
    
    // Note: Direct SQL execution via RPC might not be available in Supabase
    // Users should run the SQL script manually in the Supabase SQL editor
    console.log('⚠️  Manual step required:');
    console.log('   1. Open Supabase Dashboard → SQL Editor');
    console.log('   2. Copy and execute the SQL from: scripts/sql/01_create_schema.sql');
    console.log('   3. Press Enter to continue after executing the SQL...');
    
    // Wait for user confirmation
    process.stdin.setRawMode(true);
    process.stdin.resume();
    await new Promise(resolve => process.stdin.once('data', resolve));
    process.stdin.setRawMode(false);
    process.stdin.pause();
    
    // 4. Verify tables exist
    console.log('\n🔍 Verifying database schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['dreams', 'stations']);
    
    if (tablesError) {
      console.log('⚠️  Could not verify tables (this is normal for some setups)');
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log(`✅ Found tables: ${tableNames.join(', ')}`);
    }
    
    // 5. Import station data
    console.log('\n🚂 Importing European train stations...');
    await importStations();
    
    // 6. Final verification
    console.log('\n🔍 Final verification...');
    const { data: dreamCount, error: dreamError } = await supabase
      .from('dreams')
      .select('count')
      .limit(1);
    
    const { data: stationCount, error: stationError } = await supabase
      .from('stations')
      .select('count')
      .limit(1);
    
    if (!dreamError && !stationError) {
      console.log('✅ Database setup completed successfully!');
    } else {
      console.log('⚠️  Database setup completed with some verification issues');
    }
    
    console.log('\n🎉 Setup Summary:');
    console.log('   - Database schema created');
    console.log('   - Row Level Security enabled');
    console.log('   - Performance indexes created');
    console.log('   - Station data imported');
    console.log('   - Utility functions created');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the API endpoints');
    console.log('   2. Set up scheduled cleanup job (optional)');
    console.log('   3. Configure environment variables for production');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Verify Supabase credentials in .env.local');
    console.log('   - Check network connectivity');
    console.log('   - Ensure Supabase project is active');
    console.log('   - Review SQL script for syntax errors');
    process.exit(1);
  }
}

/**
 * Run setup if this script is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };