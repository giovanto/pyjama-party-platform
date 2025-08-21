#!/usr/bin/env node

/**
 * Quota-Safe Performance Testing Script
 * 
 * Tests performance without consuming Supabase MAU quota:
 * - Anonymous API endpoints only
 * - No user authentication
 * - Uses synthetic data simulation
 * - Focuses on database query performance
 * - Tests CDN and static asset delivery
 * 
 * Usage: node scripts/quota-safe-performance-test.js [--production]
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  baseUrl: process.argv.includes('--production') 
    ? 'https://pyjama-party.back-on-track.eu'
    : 'http://localhost:3000',
  
  endpoints: [
    // Anonymous API endpoints (quota-safe)
    '/api/dreams',
    '/api/analytics/events',
    '/api/impact/dreams-count',
    '/api/impact/growth-chart',
    '/api/impact/routes-popular',
    '/api/impact/stations-ready',
    '/api/health',
    
    // Static pages
    '/',
    '/impact',
    '/pyjama-party',
    '/participate',
    
    // Static assets
    '/assets/bot-logo.svg',
    '/sw.js'
  ],
  
  testConfig: {
    concurrentRequests: 10,
    totalRequests: 100,
    requestTimeout: 10000, // 10 seconds
    warmupRequests: 5,
    cooldownDelay: 1000
  },
  
  thresholds: {
    responseTime: 500, // ms
    errorRate: 5, // %
    p95ResponseTime: 1000, // ms
    throughput: 20 // requests/second
  }
};

// Performance metrics storage
const metrics = {
  requests: [],
  errors: [],
  startTime: 0,
  endTime: 0
};

// Utility functions
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        resolve({
          url,
          statusCode: res.statusCode,
          duration,
          headers: res.headers,
          bodySize: Buffer.byteLength(data),
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (error) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      resolve({
        url,
        statusCode: 0,
        duration,
        error: error.message,
        success: false
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      resolve({
        url,
        statusCode: 408,
        duration,
        error: 'Request timeout',
        success: false
      });
    });
    
    req.setTimeout(timeout);
  });
}

function calculateStats(values) {
  if (values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;
  
  return {
    min: sorted[0],
    max: sorted[len - 1],
    avg: values.reduce((a, b) => a + b, 0) / len,
    p50: sorted[Math.floor(len * 0.5)],
    p95: sorted[Math.floor(len * 0.95)],
    p99: sorted[Math.floor(len * 0.99)]
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function warmupTest() {
  console.log('🔥 Starting warmup requests...');
  
  const warmupUrl = `${CONFIG.baseUrl}/api/health`;
  const warmupPromises = [];
  
  for (let i = 0; i < CONFIG.testConfig.warmupRequests; i++) {
    warmupPromises.push(makeRequest(warmupUrl, CONFIG.testConfig.requestTimeout));
    await sleep(200); // Stagger requests
  }
  
  const results = await Promise.all(warmupPromises);
  const successCount = results.filter(r => r.success).length;
  
  console.log(`✅ Warmup complete: ${successCount}/${results.length} successful`);
  
  if (successCount === 0) {
    throw new Error('All warmup requests failed. Server may be down.');
  }
}

async function singleEndpointTest(endpoint) {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  const results = [];
  const errors = [];
  
  console.log(`🎯 Testing ${endpoint}...`);
  
  // Generate test requests
  const promises = [];
  const requestsPerEndpoint = Math.ceil(CONFIG.testConfig.totalRequests / CONFIG.endpoints.length);
  
  for (let i = 0; i < requestsPerEndpoint; i++) {
    promises.push(makeRequest(url, CONFIG.testConfig.requestTimeout));
    
    // Add slight delay between requests to avoid overwhelming
    if (i > 0 && i % CONFIG.testConfig.concurrentRequests === 0) {
      await sleep(100);
    }
  }
  
  // Execute requests with controlled concurrency
  const batches = [];
  for (let i = 0; i < promises.length; i += CONFIG.testConfig.concurrentRequests) {
    batches.push(promises.slice(i, i + CONFIG.testConfig.concurrentRequests));
  }
  
  for (const batch of batches) {
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    
    // Track errors
    batchResults.forEach(result => {
      if (!result.success) {
        errors.push({
          url: result.url,
          error: result.error || `HTTP ${result.statusCode}`,
          duration: result.duration
        });
      }
    });
    
    await sleep(CONFIG.testConfig.cooldownDelay / batches.length);
  }
  
  return { results, errors };
}

async function loadTest() {
  console.log(`🚀 Starting load test with ${CONFIG.testConfig.totalRequests} requests across ${CONFIG.endpoints.length} endpoints`);
  console.log(`📊 Concurrency: ${CONFIG.testConfig.concurrentRequests}, Timeout: ${CONFIG.testConfig.requestTimeout}ms\n`);
  
  metrics.startTime = performance.now();
  
  // Test each endpoint
  for (const endpoint of CONFIG.endpoints) {
    try {
      const { results, errors } = await singleEndpointTest(endpoint);
      
      metrics.requests.push(...results);
      metrics.errors.push(...errors);
      
      // Log endpoint summary
      const successCount = results.filter(r => r.success).length;
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const errorRate = ((results.length - successCount) / results.length) * 100;
      
      console.log(`   ✅ ${successCount}/${results.length} successful (${errorRate.toFixed(1)}% errors)`);
      console.log(`   ⏱️  Avg: ${avgDuration.toFixed(2)}ms\n`);
      
    } catch (error) {
      console.error(`❌ Failed to test ${endpoint}:`, error.message);
      
      metrics.errors.push({
        url: endpoint,
        error: error.message,
        duration: 0
      });
    }
  }
  
  metrics.endTime = performance.now();
}

function generateReport() {
  const totalRequests = metrics.requests.length;
  const successfulRequests = metrics.requests.filter(r => r.success);
  const errorRate = ((totalRequests - successfulRequests.length) / totalRequests) * 100;
  
  const durations = successfulRequests.map(r => r.duration);
  const stats = calculateStats(durations);
  
  const totalDuration = metrics.endTime - metrics.startTime;
  const throughput = totalRequests / (totalDuration / 1000);
  
  console.log('\n📊 PERFORMANCE TEST RESULTS');
  console.log('=' .repeat(50));
  console.log(`🎯 Target URL: ${CONFIG.baseUrl}`);
  console.log(`📈 Total Requests: ${totalRequests}`);
  console.log(`✅ Successful: ${successfulRequests.length}`);
  console.log(`❌ Failed: ${metrics.errors.length}`);
  console.log(`📊 Error Rate: ${errorRate.toFixed(2)}%`);
  console.log(`🚀 Throughput: ${throughput.toFixed(2)} req/sec`);
  console.log(`⏱️  Test Duration: ${(totalDuration / 1000).toFixed(2)}s`);
  
  if (stats) {
    console.log('\n⏱️  RESPONSE TIME STATISTICS');
    console.log('-'.repeat(30));
    console.log(`Min: ${stats.min.toFixed(2)}ms`);
    console.log(`Avg: ${stats.avg.toFixed(2)}ms`);
    console.log(`P50: ${stats.p50.toFixed(2)}ms`);
    console.log(`P95: ${stats.p95.toFixed(2)}ms`);
    console.log(`P99: ${stats.p99.toFixed(2)}ms`);
    console.log(`Max: ${stats.max.toFixed(2)}ms`);
  }
  
  // Performance analysis
  console.log('\n🎯 PERFORMANCE ANALYSIS');
  console.log('-'.repeat(25));
  
  const issues = [];
  
  if (errorRate > CONFIG.thresholds.errorRate) {
    issues.push(`❌ High error rate: ${errorRate.toFixed(2)}% (threshold: ${CONFIG.thresholds.errorRate}%)`);
  }
  
  if (stats && stats.avg > CONFIG.thresholds.responseTime) {
    issues.push(`⚠️  Slow average response: ${stats.avg.toFixed(2)}ms (threshold: ${CONFIG.thresholds.responseTime}ms)`);
  }
  
  if (stats && stats.p95 > CONFIG.thresholds.p95ResponseTime) {
    issues.push(`⚠️  Slow P95 response: ${stats.p95.toFixed(2)}ms (threshold: ${CONFIG.thresholds.p95ResponseTime}ms)`);
  }
  
  if (throughput < CONFIG.thresholds.throughput) {
    issues.push(`⚠️  Low throughput: ${throughput.toFixed(2)} req/sec (threshold: ${CONFIG.thresholds.throughput} req/sec)`);
  }
  
  if (issues.length === 0) {
    console.log('✅ All performance metrics within acceptable thresholds!');
  } else {
    console.log('Issues found:');
    issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  // Error details
  if (metrics.errors.length > 0) {
    console.log('\n❌ ERROR DETAILS');
    console.log('-'.repeat(15));
    
    const errorsByType = {};
    metrics.errors.forEach(error => {
      const key = error.error;
      errorsByType[key] = (errorsByType[key] || 0) + 1;
    });
    
    Object.entries(errorsByType).forEach(([error, count]) => {
      console.log(`  ${error}: ${count} occurrences`);
    });
  }
  
  // Endpoint-specific analysis
  console.log('\n📋 ENDPOINT ANALYSIS');
  console.log('-'.repeat(20));
  
  const endpointStats = {};
  CONFIG.endpoints.forEach(endpoint => {
    const url = `${CONFIG.baseUrl}${endpoint}`;
    const endpointRequests = metrics.requests.filter(r => r.url === url);
    
    if (endpointRequests.length > 0) {
      const successful = endpointRequests.filter(r => r.success);
      const durations = successful.map(r => r.duration);
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const errorRate = ((endpointRequests.length - successful.length) / endpointRequests.length) * 100;
      
      endpointStats[endpoint] = {
        requests: endpointRequests.length,
        errors: errorRate,
        avgDuration
      };
      
      const status = errorRate > 10 ? '❌' : avgDuration > CONFIG.thresholds.responseTime ? '⚠️' : '✅';
      console.log(`  ${status} ${endpoint}: ${avgDuration.toFixed(2)}ms avg, ${errorRate.toFixed(1)}% errors`);
    }
  });
  
  return {
    success: issues.length === 0,
    metrics: {
      totalRequests,
      successfulRequests: successfulRequests.length,
      errorRate,
      throughput,
      responseTime: stats,
      testDuration: totalDuration
    },
    issues,
    endpointStats
  };
}

// Main execution
async function main() {
  console.log('🧪 QUOTA-SAFE PERFORMANCE TEST');
  console.log('=' .repeat(35));
  console.log('Testing anonymous endpoints only - no MAU quota impact\n');
  
  try {
    // Warmup
    await warmupTest();
    await sleep(2000);
    
    // Main load test
    await loadTest();
    
    // Generate report
    const report = generateReport();
    
    // Exit with appropriate code
    process.exit(report.success ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⚠️  Test interrupted by user');
  if (metrics.requests.length > 0) {
    console.log('\nGenerating partial report...');
    metrics.endTime = performance.now();
    generateReport();
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Test terminated');
  process.exit(1);
});

// Run the test
main();