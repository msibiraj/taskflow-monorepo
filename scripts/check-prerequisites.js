#!/usr/bin/env node

/**
 * Check system prerequisites before installation
 */

const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function check(command, name, required = true) {
  try {
    execSync(command, { stdio: 'ignore' });
    console.log(`${colors.green}✅ ${name} found${colors.reset}`);
    return true;
  } catch (error) {
    if (required) {
      console.log(`${colors.red}❌ ${name} not found${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  ${name} not found (optional)${colors.reset}`);
    }
    return false;
  }
}

console.log('\n🔍 Checking prerequisites...\n');

const hasNode = check('node --version', 'Node.js', true);
const hasNpm = check('npm --version', 'npm', true);
const hasMongo = check('mongod --version', 'MongoDB', false);

console.log('');

if (!hasNode || !hasNpm) {
  console.log(`${colors.red}❌ Missing required tools. Please install:${colors.reset}`);
  if (!hasNode) console.log('   Node.js: https://nodejs.org/');
  if (!hasNpm) console.log('   npm: Comes with Node.js');
  console.log('');
  process.exit(1);
}

if (!hasMongo) {
  console.log(`${colors.yellow}⚠️  MongoDB not detected${colors.reset}`);
  console.log('   Install: sudo apt install mongodb (Linux)');
  console.log('   Or: brew install mongodb-community (Mac)');
  console.log('');
}

console.log(`${colors.green}✅ Prerequisites check complete!${colors.reset}\n`);
