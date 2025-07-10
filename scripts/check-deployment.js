#!/usr/bin/env node
/**
 * Deployment Check Script for Pajama Party Platform
 * Validates configuration and common deployment issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking deployment configuration...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  'vercel.json',
  'src/components/layout/index.ts',
  'src/components/forms/index.ts',
  'src/components/map/index.ts',
  'src/components/community/index.ts'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
  }
});

// Check tsconfig.json configuration
console.log('\n🔧 Checking tsconfig.json configuration:');
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  
  if (tsconfig.compilerOptions?.baseUrl) {
    console.log(`✅ baseUrl: ${tsconfig.compilerOptions.baseUrl}`);
  } else {
    console.log('❌ baseUrl not set');
  }
  
  if (tsconfig.compilerOptions?.paths?.['@/*']) {
    console.log(`✅ @/* path alias: ${tsconfig.compilerOptions.paths['@/*']}`);
  } else {
    console.log('❌ @/* path alias not configured');
  }
} catch (error) {
  console.log('❌ Error reading tsconfig.json:', error.message);
}

// Check component exports
console.log('\n📦 Checking component exports:');
const componentDirs = ['layout', 'forms', 'map', 'community'];

componentDirs.forEach(dir => {
  const indexPath = `src/components/${dir}/index.ts`;
  if (fs.existsSync(indexPath)) {
    try {
      const content = fs.readFileSync(indexPath, 'utf8');
      const exportCount = (content.match(/export/g) || []).length;
      console.log(`✅ ${dir}/index.ts - ${exportCount} exports`);
    } catch (error) {
      console.log(`❌ ${dir}/index.ts - Error reading file`);
    }
  }
});

// Check imports in main files
console.log('\n🔗 Checking imports in main files:');
const mainFiles = ['app/layout.tsx', 'app/page.tsx'];

mainFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const imports = content.match(/from ['"]@\/[^'"]+['"]/g) || [];
      console.log(`✅ ${file} - ${imports.length} @/ imports`);
      imports.forEach(imp => console.log(`    ${imp}`));
    } catch (error) {
      console.log(`❌ ${file} - Error reading file`);
    }
  }
});

// Check Node.js version compatibility
console.log('\n🚀 Checking Node.js compatibility:');
const nodeVersion = process.version;
console.log(`Current Node.js: ${nodeVersion}`);

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.engines?.node) {
  console.log(`Required Node.js: ${packageJson.engines.node}`);
} else {
  console.log('⚠️  No Node.js version constraint specified');
}

console.log('\n✅ Deployment check complete!');
console.log('\n💡 If Vercel deployment still fails:');
console.log('1. Check Vercel build logs for specific error details');
console.log('2. Ensure environment variables are set correctly');
console.log('3. Verify that all dependencies are in package.json');
console.log('4. Check for case-sensitivity issues in file names');