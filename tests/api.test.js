import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createApp } from '../server/app.js';

async function running(t, options = {}) {
  const server = createApp(options).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}
const row = { id: 1, title: 'Test ebook', description: 'Description', category: { value: 'ebook' }, language: { value: 'pl' }, price: '0.00', published: true, cover: [{ url: 'https://files.example.org/cover.jpg' }], file: [{ url: 'https://files.example.org/book.pdf', visible_name: 'book.pdf' }] };
const config = { BASEROW_TABLE_ID: '123', BASEROW_TOKEN: 'test-token', BASEROW_API_URL: 'https://api.baserow.io' };

test('health and missing Baserow configuration are explicit', async t => {
  const base = await running(t, { env: {} });
  assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { status: 'ok' });
  assert.deepEqual(await (await fetch(`${base}/api/products`)).json(), { status: 'not_configured', results: [], nextPage: null });
});
test('catalog authenticates upstream, hides drafts and paid files, caches and paginates', async t => {
  let calls = 0;
  const base = await running(t, { env: config, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url.origin, 'https://api.baserow.io');
    assert.equal(url.pathname, '/api/database/rows/table/123/');
    assert.equal(url.searchParams.get('user_field_names'), 'true');
    assert.equal(options.headers.Authorization, 'Token test-token');
    return Response.json({ results: [row, { ...row, id: 2, published: false }, { ...row, id: 3, price: '9.99' }, { ...row, id: 4, category: 'unknown' }], next: 'https://api.baserow.io/next' });
  } });
  const response = await fetch(`${base}/api/products`);
  const data = await response.json();
  assert.equal(data.results.length, 2);
  assert.equal(data.results[0].download, 'https://files.example.org/book.pdf');
  assert.equal(data.results[1].download, null);
  assert.equal(data.results[1].fileName, null);
  assert.equal(data.nextPage, 2);
  assert.ok(!JSON.stringify(data).includes('test-token'));
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  await fetch(`${base}/api/products`);
  assert.equal(calls, 1);
});
test('upstream failure never discloses upstream credentials or body', async t => {
  const base = await running(t, { env: config, fetchImpl: async () => new Response('test-token sensitive error', { status: 401 }) });
  const response = await fetch(`${base}/api/products`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'catalog_unavailable' });
});
test('invalid pages and unsafe file links are rejected', async t => {
  const base = await running(t, { env: config, fetchImpl: async () => Response.json({ results: [{ ...row, file: [{ url: 'javascript:alert(1)' }], cover: [{ url: 'http://insecure.example/a.jpg' }] }], next: null }) });
  assert.equal((await fetch(`${base}/api/products?page=-1`)).status, 400);
  assert.equal((await fetch(`${base}/api/products?page=101`)).status, 400);
  const data = await (await fetch(`${base}/api/products`)).json();
  assert.equal(data.results[0].download, null);
  assert.equal(data.results[0].cover, null);
  assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
});
test('SPA deep links and images are served by the production server', async t => {
  const base = await running(t, { env: {} });
  const response = await fetch(`${base}/polityka-prywatnosci`);
  assert.equal(response.status, 200);
  assert.ok((await response.text()).includes('<div id="root"></div>'));
  const image = await fetch(`${base}/images/hedi-hero.jpg`);
  assert.equal(image.status, 200);
  assert.match(image.headers.get('content-type'), /image\/jpeg/);
});
test('both free ebook downloads serve the original PDFs and support partial requests', async t => {
  const base = await running(t, { env: {} });
  for (const filename of ['trening-gramatyczny-czasowniki.pdf', 'podstawy-nederlands-leren.pdf']) {
    const expected = await readFile(new URL(`../public/ebooks/${filename}`, import.meta.url));
    const response = await fetch(`${base}/ebooks/${filename}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/pdf/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected);
    const partial = await fetch(`${base}/ebooks/${filename}`, { headers: { Range: 'bytes=0-4' } });
    assert.equal(partial.status, 206);
    assert.equal(await partial.text(), '%PDF-');
  }
});
test('catalog preserves section placement and defaults older rows to entertainment', async t => {
  const base = await running(t, { env: config, fetchImpl: async () => Response.json({ results: [row, { ...row, id: 2, section: { value: 'education' } }, { ...row, id: 3, section: { value: 'unknown' } }], next: null }) });
  const data = await (await fetch(`${base}/api/products`)).json();
  assert.equal(data.results.length, 2);
  assert.equal(data.results[0].section, 'entertainment');
  assert.equal(data.results[1].section, 'education');
  assert.equal(data.results[1].price, 0);
});
