// API Integration Tests for Pajama Party Platform V3
// Run with: npm test tests/api-integration.test.js

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test Health Endpoint
async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    
    if (response.status === 200 && data.status === 'healthy') {
      console.log('✅ Health endpoint working');
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

// Test Station Search
async function testStationSearch() {
  console.log('🔍 Testing Station Search...');
  
  const testQueries = ['berlin', 'paris', 'vienna', 'amsterdam'];
  let allPassed = true;
  
  for (const query of testQueries) {
    try {
      const response = await fetch(`${API_BASE}/api/stations/search?q=${query}`);
      const data = await response.json();
      
      if (response.status === 200 && Array.isArray(data.stations)) {
        console.log(`✅ Station search for "${query}": ${data.stations.length} results`);
      } else {
        console.log(`❌ Station search failed for "${query}":`, data);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ Station search error for "${query}":`, error.message);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test Stats Endpoint
async function testStatsEndpoint() {
  console.log('🔍 Testing Stats Endpoint...');
  
  try {
    const response = await fetch(`${API_BASE}/api/stats`);
    const data = await response.json();
    
    const requiredFields = ['totalDreams', 'totalDreamers', 'topRoutes', 'campaignGoals'];
    const hasAllFields = requiredFields.every(field => data.hasOwnProperty(field));
    
    if (response.status === 200 && hasAllFields) {
      console.log('✅ Stats endpoint working');
      console.log(`   - Total Dreams: ${data.totalDreams}`);
      console.log(`   - Total Dreamers: ${data.totalDreamers}`);
      console.log(`   - Top Routes: ${data.topRoutes.length}`);
      return true;
    } else {
      console.log('❌ Stats endpoint missing fields:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Stats endpoint error:', error.message);
    return false;
  }
}

// Test Dream Submission
async function testDreamSubmission() {
  console.log('🔍 Testing Dream Submission...');
  
  const testDream = {
    from: 'Berlin Hauptbahnhof',
    to: 'Vienna Central Station',
    name: 'Test User',
    email: 'test@example.com',
    why: 'Testing the API integration'
  };
  
  try {
    const response = await fetch(`${API_BASE}/api/dreams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testDream)
    });
    
    const data = await response.json();
    
    if (response.status === 201 && data.success && data.id) {
      console.log('✅ Dream submission working');
      console.log(`   - Generated ID: ${data.id}`);
      return true;
    } else {
      console.log('❌ Dream submission failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Dream submission error:', error.message);
    return false;
  }
}

// Test Invalid Dream Submission
async function testInvalidDreamSubmission() {
  console.log('🔍 Testing Invalid Dream Submission...');
  
  const invalidDream = {
    from: '',
    to: 'Vienna Central Station',
    name: 'Test User',
    email: 'invalid-email',
    why: ''
  };
  
  try {
    const response = await fetch(`${API_BASE}/api/dreams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidDream)
    });
    
    const data = await response.json();
    
    if (response.status === 400 && data.error) {
      console.log('✅ Invalid dream validation working');
      console.log(`   - Error: ${data.error}`);
      return true;
    } else {
      console.log('❌ Invalid dream validation failed:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid dream validation error:', error.message);
    return false;
  }
}

// Run All Tests
async function runAllTests() {
  console.log('🚀 Starting API Integration Tests');
  console.log('='.repeat(50));
  
  const tests = [
    testHealthEndpoint,
    testStationSearch,
    testStatsEndpoint,
    testDreamSubmission,
    testInvalidDreamSubmission
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  for (const test of tests) {
    const passed = await test();
    if (passed) passedTests++;
    console.log('');
  }
  
  console.log('='.repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! API is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testHealthEndpoint,
  testStationSearch,
  testStatsEndpoint,
  testDreamSubmission,
  testInvalidDreamSubmission,
  runAllTests
};