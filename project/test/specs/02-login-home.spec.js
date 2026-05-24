// Test: mock login → home screen renders with seeded transactions
const { launch, openApp, assert } = require('../helpers');

async function run() {
  const browser = await launch();
  const { page, errors } = await openApp(browser);

  await page.screenshot({ path: '/tmp/test-02-home.png' });

  const text = await page.evaluate(() => document.body.innerText);

  // Should show bottom nav tabs
  assert(text.includes('首頁') || text.includes('統計'), 'bottom nav should be visible, got: ' + text.slice(0, 300));

  // Should NOT be stuck on login screen
  const onLogin = text.includes('電子郵件') && text.includes('密碼');
  assert(!onLogin, 'should not show login form after mock login');

  // Should NOT show onboarding
  const onBoarding = text.includes('歡迎') && text.includes('開始');
  assert(!onBoarding, 'should not show onboarding (profile already seeded)');

  // No crash-level JS errors
  const fatalErrors = errors.filter(e =>
    !e.includes('font') && !e.includes('404') &&
    !e.includes('favicon') && !e.includes('googleapis') &&
    !e.includes('ERR_CERT') && !e.includes('net::ERR') &&
    !e.includes('firebase') && !e.includes('firestore')
  );
  assert(fatalErrors.length === 0, 'unexpected JS errors:\n' + fatalErrors.join('\n'));

  await browser.close();
  return { passed: true, screenText: text.slice(0, 100).replace(/\n/g, ' ') };
}

module.exports = { name: '02 Login → Home screen', run };
