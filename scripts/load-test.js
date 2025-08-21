#!/usr/bin/env node

/**
 * Load Testing Script for Pajama Party Platform
 * Tests performance under high concurrent load (50,000+ users)
 */

const https = require('https');
const http = require('http');
const { performance } = require('perf_hooks');

const CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  totalUsers: parseInt(process.env.CONCURRENT_USERS) || 1000,
  rampUpTime: parseInt(process.env.RAMP_UP_TIME) || 60, // seconds
  testDuration: parseInt(process.env.TEST_DURATION) || 300, // seconds
  maxConcurrent: parseInt(process.env.MAX_CONCURRENT) || 100,
};

// Test scenarios
const SCENARIOS = [
  {
    name: 'Homepage Load',
    weight: 40,
    path: '/',
    method: 'GET'
  },
  {
    name: 'Dreams API',
    weight: 30,
    path: '/api/dreams?limit=100',
    method: 'GET'
  },
  {
    name: 'Stats API', 
    weight: 15,
    path: '/api/stats',
    method: 'GET'
  },
  {
    name: 'Dream Submission',
    weight: 15,
    path: '/api/dreams',
    method: 'POST',
    data: {
      from: 'Berlin, Germany',
      to: 'Barcelona, Spain',
      dreamerName: 'Load Test User',
      why: 'Load testing the application',
      routeType: 'overnight',
      travelPurpose: 'leisure'
    }
  }
];

class LoadTester {
  constructor() {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimeSum: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      responseTimeP95: 0,
      responseTimeP99: 0,
      responses: [],
      errorTypes: new Map(),
      scenarioStats: new Map()
    };

