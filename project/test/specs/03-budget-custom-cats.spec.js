// Test: CatBubble in budget screen renders text initial for custom categories
const { launch, openApp, assert } = require('../helpers');

async function run() {
  const browser = await launch();
  const { page } = await openApp(browser);

  // Verify CATEGORIES now includes custom-aaa (loaded from seeded Firestore)
  const catsLoaded = await page.evaluate(() =>
    window.CATEGORIES.some(c => c.id === 'custom-aaa')
  );
  assert(catsLoaded, 'custom-aaa should be in CATEGORIES after profile load');

  // Render CatBubble for built-in and custom IDs
  await page.evaluate(() => {
    const container = document.createElement('div');
    container.id = '__bubbletest__';
    document.body.appendChild(container);

    const ids = ['food', 'drink', 'transport', 'shop', 'fun', 'beauty',
                 'home', 'health', 'study', 'gift', 'travel', 'salary',
                 'custom-aaa', 'custom-bbb'];

    ReactDOM.createRoot(container).render(
      React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8, background: '#fff' } },
        ...ids.map(id => React.createElement('div', { key: id, 'data-catid': id },
          React.createElement(window.CatBubble, { id, size: 40 })
        ))
      )
    );
  });
  await page.waitForTimeout(500);

  const results = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll('[data-catid]').forEach(el => {
      const id = el.getAttribute('data-catid');
      const span = el.querySelector('span');
      const svg  = el.querySelector('svg');
      out[id] = span ? `span:${span.textContent}` : (svg ? 'svg' : 'empty');
    });
    return out;
  });

  await page.screenshot({ path: '/tmp/test-03-bubbles.png' });

  // Built-ins: SVG icons
  ['food','drink','transport','shop','fun','beauty','home','health','study','gift','travel','salary']
    .forEach(id => assert(results[id] === 'svg', `${id} should show SVG, got: ${results[id]}`));

  // Custom cats: first char of label
  assert(results['custom-aaa'] === 'span:娛', `custom-aaa should show span:娛, got: ${results['custom-aaa']}`);
  assert(results['custom-bbb'] === 'span:寵', `custom-bbb should show span:寵, got: ${results['custom-bbb']}`);

  await browser.close();
  return { passed: true, results };
}

module.exports = { name: '03 Budget screen — custom cat icons', run };
