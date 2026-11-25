// Run all EduVerse test suites
// Each suite runs in its own Node process so a failure or a lingering timer
// in one suite cannot abort or block the others.
const { spawnSync } = require('child_process');
const path = require('path');

const suites = [
  { name: 'UNIT TESTS', file: 'unit-tests.js' },
  { name: 'INTEGRATION TESTS', file: 'integration-tests.js' },
  { name: 'FEATURE TESTS', file: 'feature-tests.js' },
];

console.log('========================================');
console.log('  EduVerse Test Suite Runner');
console.log('========================================\n');

let failedSuites = 0;

suites.forEach(function(suite) {
  console.log(`--- ${suite.name} ---`);
  const result = spawnSync(process.execPath, [path.join(__dirname, suite.file)], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    failedSuites++;
    console.error(`  ${suite.name} failed${result.status === null ? ' to start' : ''}\n`);
  }
  console.log('');
});

console.log('========================================');
console.log(`  ${suites.length - failedSuites}/${suites.length} suites passed`);
console.log('========================================');
console.log('\nNOTE: Playwright E2E tests require:');
console.log('  npm install @playwright/test');
console.log('  npx playwright install chromium');
console.log('  npx playwright test tests/playwright-tests.spec.js');

process.exit(failedSuites > 0 ? 1 : 0);
