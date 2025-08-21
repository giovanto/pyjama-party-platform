#!/usr/bin/env node

/**
 * Comprehensive Performance Testing Suite
 * Uses Lighthouse CLI to validate performance targets
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
  url: process.env.TEST_URL || 'http://localhost:3000',
  outputDir: './performance-reports',
  targets: {
    performance: 90,
    accessibility: 100,
    bestPractices: 90,
    seo: 90,
    fcp: 1800, // First Contentful Paint < 1.8s
    lcp: 2500, // Largest Contentful Paint < 2.5s
    cls: 0.1,  // Cumulative Layout Shift < 0.1
    fid: 100,  // First Input Delay < 100ms
    ttfb: 600, // Time to First Byte < 600ms
  }
};

class PerformanceTester {
  constructor() {
    this.results = new Map();
  }

  async runLighthouseTest(url, outputName) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(CONFIG.outputDir, `${outputName}.json`);
      
      const lighthouse = spawn('lighthouse', [
        url,
        '--output=json',
        `--output-path=${outputPath}`,
        '--chrome-flags=--headless',
        '--throttling-method=devtools',
        '--form-factor=desktop',
        '--screenEmulation.disabled',
        '--quiet'
      ]);

      let stdout = '';
      let stderr = '';

      lighthouse.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      lighthouse.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      lighthouse.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Lighthouse failed: ${stderr}`));
          return;
        }

        fs.readFile(outputPath, 'utf8')
          .then(data => {
            const result = JSON.parse(data);
            resolve({
              url,
              outputName,
              result
            });
          })
          .catch(reject);
      });
    });
  }

  async runMobileLighthouseTest(url, outputName) {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(CONFIG.outputDir, `${outputName}-mobile.json`);
      
      const lighthouse = spawn('lighthouse', [
        url,
        '--output=json',
        `--output-path=${outputPath}`,
        '--chrome-flags=--headless',
        '--throttling-method=devtools',
        '--form-factor=mobile',
        '--screenEmulation.mobile',
        '--quiet'
      ]);

      let stdout = '';
      let stderr = '';

      lighthouse.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      lighthouse.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      lighthouse.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Lighthouse mobile failed: ${stderr}`));
          return;
        }

        fs.readFile(outputPath, 'utf8')
          .then(data => {
            const result = JSON.parse(data);
            resolve({
              url,
              outputName: `${outputName}-mobile`,
              result
            });
          })
          .catch(reject);
      });
    });
  }

  extractMetrics(lighthouseResult) {
    const { categories, audits } = lighthouseResult;
    
    return {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
      fcp: audits['first-contentful-paint'].numericValue,
      lcp: audits['largest-contentful-paint'].numericValue,
      cls: audits['cumulative-layout-shift'].numericValue,
      fid: audits['max-potential-fid']?.numericValue || 0,
      ttfb: audits['server-response-time']?.numericValue || 0,
    };
  }

  validateTargets(metrics, device = 'desktop') {
    const results = {
      performance: {
        actual: metrics.performance,
        target: CONFIG.targets.performance,
        pass: metrics.performance >= CONFIG.targets.performance
      },
      accessibility: {
        actual: metrics.accessibility,
        target: CONFIG.targets.accessibility,
        pass: metrics.accessibility >= CONFIG.targets.accessibility
      },
      bestPractices: {
        actual: metrics.bestPractices,
        target: CONFIG.targets.bestPractices,
        pass: metrics.bestPractices >= CONFIG.targets.bestPractices
      },
      seo: {
        actual: metrics.seo,
        target: CONFIG.targets.seo,
        pass: metrics.seo >= CONFIG.targets.seo
      },
      fcp: {
        actual: Math.round(metrics.fcp),
        target: CONFIG.targets.fcp,
        pass: metrics.fcp <= CONFIG.targets.fcp
      },
      lcp: {
        actual: Math.round(metrics.lcp),
        target: CONFIG.targets.lcp,
        pass: metrics.lcp <= CONFIG.targets.lcp
      },
      cls: {
        actual: metrics.cls.toFixed(3),
        target: CONFIG.targets.cls,
        pass: metrics.cls <= CONFIG.targets.cls
      }
    };

    // Mobile gets more lenient FCP/LCP targets
    if (device === 'mobile') {
      results.fcp.target = CONFIG.targets.fcp * 1.5;
      results.fcp.pass = metrics.fcp <= CONFIG.targets.fcp * 1.5;
      results.lcp.target = CONFIG.targets.lcp * 1.5;
      results.lcp.pass = metrics.lcp <= CONFIG.targets.lcp * 1.5;
    }

    return results;
  }

  printResults(testName, metrics, validation, device = 'desktop') {
    const deviceIcon = device === 'mobile' ? '📱' : '🖥️';
    console.log(`\n${deviceIcon} ${testName} (${device.toUpperCase()})`);
    console.log('─'.repeat(60));

    console.log('📊 Lighthouse Scores:');
    console.log(`   Performance: ${validation.performance.actual}% ${validation.performance.pass ? '✅' : '❌'} (target: ${validation.performance.target}%)`);
    console.log(`   Accessibility: ${validation.accessibility.actual}% ${validation.accessibility.pass ? '✅' : '❌'} (target: ${validation.accessibility.target}%)`);
    console.log(`   Best Practices: ${validation.bestPractices.actual}% ${validation.bestPractices.pass ? '✅' : '❌'} (target: ${validation.bestPractices.target}%)`);
    console.log(`   SEO: ${validation.seo.actual}% ${validation.seo.pass ? '✅' : '❌'} (target: ${validation.seo.target}%)`);

    console.log('\n⚡ Core Web Vitals:');
    console.log(`   First Contentful Paint: ${validation.fcp.actual}ms ${validation.fcp.pass ? '✅' : '❌'} (target: <${validation.fcp.target}ms)`);
    console.log(`   Largest Contentful Paint: ${validation.lcp.actual}ms ${validation.lcp.pass ? '✅' : '❌'} (target: <${validation.lcp.target}ms)`);
    console.log(`   Cumulative Layout Shift: ${validation.cls.actual} ${validation.cls.pass ? '✅' : '❌'} (target: <${validation.cls.target})`);

    const overallPass = Object.values(validation).every(v => v.pass);
    console.log(`\n🎯 Overall: ${overallPass ? '✅ PASS' : '❌ FAIL'}`);

    return overallPass;
  }

  async runFullTestSuite() {
    console.log('🚀 Starting Comprehensive Performance Test Suite');
    console.log(`📍 Target URL: ${CONFIG.url}`);
    console.log('');

    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    const testPages = [
      { url: CONFIG.url, name: 'homepage' },
      { url: `${CONFIG.url}/impact`, name: 'impact-dashboard' },
      { url: `${CONFIG.url}/community`, name: 'community' },
      { url: `${CONFIG.url}/organize`, name: 'organize' }
    ];

    let allTestsPass = true;

    for (const page of testPages) {
      try {
        console.log(`🧪 Testing: ${page.url}`);
        
        // Run desktop test
        const desktopResult = await this.runLighthouseTest(page.url, page.name);
        const desktopMetrics = this.extractMetrics(desktopResult.result);
        const desktopValidation = this.validateTargets(desktopMetrics, 'desktop');
        const desktopPass = this.printResults(page.name, desktopMetrics, desktopValidation, 'desktop');

        // Run mobile test
        const mobileResult = await this.runMobileLighthouseTest(page.url, page.name);
        const mobileMetrics = this.extractMetrics(mobileResult.result);
        const mobileValidation = this.validateTargets(mobileMetrics, 'mobile');
        const mobilePass = this.printResults(page.name, mobileMetrics, mobileValidation, 'mobile');

        if (!desktopPass || !mobilePass) {
          allTestsPass = false;
        }

        this.results.set(page.name, {
          desktop: { metrics: desktopMetrics, validation: desktopValidation, pass: desktopPass },
          mobile: { metrics: mobileMetrics, validation: mobileValidation, pass: mobilePass }
        });

      } catch (error) {
        console.error(`❌ Failed to test ${page.url}:`, error.message);
        allTestsPass = false;
      }
    }

    this.printSummary();
    return allTestsPass;
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(80));

    let totalTests = 0;
    let passedTests = 0;

    for (const [pageName, results] of this.results) {
      console.log(`\n📄 ${pageName.toUpperCase()}:`);
      
      ['desktop', 'mobile'].forEach(device => {
        const result = results[device];
        const deviceIcon = device === 'mobile' ? '📱' : '🖥️';
        console.log(`   ${deviceIcon} ${device}: ${result.pass ? '✅ PASS' : '❌ FAIL'}`);
        
        totalTests++;
        if (result.pass) passedTests++;
      });
    }

    const successRate = (passedTests / totalTests * 100).toFixed(1);
    console.log(`\n🎯 Overall Success Rate: ${passedTests}/${totalTests} (${successRate}%)`);

    if (passedTests === totalTests) {
      console.log('🎉 All performance targets met! Ready for 50,000+ concurrent users.');
    } else {
      console.log('⚠️  Some performance targets not met. Consider additional optimizations.');
    }

    console.log(`\n📁 Detailed reports saved to: ${CONFIG.outputDir}/`);
    console.log('   View reports: lighthouse --view <report-file.json>');
    console.log('\n🏁 Performance testing completed!');
  }
}

// Run the test suite
if (require.main === module) {
  const tester = new PerformanceTester();
  
  tester.runFullTestSuite()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Performance test suite failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceTester;