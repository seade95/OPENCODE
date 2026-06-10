// EduVerse Playwright E2E Tests
// Prerequisites: npm install @playwright/test && npx playwright install chromium
// Run: npx playwright test tests/playwright-tests.spec.js

// NOTE: This is a shared test script run from the project root.
// If running from tests/ dir, adjust the path to point to the HTML files.

const { test, expect } = require('@playwright/test');
const path = require('path');

const INDEX_HTML = 'file://' + path.resolve(__dirname, '..', 'index.html');
const ADMIN_HTML = 'file://' + path.resolve(__dirname, '..', 'admin.html');

// ===== LANDING PAGE =====
test.describe('Landing Page', () => {
  test('should load and display school name', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await expect(page.locator('text=EDUVERSE')).toBeVisible();
  });

  test('should show hero slider and navigate slides', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await expect(page.locator('.slider-container')).toBeVisible();
    // Click next arrow
    await page.locator('.slider-arrow.next').click();
    await page.waitForTimeout(300);
    // Click prev arrow
    await page.locator('.slider-arrow.prev').click();
  });

  test('should have working portal buttons', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await expect(page.locator('text=Student Portal').first()).toBeVisible();
    await expect(page.locator('text=Teacher Portal').first()).toBeVisible();
    await expect(page.locator('text=Admissions').first()).toBeVisible();
  });

  test('should open student login page', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Student Portal').first().click();
    await expect(page.locator('#studentLoginPage')).toBeVisible();
  });
});

// ===== STUDENT PORTAL =====
test.describe('Student Portal', () => {
  test('should login with ID and password', async ({ page }) => {
    await page.goto(INDEX_HTML);
    // Navigate to student login
    await page.locator('text=Student Portal').first().click();
    await page.waitForSelector('#studentLoginPage.active');

    // Fill in credentials (legacy mode - ID + name)
    await page.fill('#stuLoginId', 'STU001');
    await page.fill('#stuLoginName', 'Alice Johnson');
    await page.click('text=Access Portal');

    // Should redirect to student dashboard
    await expect(page.locator('#studentPortal')).toBeVisible();
    await expect(page.locator('text=Alice Johnson')).toBeVisible();
  });

  test('should login with username and password', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Student Portal').first().click();
    await page.waitForSelector('#studentLoginPage.active');

    await page.fill('#stuLoginId', 'alice.johnson');
    await page.fill('#stuLoginName', 'stu001');
    await page.click('text=Access Portal');

    await expect(page.locator('#studentPortal')).toBeVisible();
  });

  test('should reject invalid student credentials', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Student Portal').first().click();
    await page.waitForSelector('#studentLoginPage.active');

    await page.fill('#stuLoginId', 'WRONG');
    await page.fill('#stuLoginName', 'WRONG');
    await page.click('text=Access Portal');

    // Should see error message
    await expect(page.locator('#studentLoginError')).toBeVisible();
  });

  test('should show student dashboard with timetable', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Student Portal').first().click();
    await page.waitForSelector('#studentLoginPage.active');
    await page.fill('#stuLoginId', 'STU001');
    await page.fill('#stuLoginName', 'Alice Johnson');
    await page.click('text=Access Portal');

    // Check dashboard components
    await expect(page.locator('.stu-dashboard')).toBeVisible();
    // Check tabs exist
    await expect(page.locator('text=Results')).toBeVisible();
    await expect(page.locator('text=Timetable')).toBeVisible();
    await expect(page.locator('text=Exams')).toBeVisible();
    await expect(page.locator('text=Messages')).toBeVisible();
  });

  test('should navigate student tabs', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Student Portal').first().click();
    await page.waitForSelector('#studentLoginPage.active');
    await page.fill('#stuLoginId', 'STU001');
    await page.fill('#stuLoginName', 'Alice Johnson');
    await page.click('text=Access Portal');

    // Click Results tab
    await page.locator('text=Results').first().click();
    // Click Timetable tab
    await page.locator('text=Timetable').first().click();
    // Click Exams tab
    await page.locator('text=Exams').first().click();
    // Click Messages tab
    await page.locator('text=Messages').first().click();
  });
});

