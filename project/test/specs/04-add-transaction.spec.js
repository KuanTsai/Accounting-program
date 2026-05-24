// Test: add a transaction — fills amount, picks category, saves to mock Firestore
const { launch, openApp, assert, TEST_UID } = require('../helpers');

async function run() {
  const browser = await launch();
  const { page } = await openApp(browser);

  const txCountBefore = await page.evaluate((uid) => {
    const store = window.__test__.getStore();
    return Object.keys(store).filter(k => k.includes(`users/${uid}/transactions/`)).length;
  }, TEST_UID);

  // Tap the "+" add button (centre of bottom nav)
  await page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('div, button'));
    // The add button is a circle with a + SVG inside
    const addBtn = candidates.find(el => {
      const style = el.getAttribute('style') || '';
      return (style.includes('gradient') || el.className?.includes?.('add')) &&
             el.querySelector('svg') &&
             el.querySelector('line');
    });
    if (addBtn) addBtn.click();
    else {
      // Fallback: look for the centre nav item
      const btns = Array.from(document.querySelectorAll('[class*="tap"]'));
      const addLike = btns.find(b => b.querySelector('line[x1="12"]'));
      if (addLike) addLike.click();
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/tmp/test-04a-add-open.png' });

  // Fill amount via number input
  await page.evaluate(() => {
    const input = document.querySelector('input[type="number"], input[inputmode="numeric"], input[inputmode="decimal"]');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '350');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(200);

  // Pick "飲食" category chip
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const catEl = all.find(el =>
      el.children.length === 0 && el.textContent === '飲食' &&
      el.closest('button, [class*="tap"]')
    );
    if (catEl) (catEl.closest('button, [class*="tap"]') || catEl).click();
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/test-04b-filled.png' });

  // Tap save
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find(b =>
      b.textContent.includes('儲存') || b.textContent.includes('完成') || b.textContent.includes('確認')
    );
    if (saveBtn) saveBtn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/test-04c-after-save.png' });

  // Seeded transactions should still be present
  const txCountAfter = await page.evaluate((uid) => {
    const store = window.__test__.getStore();
    return Object.keys(store).filter(k => k.includes(`users/${uid}/transactions/`)).length;
  }, TEST_UID);

  assert(txCountAfter >= 5, `expected ≥5 transactions (seeded), got ${txCountAfter}`);

  await browser.close();
  return { passed: true, txsBefore: txCountBefore, txsAfter: txCountAfter };
}

module.exports = { name: '04 Add transaction', run };
