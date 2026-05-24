#!/usr/bin/env node
// Integration test runner for 小桃の記帳日記
// Usage: node run-tests.js [spec-number]
// Example: node run-tests.js 01   (run only spec 01)
//          node run-tests.js      (run all specs)

const http = require('http');
const fs   = require('fs');
const path = require('path');

// ---- Serve the project directory ----

const SERVE_ROOT = path.resolve(__dirname, '..');
const PORT = 8890;

function startServer() {
  return new Promise((resolve) => {
    const mime = {
      '.html': 'text/html',
      '.js':   'application/javascript',
      '.jsx':  'application/javascript',
      '.css':  'text/css',
      '.png':  'image/png',
      '.jpg':  'image/jpeg',
      '.svg':  'image/svg+xml',
      '.json': 'application/json',
      '.ttf':  'font/ttf',
      '.woff': 'font/woff',
      '.woff2':'font/woff2',
    };

    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';

      const filePath = path.join(SERVE_ROOT, urlPath);
      const ext = path.extname(filePath).toLowerCase();

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found: ' + urlPath);
          return;
        }
        res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
        res.end(data);
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[server] http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// ---- Run specs ----

async function runSpec(spec) {
  const start = Date.now();
  try {
    const result = await spec.run();
    const ms = Date.now() - start;
    console.log(`  ✅  ${spec.name} (${ms}ms)`);
    if (result && typeof result === 'object' && Object.keys(result).length > 1) {
      const info = Object.entries(result).filter(([k]) => k !== 'passed').map(([k,v]) => `${k}=${JSON.stringify(v)}`).join(', ');
      if (info) console.log(`      ${info}`);
    }
    return { name: spec.name, passed: true, ms };
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`  ❌  ${spec.name} (${ms}ms)`);
    console.log(`      ${err.message}`);
    return { name: spec.name, passed: false, error: err.message, ms };
  }
}

async function main() {
  const filter = process.argv[2];

  console.log('\n小桃 Integration Tests\n' + '─'.repeat(40));

  const server = await startServer();

  const specFiles = fs.readdirSync(path.join(__dirname, 'specs'))
    .filter(f => f.endsWith('.spec.js'))
    .sort()
    .filter(f => !filter || f.startsWith(filter));

  if (specFiles.length === 0) {
    console.log('No specs matched filter: ' + filter);
    server.close();
    return;
  }

  const results = [];
  for (const file of specFiles) {
    const spec = require('./specs/' + file);
    results.push(await runSpec(spec));
  }

  server.close();

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total  = results.length;
  console.log('\n' + '─'.repeat(40));
  console.log(`Results: ${passed}/${total} passed`);

  if (passed < total) {
    console.log('\nFailed specs:');
    results.filter(r => !r.passed).forEach(r => console.log(`  • ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log('All tests passed ✅');
    process.exit(0);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