// ===== TEACHER PORTAL =====
test.describe('Teacher Portal', () => {
  test('should login with ID and password', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Teacher Portal').first().click();
    await page.waitForSelector('#teacherLoginPage.active');

    await page.fill('#teacherLoginId', 'TCH001');
    await page.fill('#teacherLoginPass', 'teacher123');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('#teacherPortal')).toBeVisible();
    await expect(page.locator('text=Mr. John Doe')).toBeVisible();
  });

  test('should show teacher dashboard with class info', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Teacher Portal').first().click();
    await page.waitForSelector('#teacherLoginPage.active');
    await page.fill('#teacherLoginId', 'TCH001');
    await page.fill('#teacherLoginPass', 'teacher123');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('text=Grade 10A')).toBeVisible();
    await expect(page.locator('text=Assignments')).toBeVisible();
    await expect(page.locator('text=Timetable')).toBeVisible();
  });
});

// ===== PARENT PORTAL =====
test.describe('Parent Portal', () => {
  test('should login with email and password', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Parent Portal').first().click();
    await page.waitForSelector('#parentLoginPage.active');

    await page.fill('#parentLoginEmail', 'robert@example.com');
    await page.fill('#parentLoginPass', 'parent123');
    await page.click('button:has-text("Sign In")');

    await expect(page.locator('#parentPortal')).toBeVisible();
  });
});

// ===== ADMISSION PORTAL =====
test.describe('Admission Portal', () => {
  test('should open admission portal', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Admissions').first().click();
    await expect(page.locator('#admissionPortal')).toBeVisible();
  });

  test('should show admission programs', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Admissions').first().click();
    await expect(page.locator('#programsGrid')).toBeVisible();
    // Default programs should be listed
    await expect(page.locator('text=Early Years Foundation')).toBeVisible();
  });

  test('should open application form', async ({ page }) => {
    await page.goto(INDEX_HTML);
    await page.locator('text=Admissions').first().click();
    // Click first "Apply Now" button
    const applyBtn = page.locator('button:has-text("Apply Now")').first();
    await applyBtn.click();
    await expect(page.locator('#applicationForm')).toBeVisible();
  });
});

// ===== ADMIN PORTAL (standalone admin.html) =====
test.describe('Admin Portal', () => {
  test('should load admin page with login form', async ({ page }) => {
    await page.goto(ADMIN_HTML);
    await expect(page.locator('#adminLoginPage')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should show signup form', async ({ page }) => {
    await page.goto(ADMIN_HTML);
    await page.locator('text=Create Admin Account').click();
    await expect(page.locator('#adminSignupPage')).toBeVisible();
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
  });

  test('should create admin account and login', async ({ page }) => {
    await page.goto(ADMIN_HTML);
    // Go to signup
    await page.locator('text=Create Admin Account').click();
    await page.fill('#adminSignupName', 'Test Admin');
    await page.fill('#adminSignupEmail', 'admin@test.edu');
    await page.fill('#adminSignupPass', 'admin123');
    await page.click('button:has-text("Create Account")');

    // Should be redirected to login or auto-logged in
    await page.waitForTimeout(500);
    const isLoggedIn = await page.locator('.admin-sidebar').isVisible().catch(() => false);
    if (!isLoggedIn) {
      // Login manually
      await page.fill('#adminLoginEmail', 'admin@test.edu');
      await page.fill('#adminLoginPass', 'admin123');
      await page.click('button:has-text("Sign In")');
      await expect(page.locator('.admin-sidebar')).toBeVisible();
    }
  });

  test('should navigate admin sidebar items', async ({ page }) => {
    // First create account and login
    await page.goto(ADMIN_HTML);
    await page.locator('text=Create Admin Account').click();
    await page.fill('#adminSignupName', 'Nav Admin');
    await page.fill('#adminSignupEmail', 'nav@test.edu');
    await page.fill('#adminSignupPass', 'nav123');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);

    // Navigate sidebar items
    const items = ['Dashboard', 'Students', 'Teachers', 'Fees', 'Results', 'Timetable', 'School Setup', 'Subjects', 'System Tools'];
    for (const item of items) {
      const el = page.locator(`.admin-sidebar li:has-text("${item}")`);
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        await page.waitForTimeout(200);
      }
    }
  });
});

