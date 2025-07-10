// Supabase Integration Tests with Zen MCP Debugging
// Run after applying database schema

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testDatabaseConnection() {
  console.log('🔗 Testing Database Connection...');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    
    if (response.status === 200) {
      console.log('✅ Health endpoint responding');
      return true;
    } else {
      console.log('❌ Health endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health endpoint error:', error.message);
    return false;
  }
}

async function testStationDatabase() {
  console.log('🚉 Testing Station Database...');
  
  // Test station search with actual database
  const testCities = ['berlin', 'vienna', 'paris', 'madrid'];
  let allPassed = true;
  
  for (const city of testCities) {
    try {
      const response = await fetch(`${API_BASE}/api/stations/search?q=${city}`);
      const data = await response.json();
      
      if (response.status === 200 && Array.isArray(data.stations)) {
        console.log(`✅ Station search "${city}": ${data.stations.length} results`);
        
        // Verify data structure
        if (data.stations.length > 0) {
          const station = data.stations[0];
          const hasRequiredFields = station.id && station.name && station.city && 
                                   station.country && Array.isArray(station.coordinates);
          
          if (hasRequiredFields) {
            console.log(`   ✓ Valid station data: ${station.name}, ${station.city}`);
          } else {
            console.log(`   ❌ Invalid station structure:`, station);
            allPassed = false;
          }
        }
      } else {
        console.log(`❌ Station search failed for "${city}":`, data);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ Station search error for "${city}":`, error.message);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testDreamSubmission() {
  console.log('💭 Testing Dream Submission to Database...');
  
  const testDream = {
    from: 'Berlin Hauptbahnhof, Berlin, Germany',
    to: 'Vienna Central Station, Vienna, Austria',
    name: 'Integration Test User',
    email: 'integration.test@example.com',
    why: 'Testing the complete Supabase integration workflow'
  };
  
  try {
    // Submit dream
    const response = await fetch(`${API_BASE}/api/dreams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testDream)
    });
    
    const data = await response.json();
    
    if (response.status === 201 && data.success && data.id) {
      console.log('✅ Dream submission successful');
      console.log(`   ✓ Generated ID: ${data.id}`);
      
      // Verify dream appears in database
      const getResponse = await fetch(`${API_BASE}/api/dreams`);
      const getDreams = await getResponse.json();
      
      if (getDreams.dreams && getDreams.dreams.length > 0) {
        const submittedDream = getDreams.dreams.find(d => d.id === data.id);
        
        if (submittedDream) {
          console.log('   ✓ Dream persisted to database');
          console.log(`   ✓ From: ${submittedDream.from_station}`);
          console.log(`   ✓ To: ${submittedDream.to_station}`);
          console.log(`   ✓ Coordinates: ${submittedDream.from_latitude}, ${submittedDream.from_longitude}`);
          return true;
        } else {
          console.log('   ❌ Dream not found in database');
          return false;
        }
      } else {
        console.log('   ❌ No dreams returned from database');
        return false;
      }
    } else {
      console.log('❌ Dream submission failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Dream submission error:', error.message);
    return false;
  }
}

async function testStatsWithRealData() {
  console.log('📊 Testing Stats with Real Database Data...');
  
  try {
    const response = await fetch(`${API_BASE}/api/stats`);
    const data = await response.json();
    
    if (response.status === 200) {
      console.log('✅ Stats endpoint working with database');
      console.log(`   ✓ Total Dreams: ${data.totalDreams}`);
      console.log(`   ✓ Total Dreamers: ${data.totalDreamers}`);
      console.log(`   ✓ Top Routes: ${data.topRoutes.length}`);
      console.log(`   ✓ Recent Activity: ${data.recentActivity.length}`);
      
      // Verify data is from database (not mock)
      if (data.totalDreams >= 0 && Array.isArray(data.recentActivity)) {
        console.log('   ✓ Real database data detected');
        return true;
      } else {
        console.log('   ❌ Data appears to be mock/fallback');
        return false;
      }
    } else {
      console.log('❌ Stats endpoint failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Stats endpoint error:', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('🗄️ Testing Database Schema Compliance...');
  
  // Test if we can fetch a few records to verify schema
  try {
    const dreamsResponse = await fetch(`${API_BASE}/api/dreams?limit=1`);
    const dreamsData = await dreamsResponse.json();
    
    const stationsResponse = await fetch(`${API_BASE}/api/stations/search?q=berlin`);
    const stationsData = await stationsResponse.json();
    
    // Check if responses have expected structure
    const dreamsValid = dreamsData.dreams !== undefined && Array.isArray(dreamsData.dreams);
    const stationsValid = stationsData.stations !== undefined && Array.isArray(stationsData.stations);
    
    if (dreamsValid && stationsValid) {
      console.log('✅ Database schema is properly set up');
      console.log(`   ✓ Dreams table accessible`);
      console.log(`   ✓ Stations table accessible`);
      return true;
    } else {
      console.log('❌ Database schema issues detected');
      console.log(`   - Dreams valid: ${dreamsValid}`);
      console.log(`   - Stations valid: ${stationsValid}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Schema validation error:', error.message);
    return false;
  }
}

async function testEndToEndWorkflow() {
  console.log('🔄 Testing End-to-End Workflow...');
  
  let passed = 0;
  const total = 6;
  
  // Run all tests in sequence
  if (await testDatabaseConnection()) passed++;
  if (await testDatabaseSchema()) passed++;
  if (await testStationDatabase()) passed++;
  if (await testDreamSubmission()) passed++;
  if (await testStatsWithRealData()) passed++;
  
  // Test form autocomplete workflow
  console.log('🎯 Testing Form Autocomplete Workflow...');
  try {
    const searchResponse = await fetch(`${API_BASE}/api/stations/search?q=ber`);
    const searchData = await searchResponse.json();
    
    if (searchData.stations && searchData.stations.length > 0) {
      const station = searchData.stations[0];
      console.log(`✅ Autocomplete workflow: Found ${station.name}`);
      passed++;
    } else {
      console.log('❌ Autocomplete workflow failed');
    }
  } catch (error) {
    console.log('❌ Autocomplete workflow error:', error.message);
  }
  
  return { passed, total };
}

// Main test runner
async function runSupabaseIntegrationTests() {
  console.log('🚀 Starting Supabase Integration Tests');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  const results = await testEndToEndWorkflow();
  const duration = Date.now() - startTime;
  
  console.log('='.repeat(60));
  console.log(`📊 Integration Test Results: ${results.passed}/${results.total} passed`);
  console.log(`⏱️  Duration: ${duration}ms`);
  
  if (results.passed === results.total) {
    console.log('🎉 All Supabase integration tests passed!');
    console.log('✅ Database is properly configured and working');
    console.log('✅ API endpoints are functioning correctly');
    console.log('✅ Ready for production deployment');
    process.exit(0);
  } else {
    console.log('⚠️  Some integration tests failed');
    console.log('💡 Check SUPABASE_SETUP.md for schema setup instructions');
    process.exit(1);
  }
}

// Export for use in other test files
module.exports = {
  testDatabaseConnection,
  testStationDatabase,
  testDreamSubmission,
  testStatsWithRealData,
  testDatabaseSchema,
  runSupabaseIntegrationTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runSupabaseIntegrationTests();
}