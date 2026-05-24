// Test: CatBubble renders SVG for built-ins, text initial for custom IDs
const { launch, assert } = require('../helpers');
const { chromium } = require('playwright');

const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });

  await page.goto('http://localhost:8890/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  // Load categories.jsx directly for unit-style rendering
  await page.goto('http://localhost:8890/test-catbubble.html', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});

  // Fall back: load test-index to get categories.jsx compiled
  await page.goto('http://localhost:8890/test/test-index.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForFunction(() => typeof window.CatBubble !== 'undefined', { timeout: 15000 });
  await page.waitForFunction(() => typeof window.CATEGORIES !== 'undefined', { timeout: 5000 });

  // Inject custom categories and render into a test container
  await page.evaluate(() => {
    window.CATEGORIES.push(
      { id: 'custom-1111', label: '娛樂', color: '#FF8FAB', bg: '#FFE5EC' },
      { id: 'custom-2222', label: '寵物', color: '#A8D8F0', bg: '#E0F2FA' },
    );

    const container = document.createElement('div');
    container.id = '__catbubble_test__';
    document.body.appendChild(container);

    const items = [
      'food', 'drink', 'transport', 'shop', 'fun', 'beauty',
      'home', 'health', 'study', 'gift', 'travel', 'salary',
      'custom-1111', 'custom-2222',
    ].map(id =>
      React.createElement('div', { key: id, 'data-catid': id },
        React.createElement(window.CatBubble, { id, size: 40 })
      )
    );

    ReactDOM.createRoot(container).render(React.createElement('div', null, ...items));
  });

  await page.waitForTimeout(600);

  const results = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-catid]').forEach(el => {
      const id = el.getAttribute('data-catid');
      const span = el.querySelector('span');
      const svg  = el.querySelector('svg');
      out[id] = span ? { type: 'span', text: span.textContent } : (svg ? { type: 'svg' } : { type: 'empty' });
    });
    return out;
  });

  const builtins = ['food','drink','transport','shop','fun','beauty','home','health','study','gift','travel','salary'];
  builtins.forEach(id => {
    assert(results[id]?.type === 'svg', `built-in "${id}" should render SVG, got: ${JSON.stringify(results[id])}`);
  });

  assert(results['custom-1111']?.type === 'span', 'custom-1111 should render span');
  assert(results['custom-1111']?.text === '娛', `custom-1111 first char should be 娛, got "${results['custom-1111']?.text}"`);
  assert(results['custom-2222']?.type === 'span', 'custom-2222 should render span');
  assert(results['custom-2222']?.text === '寵', `custom-2222 first char should be 寵, got "${results['custom-2222']?.text}"`);

  await page.screenshot({ path: '/tmp/test-01-catbubble.png', fullPage: false });
  await browser.close();

  return { passed: true, results };
}

module.exports = { name: '01 CatBubble icons', run };