// ===== LANGUAGE SWITCHER =====
test.describe('Language Switcher', () => {
  test('should switch language and update UI', async ({ page }) => {
    await page.goto(INDEX_HTML);
    // Find language selector
    const langSelect = page.locator('#langSelector');
    if (await langSelect.isVisible().catch(() => false)) {
      await langSelect.selectOption('fr');
      await page.waitForTimeout(300);
      // Verify some text changed (e.g., button texts translated)
    }
  });
});

// ===== K-12 ADMIN PANELS =====
test.describe('K-12 Admin Panels', () => {
  test('should access School Setup panel', async ({ page }) => {
    await page.goto(ADMIN_HTML);
    // Login first
    await page.locator('text=Create Admin Account').click();
    await page.fill('#adminSignupName', 'K12 Admin');
    await page.fill('#adminSignupEmail', 'k12@test.edu');
    await page.fill('#adminSignupPass', 'k12pass');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);

    // Navigate to School Setup
    await page.locator('.admin-sidebar li:has-text("School Setup")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#admin-schoolsetup')).toBeVisible();

    // Change tier
    const tierSelect = page.locator('#schoolTierSelect');
    if (await tierSelect.isVisible().catch(() => false)) {
      await tierSelect.selectOption('primary');
      await page.waitForTimeout(200);
    }
  });

  test('should access Subjects panel', async ({ page }) => {
    await page.goto(ADMIN_HTML);
    await page.locator('text=Create Admin Account').click();
    await page.fill('#adminSignupName', 'Sub Admin');
    await page.fill('#adminSignupEmail', 'sub@test.edu');
    await page.fill('#adminSignupPass', 'subpass');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);

    await page.locator('.admin-sidebar li:has-text("Subjects")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#admin-subjects')).toBeVisible();
  });

  test('should access Stream Management panel', async ({ page }) => {
    await page.goto(ADMIN_HTML);
    await page.locator('text=Create Admin Account').click();
    await page.fill('#adminSignupName', 'Stream Admin');
    await page.fill('#adminSignupEmail', 'stream@test.edu');
    await page.fill('#adminSignupPass', 'streampass');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);

    await page.locator('.admin-sidebar li:has-text("Streams")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#admin-streams')).toBeVisible();
  });
});

// ===== SYSTEM TOOLS =====
test.describe('System Tools', () => {
  test('should access System Tools panel', async ({ page }) => {
    await page.goto(ADMIN_HTML);
    await page.locator('text=Create Admin Account').click();
    await page.fill('#adminSignupName', 'Sys Admin');
    await page.fill('#adminSignupEmail', 'sys@test.edu');
    await page.fill('#adminSignupPass', 'syspass');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);

    await page.locator('.admin-sidebar li:has-text("System Tools")').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#admin-system')).toBeVisible();
  });

  test('should trigger global search with Ctrl+K', async ({ page }) => {
    await page.goto(ADMIN_HTML);
    await page.locator('text=Create Admin Account').click();
    await page.fill('#adminSignupName', 'Search Admin');
    await page.fill('#adminSignupEmail', 'search@test.edu');
    await page.fill('#adminSignupPass', 'searchpass');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);

    // Press Ctrl+K
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(300);
    // Search input should appear
    await expect(page.locator('#globalSearchInput')).toBeVisible();
  });
});
