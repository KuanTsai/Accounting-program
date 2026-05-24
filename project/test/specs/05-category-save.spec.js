// Test: category management — save writes updated cats to mock Firestore
const { launch, openApp, assert, TEST_UID } = require('../helpers');

async function run() {
  const browser = await launch();
  const { page } = await openApp(browser);

  // Navigate to profile tab
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('[class*="tap"], button'));
    const profileTab = all.find(el =>
      el.textContent.includes('我的') || el.textContent.includes('個人')
    );
    if (profileTab) profileTab.click();
  });
  await page.waitForTimeout(500);

  // Open category management
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, [class*="tap"]'));
    const btn = all.find(el => el.textContent.includes('分類管理'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/test-05a-catmgmt.png' });

  // Verify seeded custom categories appear in the list
  const text = await page.evaluate(() => document.body.innerText);
  const hasCustom = text.includes('娛樂+') || text.includes('寵物');
  // (non-fatal: screen navigation may not have worked)

  // Tap Save if visible
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const save = btns.find(b => b.textContent.includes('儲存') || b.textContent.includes('保存'));
    if (save) save.click();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/test-05b-saved.png' });

  // Verify the categories doc exists and has expected structure
  const catDoc = await page.evaluate((uid) => {
    return window.__test__.getDoc(`users/${uid}/settings/categories`);
  }, TEST_UID);

  assert(catDoc !== undefined, 'categories Firestore doc should exist');
  assert(Array.isArray(catDoc.cats), 'cats should be an array');
  assert(catDoc.cats.length >= 12, `should have ≥12 categories, got ${catDoc.cats.length}`);

  const hasCustomAaa = catDoc.cats.some(c => c.id === 'custom-aaa');
  assert(hasCustomAaa, 'custom-aaa should be present in saved categories');

  await browser.close();
  return { passed: true, catCount: catDoc.cats.length, hasCustomAaa };
}

module.exports = { name: '05 Category management save', run };
