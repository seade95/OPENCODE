// Run all EduVerse test suites
console.log('========================================');
console.log('  EduVerse Test Suite Runner');
console.log('========================================\n');

// ===== UNIT TESTS =====
console.log('--- UNIT TESTS ---');
try {
  require('./unit-tests.js');
} catch (e) {
  console.error('Unit tests failed to run:', e.message);
}

console.log('\n');

// ===== INTEGRATION TESTS =====
console.log('--- INTEGRATION TESTS ---');
try {
  require('./integration-tests.js');
} catch (e) {
  console.error('Integration tests failed to run:', e.message);
}

console.log('\n========================================');
console.log('  All test suites completed');
console.log('========================================');
console.log('\nNOTE: Playwright E2E tests require:');
console.log('  npm install @playwright/test');
console.log('  npx playwright install chromium');
console.log('  npx playwright test tests/playwright-tests.spec.js');
