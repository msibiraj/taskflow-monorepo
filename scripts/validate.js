#!/usr/bin/env node

/**
 * TaskFlow Monorepo Structure Validator
 * Validates all files, folders, and configurations
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function header(msg) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${msg}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function checkPath(filepath, type = 'file') {
  const fullPath = path.join(process.cwd(), filepath);
  const exists = fs.existsSync(fullPath);
  
  if (!exists) {
    log(`  ❌ ${filepath} (missing)`, 'red');
    return { exists: false, valid: false };
  }
  
  const stats = fs.statSync(fullPath);
  const isCorrectType = type === 'file' ? stats.isFile() : stats.isDirectory();
  
  if (!isCorrectType) {
    log(`  ⚠️  ${filepath} (wrong type: expected ${type})`, 'yellow');
    return { exists: true, valid: false };
  }
  
  // Check file size for files
  if (type === 'file' && stats.size === 0) {
    log(`  ⚠️  ${filepath} (empty file)`, 'yellow');
    return { exists: true, valid: false };
  }
  
  log(`  ✅ ${filepath}`, 'green');
  return { exists: true, valid: true };
}

function validateSection(title, checks) {
  log(`\n📁 ${title}`, 'blue');
  let passed = 0;
  let total = 0;
  
  checks.forEach(check => {
    total++;
    const result = checkPath(check.path, check.type);
    if (result.valid) passed++;
  });
  
  return { passed, total };
}

function main() {
  log('\n', 'reset');
  header('🔍 TaskFlow Monorepo Validation');
  
  let totalPassed = 0;
  let totalChecks = 0;
  
  // Root structure
  const rootChecks = validateSection('Root Structure', [
    { path: 'package.json', type: 'file' },
    { path: 'README.md', type: 'file' },
    { path: '.gitignore', type: 'file' },
    { path: 'packages', type: 'directory' },
    { path: 'scripts', type: 'directory' },
    { path: 'docs', type: 'directory' }
  ]);
  totalPassed += rootChecks.passed;
  totalChecks += rootChecks.total;
  
  // Frontend
  const frontendChecks = validateSection('Frontend Package', [
    { path: 'packages/frontend/package.json', type: 'file' },
    { path: 'packages/frontend/index.html', type: 'file' },
    { path: 'packages/frontend/vite.config.js', type: 'file' },
    { path: 'packages/frontend/src/main.jsx', type: 'file' },
    { path: 'packages/frontend/src/App.jsx', type: 'file' },
    { path: 'packages/frontend/src/index.css', type: 'file' },
    { path: 'packages/frontend/src/components', type: 'directory' },
    { path: 'packages/frontend/src/pages', type: 'directory' },
    { path: 'packages/frontend/src/contexts', type: 'directory' },
    { path: 'packages/frontend/src/services', type: 'directory' }
  ]);
  totalPassed += frontendChecks.passed;
  totalChecks += frontendChecks.total;
  
  // Backend
  const backendChecks = validateSection('Backend Package', [
    { path: 'packages/backend/package.json', type: 'file' },
    { path: 'packages/backend/.env.example', type: 'file' },
    { path: 'packages/backend/src/server.js', type: 'file' },
    { path: 'packages/backend/src/config', type: 'directory' },
    { path: 'packages/backend/src/controllers', type: 'directory' },
    { path: 'packages/backend/src/models', type: 'directory' },
    { path: 'packages/backend/src/routes', type: 'directory' },
    { path: 'packages/backend/src/middleware', type: 'directory' }
  ]);
  totalPassed += backendChecks.passed;
  totalChecks += backendChecks.total;
  
  // Browser Extension
  const extensionChecks = validateSection('Browser Extension', [
    { path: 'packages/browser-extension/manifest.json', type: 'file' },
    { path: 'packages/browser-extension/popup.html', type: 'file' },
    { path: 'packages/browser-extension/popup.js', type: 'file' },
    { path: 'packages/browser-extension/icons/icon16.png', type: 'file' },
    { path: 'packages/browser-extension/icons/icon48.png', type: 'file' },
    { path: 'packages/browser-extension/icons/icon128.png', type: 'file' },
    { path: 'packages/browser-extension/scripts', type: 'directory' }
  ]);
  totalPassed += extensionChecks.passed;
  totalChecks += extensionChecks.total;
  
  // Desktop Agent
  const agentChecks = validateSection('Desktop Agent', [
    { path: 'packages/desktop-agent/package.json', type: 'file' },
    { path: 'packages/desktop-agent/main.js', type: 'file' },
    { path: 'packages/desktop-agent/tracker.js', type: 'file' },
    { path: 'packages/desktop-agent/api-client.js', type: 'file' }
  ]);
  totalPassed += agentChecks.passed;
  totalChecks += agentChecks.total;
  
  // Summary
  const percentage = ((totalPassed / totalChecks) * 100).toFixed(1);
  const isPerfect = percentage === '100.0';
  const isGood = percentage >= 90;
  
  log('\n' + '='.repeat(60), 'cyan');
  
  if (isPerfect) {
    log(`✅ PERFECT! All ${totalChecks} checks passed (100%)`, 'green');
    log('🎉 Your monorepo is complete and ready to use!', 'green');
  } else if (isGood) {
    log(`⚠️  ${totalPassed}/${totalChecks} checks passed (${percentage}%)`, 'yellow');
    log('Almost there! Fix the missing items above.', 'yellow');
  } else {
    log(`❌ ${totalPassed}/${totalChecks} checks passed (${percentage}%)`, 'red');
    log('Please fix the missing/invalid items above.', 'red');
  }
  
  log('='.repeat(60) + '\n', 'cyan');
  
  if (!isPerfect) {
    log('💡 Next steps:', 'cyan');
    log('   1. Review the missing/invalid items above', 'reset');
    log('   2. Run: npm run setup', 'reset');
    log('   3. Run: npm run validate again\n', 'reset');
  } else {
    log('🚀 Ready to start:', 'cyan');
    log('   npm run dev          # Start backend + frontend', 'reset');
    log('   npm run dev:agent    # Start desktop agent', 'reset');
    log('   Load extension in Chrome\n', 'reset');
  }
  
  process.exit(isPerfect ? 0 : 1);
}

// Run validation
try {
  main();
} catch (error) {
  log(`\n❌ Validation error: ${error.message}\n`, 'red');
  process.exit(1);
}