    this.activeRequests = 0;
    this.startTime = null;
    this.isRunning = false;
  }

  async makeRequest(scenario) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const url = new URL(scenario.path, CONFIG.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: scenario.method,
        headers: {
          'User-Agent': 'PajamaParty-LoadTest/1.0',
          'Accept': 'application/json',
          ...(scenario.method === 'POST' && {
            'Content-Type': 'application/json'
          })
        }
      };

      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          this.recordResponse(scenario.name, res.statusCode, responseTime, null);
          resolve();
        });
      });

      req.on('error', (err) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.recordResponse(scenario.name, 0, responseTime, err);
        resolve();
      });

      req.setTimeout(30000, () => {
        req.destroy();
        this.recordResponse(scenario.name, 0, 30000, new Error('Timeout'));
        resolve();
      });

      if (scenario.data) {
        req.write(JSON.stringify(scenario.data));
      }
      
      req.end();
    });
  }

  recordResponse(scenarioName, statusCode, responseTime, error) {
    this.activeRequests--;
    this.stats.totalRequests++;
    
    if (error || statusCode >= 400) {
      this.stats.failedRequests++;
      const errorType = error ? error.message : `HTTP ${statusCode}`;
      this.stats.errorTypes.set(errorType, (this.stats.errorTypes.get(errorType) || 0) + 1);
    } else {
      this.stats.successfulRequests++;
    }

    this.stats.responseTimeSum += responseTime;
    this.stats.minResponseTime = Math.min(this.stats.minResponseTime, responseTime);
    this.stats.maxResponseTime = Math.max(this.stats.maxResponseTime, responseTime);
    this.stats.responses.push(responseTime);

    // Update scenario stats
    if (!this.stats.scenarioStats.has(scenarioName)) {
      this.stats.scenarioStats.set(scenarioName, {
        requests: 0,
        successful: 0,
        failed: 0,
        totalResponseTime: 0
      });
    }
    
    const scenarioStat = this.stats.scenarioStats.get(scenarioName);
    scenarioStat.requests++;
    scenarioStat.totalResponseTime += responseTime;
    
    if (error || statusCode >= 400) {
      scenarioStat.failed++;
    } else {
      scenarioStat.successful++;
    }
  }

  selectScenario() {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (const scenario of SCENARIOS) {
      cumulativeWeight += scenario.weight;
      if (random <= cumulativeWeight) {
        return scenario;
      }
    }
    
    return SCENARIOS[0];
  }

  async runTest() {
    console.log('🚀 Starting Load Test for Pajama Party Platform');
    console.log(`📊 Configuration:`);
    console.log(`   Base URL: ${CONFIG.baseUrl}`);
    console.log(`   Total Users: ${CONFIG.totalUsers}`);
    console.log(`   Ramp-up Time: ${CONFIG.rampUpTime}s`);
    console.log(`   Test Duration: ${CONFIG.testDuration}s`);
    console.log(`   Max Concurrent: ${CONFIG.maxConcurrent}`);
    console.log('');

    this.isRunning = true;
    this.startTime = Date.now();
    
    // Ramp up users gradually
    const usersPerSecond = CONFIG.totalUsers / CONFIG.rampUpTime;
    let usersSpawned = 0;

    const spawnInterval = setInterval(() => {
      if (!this.isRunning || usersSpawned >= CONFIG.totalUsers) {
        clearInterval(spawnInterval);
        return;
      }

      const usersToSpawn = Math.min(
        Math.ceil(usersPerSecond),
        CONFIG.totalUsers - usersSpawned,
        CONFIG.maxConcurrent - this.activeRequests
      );

      for (let i = 0; i < usersToSpawn; i++) {
        if (this.activeRequests < CONFIG.maxConcurrent) {
          this.spawnUser();
          usersSpawned++;
        }
      }
    }, 1000);

    // Status reporting
    const statusInterval = setInterval(() => {
      this.printStatus();
    }, 10000);

    // Stop test after duration
    setTimeout(() => {
      console.log('\n⏰ Test duration reached, stopping...');
      this.isRunning = false;
      clearInterval(spawnInterval);
      clearInterval(statusInterval);
      
      // Wait for remaining requests to complete
      const waitForCompletion = setInterval(() => {
        if (this.activeRequests === 0) {
          clearInterval(waitForCompletion);
          this.printFinalReport();
        }
      }, 1000);
    }, CONFIG.testDuration * 1000);
  }

  async spawnUser() {
    this.activeRequests++;
    
    while (this.isRunning) {
      const scenario = this.selectScenario();
      await this.makeRequest(scenario);
      
      // Random think time between 1-5 seconds
      if (this.isRunning) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 4000));
      }
    }
  }

  printStatus() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rps = this.stats.totalRequests / elapsed;
    const avgResponseTime = this.stats.responseTimeSum / this.stats.totalRequests || 0;
    const successRate = (this.stats.successfulRequests / this.stats.totalRequests * 100) || 0;

    console.log(`📈 Status (${Math.floor(elapsed)}s): ${this.stats.totalRequests} requests, ${rps.toFixed(2)} RPS, ${avgResponseTime.toFixed(0)}ms avg, ${successRate.toFixed(1)}% success, ${this.activeRequests} active`);
  }

  printFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 FINAL LOAD TEST REPORT');
    console.log('='.repeat(60));

    const duration = (Date.now() - this.startTime) / 1000;
    const avgResponseTime = this.stats.responseTimeSum / this.stats.totalRequests || 0;
    const successRate = (this.stats.successfulRequests / this.stats.totalRequests * 100) || 0;
    const rps = this.stats.totalRequests / duration;

    // Calculate percentiles
    this.stats.responses.sort((a, b) => a - b);
    const p95Index = Math.floor(this.stats.responses.length * 0.95);
    const p99Index = Math.floor(this.stats.responses.length * 0.99);
    this.stats.responseTimeP95 = this.stats.responses[p95Index] || 0;
    this.stats.responseTimeP99 = this.stats.responses[p99Index] || 0;

    console.log(`📊 Overall Performance:`);
    console.log(`   Duration: ${duration.toFixed(1)}s`);
    console.log(`   Total Requests: ${this.stats.totalRequests}`);
    console.log(`   Successful: ${this.stats.successfulRequests} (${successRate.toFixed(1)}%)`);
    console.log(`   Failed: ${this.stats.failedRequests}`);
    console.log(`   Requests/sec: ${rps.toFixed(2)}`);
    console.log('');

    console.log(`⏱️  Response Times:`);
    console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Min: ${this.stats.minResponseTime.toFixed(2)}ms`);
    console.log(`   Max: ${this.stats.maxResponseTime.toFixed(2)}ms`);
    console.log(`   P95: ${this.stats.responseTimeP95.toFixed(2)}ms`);
    console.log(`   P99: ${this.stats.responseTimeP99.toFixed(2)}ms`);
    console.log('');

    // Performance targets validation
    console.log(`🎯 Performance Targets:`);
    console.log(`   RPS Target (>100): ${rps > 100 ? '✅ PASS' : '❌ FAIL'} (${rps.toFixed(2)})`);
    console.log(`   Avg Response (<500ms): ${avgResponseTime < 500 ? '✅ PASS' : '❌ FAIL'} (${avgResponseTime.toFixed(2)}ms)`);
    console.log(`   P95 Response (<1000ms): ${this.stats.responseTimeP95 < 1000 ? '✅ PASS' : '❌ FAIL'} (${this.stats.responseTimeP95.toFixed(2)}ms)`);
    console.log(`   Success Rate (>99%): ${successRate > 99 ? '✅ PASS' : '❌ FAIL'} (${successRate.toFixed(1)}%)`);
    console.log('');

    // Scenario breakdown
    console.log(`📈 Scenario Performance:`);
    for (const [name, stats] of this.stats.scenarioStats) {
      const scenarioSuccessRate = (stats.successful / stats.requests * 100) || 0;
      const scenarioAvgTime = stats.totalResponseTime / stats.requests || 0;
      console.log(`   ${name}: ${stats.requests} req, ${scenarioSuccessRate.toFixed(1)}% success, ${scenarioAvgTime.toFixed(2)}ms avg`);
    }

    // Error breakdown
    if (this.stats.errorTypes.size > 0) {
      console.log('\n❌ Errors:');
      for (const [error, count] of this.stats.errorTypes) {
        console.log(`   ${error}: ${count}`);
      }
    }

    console.log('\n🏁 Load test completed!');
    
    // Exit with appropriate code
    const overallPass = rps > 100 && avgResponseTime < 500 && this.stats.responseTimeP95 < 1000 && successRate > 99;
    process.exit(overallPass ? 0 : 1);
  }
}

// Run the test
if (require.main === module) {
  const tester = new LoadTester();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, stopping test...');
    tester.isRunning = false;
  });

  tester.runTest().catch(console.error);
}

module.exports = LoadTester;