// Shared Playwright helpers for all test specs
const { chromium } = require('playwright');

const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE_URL  = 'http://localhost:8890/test/test-index.html';

const TEST_UID   = 'test-user-123';
const TEST_EMAIL = 'tester@test.com';

const SEED_ENVELOPES = [
  { id: 'food-drink',  label: '飲食',   emoji: '🍜', color: '#FF8FAB', bg: '#FFE5EC', total: 8000, vault: 0, cats: ['food', 'drink'] },
  { id: 'transport',   label: '交通',   emoji: '🚌', color: '#A8D8F0', bg: '#E0F2FA', total: 5000, vault: 0, cats: ['transport'] },
  { id: 'shop-fun',    label: '購物娛樂', emoji: '🛍️', color: '#C9B8F0', bg: '#EFE9FF', total: 8000, vault: 0, cats: ['shop', 'fun', 'beauty'] },
  { id: 'home-health', label: '生活',   emoji: '🏠', color: '#9DD6B0', bg: '#E2F4E8', total: 6000, vault: 0, cats: ['home', 'health'] },
  { id: 'other',       label: '其他',   emoji: '✨', color: '#FFD66B', bg: '#FFF4D1', total: 3000, vault: 0, cats: ['study', 'gift', 'travel'] },
];

const SEED_CATS = [
  { id: 'food',       label: '飲食', color: '#FF8FAB', bg: '#FFE5EC', on: true, type: 'expense' },
  { id: 'drink',      label: '飲料', color: '#FFB97A', bg: '#FFE9D6', on: true, type: 'expense' },
  { id: 'transport',  label: '交通', color: '#A8D8F0', bg: '#E0F2FA', on: true, type: 'expense' },
  { id: 'shop',       label: '購物', color: '#C9B8F0', bg: '#EFE9FF', on: true, type: 'expense' },
  { id: 'fun',        label: '玩樂', color: '#FFD66B', bg: '#FFF4D1', on: true, type: 'expense' },
  { id: 'beauty',     label: '美妝', color: '#F590BB', bg: '#FFE0EE', on: true, type: 'expense' },
  { id: 'home',       label: '居家', color: '#9DD6B0', bg: '#E2F4E8', on: true, type: 'expense' },
  { id: 'health',     label: '醫療', color: '#F08A8A', bg: '#FFE0E0', on: true, type: 'expense' },
  { id: 'study',      label: '學習', color: '#7FBEE0', bg: '#DDF0FA', on: true, type: 'expense' },
  { id: 'gift',       label: '禮物', color: '#E891C7', bg: '#FBE0F0', on: true, type: 'expense' },
  { id: 'travel',     label: '旅遊', color: '#7DCBC4', bg: '#D8F0EE', on: true, type: 'expense' },
  { id: 'salary',     label: '薪水', color: '#7DCBA8', bg: '#D8F0E2', on: true, type: 'income' },
  // Custom categories for testing
  { id: 'custom-aaa', label: '娛樂+', color: '#FF8FAB', bg: '#FFE5EC', on: true, type: 'expense' },
  { id: 'custom-bbb', label: '寵物',  color: '#A8D8F0', bg: '#E0F2FA', on: true, type: 'expense' },
];

const SEED_TRANSACTIONS = [
  { amount: 280,   type: 'expense', cat: 'food',      date: '2026-05-24', note: '午餐',   envelope: 'food-drink', createdAt: 1748044800000 },
  { amount: 60,    type: 'expense', cat: 'drink',     date: '2026-05-24', note: '珍奶',   envelope: 'food-drink', createdAt: 1748044700000 },
  { amount: 50,    type: 'expense', cat: 'transport', date: '2026-05-23', note: '捷運',   envelope: 'transport',  createdAt: 1747958400000 },
  { amount: 500,   type: 'expense', cat: 'shop',      date: '2026-05-22', note: '衣服',   envelope: 'shop-fun',   createdAt: 1747872000000 },
  { amount: 45000, type: 'income',  cat: 'salary',    date: '2026-05-05', note: '薪水',   envelope: null,         createdAt: 1746432000000 },
];

async function launch() {
  return chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

async function openApp(browser, opts = {}) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

  // Wait for Babel to compile categories.jsx + firebase-mock.js to load
  // NOTE: Playwright waitForFunction(fn, arg, options) — pass null as arg
  await page.waitForFunction(() => typeof window.CATEGORIES !== 'undefined', null, { timeout: 20000 });
  await page.waitForFunction(() => typeof window.__test__ !== 'undefined',   null, { timeout: 5000 });

  // Wait for app.jsx to compile and React to mount (spinner ✿ should appear)
  await page.waitForFunction(
    () => { const r = document.getElementById('root'); return r && r.textContent.length > 0; },
    null, { timeout: 20000 }
  );

  if (opts.seed !== false) {
    const uid = TEST_UID;
    await page.evaluate(({ uid, envelopes, cats, txns }) => {
      // Mark onboarding complete via localStorage (fast path in app.jsx)
      try { localStorage.setItem('onboardingDone', '1'); } catch {}

      // Seed all Firestore documents before triggering login
      window.__test__.seedDoc(`users/${uid}`, {
        displayName: 'Tester', email: 'tester@test.com', createdAt: Date.now(),
      });
      window.__test__.seedDoc(`users/${uid}/settings/profile`, {
        name: '小桃', fur: 'default', accessory: null, level: 1, exp: 0,
        createdAt: Date.now(),
      });
      window.__test__.seedDoc(`users/${uid}/settings/budget`, {
        total: 30000, warnAt: 80, remindOn: true, envelopes,
      });
      window.__test__.seedDoc(`users/${uid}/settings/categories`, { cats });
      txns.forEach((tx, i) => {
        window.__test__.seedDoc(`users/${uid}/transactions/tx-${i}`, tx);
      });
    }, { uid, envelopes: SEED_ENVELOPES, cats: SEED_CATS, txns: SEED_TRANSACTIONS });
  }

  // Log in — fires onAuthStateChanged in app.jsx
  await page.evaluate(({ uid, email }) => {
    window.__test__.login(uid, email, 'Tester');
  }, { uid: TEST_UID, email: TEST_EMAIL });

  // Wait for home screen content (bottom nav labels should appear)
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      return text.includes('首頁') || text.includes('統計') || text.length > 200;
    },
    null, { timeout: 15000 }
  );

  // Wait for CATEGORIES to be updated from seeded Firestore (async get() in app.jsx)
  await page.waitForFunction(
    () => window.CATEGORIES.some(c => c.id.startsWith('custom-')),
    null, { timeout: 5000 }
  ).catch(() => {}); // non-fatal

  await page.waitForTimeout(400);

  return { page, errors };
}

function assert(condition, message) {
  if (!condition) throw new Error('ASSERTION FAILED: ' + message);
}

module.exports = {
  launch, openApp, assert,
  CHROMIUM, BASE_URL, TEST_UID, TEST_EMAIL,
  SEED_ENVELOPES, SEED_CATS, SEED_TRANSACTIONS,
};
