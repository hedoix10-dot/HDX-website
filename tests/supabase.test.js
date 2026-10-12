import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { createSupabase } from '../server/supabase.js';
import { syncBaserowCatalog } from '../server/catalog-sync.js';
import { sendQueuedEmails, dispatchBaserowEmail } from '../server/email-worker.js';

const env = { SUPABASE_URL: 'https://project.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_private-test', CATALOG_PROVIDER: 'supabase', CONTACT_PROVIDER: 'supabase', NEWSLETTER_PROVIDER: 'baserow', BASEROW_API_URL: 'https://api.baserow.io', BASEROW_TABLE_ID: '1258474', BASEROW_NEWSLETTER_TABLE_ID: '789', BASEROW_TOKEN: 'private-baserow-test' };
const body = { name: 'Anna', email: 'anna@example.com', consent: true, language: 'pl', message: 'Kontakt', submission_id: 'e9dc73f7-ff35-4b05-bef6-00e5abc90e4a' };
const product = { id: 1, title: 'Test ebook', description: '', category: 'ebook', section: 'education', language: 'pl/nl', price: 0, published: true, cover_url: 'https://files.example.org/cover.jpg', file_url: 'https://files.example.org/book.pdf', file_name: 'book.pdf' };
async function running(t, options = {}) {
  const server = createApp({ env, ...options }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}
const post = (base, type, payload) => fetch(`${base}/api/forms/${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

test('Supabase catalogue uses server key, sanitizes products, paginates and caches', async t => {
  let calls = 0;
  const base = await running(t, { fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url.pathname, '/rest/v1/hdx_products');
    assert.equal(url.searchParams.get('published'), 'eq.true');
    assert.equal(url.searchParams.get('limit'), '101');
    assert.equal(options.headers.apikey, env.SUPABASE_SECRET_KEY);
    assert.ok(!options.headers.Authorization);
    return Response.json([product, { ...product, id: 2, price: 5 }, { ...product, id: 3, published: false }, ...Array.from({ length: 98 }, (_, i) => ({ ...product, id: i + 4 }))]);
  } });
  const data = await (await fetch(`${base}/api/products`)).json();
  assert.equal(data.status, 'ok'); assert.equal(data.nextPage, 2);
  assert.equal(data.results.length, 99);
  assert.equal(data.results[0].download, product.file_url);
  assert.equal(data.results[1].download, null); assert.equal(data.results[1].fileName, null);
  assert.ok(!JSON.stringify(data).includes('sb_secret_'));
  await fetch(`${base}/api/products`); assert.equal(calls, 1);
});

test('missing Supabase settings do not silently fall back to another database', async t => {
  let calls = 0;
  const base = await running(t, { env: { ...env, SUPABASE_SECRET_KEY: '' }, fetchImpl: async () => { calls++; throw new Error('Must not call'); } });
  assert.equal((await (await fetch(`${base}/api/products`)).json()).status, 'not_configured');
  assert.deepEqual(await (await fetch(`${base}/api/forms/status`)).json(), { contact: false, newsletter: true });
  assert.equal((await post(base, 'contact', body)).status, 503); assert.equal(calls, 0);
  assert.equal(createSupabase({ env: { ...env, SUPABASE_SECRET_KEY: 'sb_publishable_wrong' } }).configured, false);
});

test('contact is written only to Supabase, while ebook subscribers go only to Baserow', async t => {
  const hosts = [];
  const base = await running(t, { fetchImpl: async (url, options) => {
    hosts.push(url.host);
    if (url.host === 'project.supabase.co') {
      assert.equal(url.pathname, '/rest/v1/hdx_contacts');
      assert.equal(url.searchParams.get('on_conflict'), 'submission_id');
      assert.equal(options.headers.Prefer, 'resolution=ignore-duplicates,return=minimal');
      assert.equal(JSON.parse(options.body).source, 'website_contact');
      return new Response(null, { status: 201 });
    }
    assert.equal(url.pathname, '/api/database/rows/table/789/');
    if (options.method === 'GET') return Response.json({ results: [] });
    assert.equal(JSON.parse(options.body).source, 'website_newsletter');
    return Response.json({ id: 42 });
  } });
  assert.deepEqual(await (await post(base, 'contact', body)).json(), { status: 'accepted' });
  assert.deepEqual(await (await post(base, 'newsletter', { ...body, interests: ['Kolorowanki i ebooki'] })).json(), { status: 'accepted' });
  assert.deepEqual(hosts, ['project.supabase.co', 'api.baserow.io', 'api.baserow.io']);
  await assert.rejects(createSupabase({ env }).submit('newsletter', body), /Subscribers belong in Baserow/);
});

test('Supabase errors are sanitized and legacy service-role JWT headers remain supported', async t => {
  const base = await running(t, { fetchImpl: async () => new Response('sb_secret_private-test details', { status: 403 }) });
  assert.deepEqual(await (await fetch(`${base}/api/products`)).json(), { error: 'catalog_unavailable' });
  assert.deepEqual(await (await post(base, 'contact', body)).json(), { error: 'forms_unavailable' });
  const legacy = createSupabase({ env: { ...env, SUPABASE_SECRET_KEY: '', SUPABASE_SERVICE_ROLE_KEY: 'eyJlegacy-role' }, fetchImpl: async (_url, options) => {
    assert.equal(options.headers.apikey, 'eyJlegacy-role');
    assert.equal(options.headers.Authorization, 'Bearer eyJlegacy-role');
    return Response.json([]);
  } });
  await legacy.products(1);
});

test('sync collects all Baserow pages and atomically applies the normalized snapshot', async () => {
  let pages = 0;
  const result = await syncBaserowCatalog({ env, fetchImpl: async (url, options) => {
    if (url.host === 'api.baserow.io') {
      pages++;
      assert.equal(options.headers.Authorization, 'Token private-baserow-test');
      assert.equal(url.searchParams.get('page'), String(pages));
      return Response.json({ results: [{ ...product, id: pages, category: { value: 'ebook' }, section: { value: 'education' }, cover_url: 'javascript:bad', cover: [{ url: 'javascript:bad' }], file_url: 'https://project.supabase.co/storage/v1/object/public/hdx-free-ebooks/book.pdf', file: [{ url: product.file_url }], published: pages === 1 }], next: pages === 1 ? 'next' : null });
    }
    assert.equal(url.pathname, '/rest/v1/rpc/hdx_sync_baserow_products');
    const rows = JSON.parse(options.body).p_products;
    assert.equal(rows.length, 2); assert.equal(rows[1].published, false);
    assert.equal(rows[0].cover_url, null); assert.equal(rows[0].file_url, 'https://project.supabase.co/storage/v1/object/public/hdx-free-ebooks/book.pdf');
    assert.equal(rows[0].baserow_id, 1);
    return Response.json({ synced: 2 });
  } });
  assert.deepEqual(result, { synced: 2 }); assert.equal(pages, 2);
});

test('a failed page or malformed Baserow rows never replace the current Supabase catalogue', async () => {
  for (const malformed of [false, true]) {
    let writes = 0;
    await assert.rejects(syncBaserowCatalog({ env, fetchImpl: async (url, options) => {
      if (options.method === 'POST') { writes++; return Response.json({ synced: 0 }); }
      if (malformed) return Response.json({ results: [{}], next: null });
      if (url.searchParams.get('page') === '1') return Response.json({ results: [product], next: 'next' });
      return new Response('Baserow unavailable', { status: 503 });
    } }));
    assert.equal(writes, 0);
  }
});

test('email bridge marks Supabase sent only after the Baserow Gmail workflow reports sent', async () => {
  const job = { id: 'email-uuid', lock_token: 'lease-token', recipient: 'anna@example.com', subject: 'Potwierdzenie', body: 'Dziękujemy' };
  for (const success of [true, false]) {
    const result = await sendQueuedEmails({ env: { ...env, BASEROW_EMAIL_TABLE_ID: '888' }, fetchImpl: async (input, options) => {
      const url = new URL(input);
      if (url.pathname.endsWith('/hdx_claim_emails')) return Response.json([job]);
      if (url.host === 'api.baserow.io') {
        assert.equal(url.pathname, '/api/database/rows/table/888/');
        assert.equal(options.headers.Authorization, 'Token private-baserow-test');
        assert.equal(JSON.parse(url.searchParams.get('filters')).filters[0].value, job.id);
        return Response.json({ results: [{ id: 1, sent: success }] });
      }
      assert.equal(url.pathname, '/rest/v1/rpc/hdx_finish_email');
      assert.deepEqual(JSON.parse(options.body), { p_id: job.id, p_lock_token: job.lock_token, p_sent: success });
      return Response.json(true);
    } });
    assert.equal(result.accepted, success ? 1 : 0);
  }
});
test('email bridge persists one Baserow job across retries, without sending SMTP from Render', async () => {
  const job = { id: 'email-uuid', recipient: 'anna@example.com', subject: 'Receipt', body: 'Received' };
  let row;
  let writes = 0;
  const options = { env: { ...env, BASEROW_EMAIL_TABLE_ID: '888' }, fetchImpl: async (url, request) => {
    assert.equal(url.host, 'api.baserow.io');
    if (request.method !== 'POST') return Response.json({ results: row ? [row] : [] });
    writes++; const payload = JSON.parse(request.body);
    assert.deepEqual({ job_id: payload.job_id, recipient: payload.recipient, sent: payload.sent }, { job_id: job.id, recipient: job.recipient, sent: false });
    row = { id: 1, sent: false }; return Response.json(row);
  } };
  assert.equal(await dispatchBaserowEmail(job, options), false);
  assert.equal(await dispatchBaserowEmail(job, options), false);
  row.sent = true;
  assert.equal(await dispatchBaserowEmail(job, options), true);
  assert.equal(writes, 1);
  await assert.rejects(dispatchBaserowEmail(job, { ...options, env: { ...options.env, BASEROW_EBOOK_REQUEST_TABLE_ID: '888' } }), /Email queue not configured/);
});
