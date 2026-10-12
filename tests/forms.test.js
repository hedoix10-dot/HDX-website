import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';

const env = { NODE_ENV: 'production', BASEROW_API_URL: 'https://api.baserow.io', BASEROW_TOKEN: 'private-test-token', BASEROW_TABLE_ID: '123', BASEROW_CONTACT_TABLE_ID: '456', BASEROW_NEWSLETTER_TABLE_ID: '789' };
const submission = { name: ' Anna ', email: 'ANNA@example.com', language: 'pl', consent: true, submission_id: 'e9dc73f7-ff35-4b05-bef6-00e5abc90e4a', website: '' };
async function running(t, options = {}) {
  const server = createApp({ env, ...options }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}
function send(base, type, data, headers = {}) { return fetch(`${base}/api/forms/${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(data) }); }

test('forms expose configuration only and prevent writing into Products or a shared table', async t => {
  const base = await running(t, { env: {} });
  assert.deepEqual(await (await fetch(`${base}/api/forms/status`)).json(), { contact: false, newsletter: false });
  assert.equal((await send(base, 'contact', { ...submission, message: 'Hello' })).status, 503);
  for (const overrides of [{ BASEROW_CONTACT_TABLE_ID: '123' }, { BASEROW_CONTACT_TABLE_ID: '789' }]) {
    const bad = await running(t, { env: { ...env, ...overrides } });
    assert.equal((await (await fetch(`${bad}/api/forms/status`)).json()).contact, false);
  }
});

test('contact writes consent, original message and localized confirmation without subscribing', async t => {
  const calls = [];
  const base = await running(t, { fetchImpl: async (url, options) => {
    calls.push(options.method);
    assert.equal(url.pathname, '/api/database/rows/table/456/');
    assert.equal(url.searchParams.get('user_field_names'), 'true');
    assert.equal(options.headers.Authorization, 'Token private-test-token');
    if (options.method === 'GET') {
      assert.deepEqual(JSON.parse(url.searchParams.get('filters')).filters, [{ field: 'submission_id', type: 'equal', value: submission.submission_id }]);
      return Response.json({ results: [] });
    }
    const data = JSON.parse(options.body);
    assert.equal(data.name, 'Anna'); assert.equal(data.email, 'anna@example.com');
    assert.equal(data.message, '<script>Hello</script>');
    assert.equal(data.source, 'website_contact'); assert.equal(data.status, 'new');
    assert.equal(data.consent, true); assert.equal(data.confirmation_sent, false);
    assert.match(data.submitted_at, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(data.consent_version, '2026-10-12');
    assert.match(data.confirmation_body, /Nie zapisuje Cię do newslettera/);
    assert.ok(!('active' in data)); assert.ok(!('website' in data));
    assert.ok(!data.confirmation_body.includes('<script>'));
    return Response.json({ id: 42 });
  } });
  const response = await send(base, 'contact', { ...submission, message: '<script>Hello</script>', source: 'forged', active: true });
  assert.deepEqual(await response.json(), { status: 'accepted' });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(calls, ['GET', 'POST']);
});

test('newsletter normalizes email, saves only consented interests and Dutch confirmation', async t => {
  const base = await running(t, { fetchImpl: async (url, options) => {
    assert.equal(url.pathname, '/api/database/rows/table/789/');
    if (options.method === 'GET') {
      assert.deepEqual(JSON.parse(url.searchParams.get('filters')).filters, [{ field: 'email', type: 'equal', value: 'anna@example.com' }]);
      return Response.json({ results: [] });
    }
    const row = JSON.parse(options.body);
    assert.equal(row.interests, 'Ebooks, AI'); assert.equal(row.active, true);
    assert.equal(row.language, 'nl'); assert.equal(row.source, 'website_newsletter');
    assert.match(row.confirmation_subject, /bedankt/); assert.match(row.confirmation_body, /Afmelden/);
    return Response.json({ id: 43 });
  } });
  assert.equal((await send(base, 'newsletter', { ...submission, language: 'nl', interests: ['Ebooks', 'AI', 'AI'] })).status, 200);
});

test('duplicates and retries do not create another row or reactivate an unsubscribed address', async t => {
  let writes = 0;
  const base = await running(t, { fetchImpl: async (_url, options) => {
    if (options.method !== 'GET') writes++;
    return Response.json({ results: [{ id: 44, active: false }] });
  } });
  for (const type of ['contact', 'newsletter']) {
    const response = await send(base, type, { ...submission, message: 'Hello', interests: [] });
    assert.deepEqual(await response.json(), { status: 'accepted' });
  }
  assert.equal(writes, 0);
});

test('concurrent signups for the same email share one upstream write', async t => {
  let writes = 0;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const base = await running(t, { fetchImpl: async (_url, options) => {
    if (options.method === 'GET') { await gate; return Response.json({ results: [] }); }
    writes++; return Response.json({ id: 45 });
  } });
  const first = send(base, 'newsletter', { ...submission, interests: [] });
  const second = send(base, 'newsletter', { ...submission, interests: [] });
  // Give both requests a chance to enter the handler before releasing the API.
  await new Promise(resolve => setTimeout(resolve, 50));
  release();
  assert.deepEqual((await Promise.all([first, second])).map(response => response.status), [200, 200]);
  assert.equal(writes, 1);
});

test('invalid consent, input, honeypots, bodies and origins never reach Baserow', async t => {
  let calls = 0;
  const base = await running(t, { fetchImpl: async () => { calls++; throw new Error('Must not call'); } });
  for (const input of [{ consent: false }, { consent: 'false' }, { email: 'not-an-email' }, { email: 'a,b@example.com' }, { name: '' }, { message: 'x'.repeat(5001) }, { language: 'en' }, { submission_id: 'not-a-uuid' }, { website: 'spam.example' }]) {
    assert.equal((await send(base, 'contact', { ...submission, message: 'Hello', ...input })).status, 400);
  }
  assert.equal((await send(base, 'newsletter', { ...submission, interests: 'AI' })).status, 400);
  assert.equal((await send(base, 'contact', { ...submission, message: 'Hello' }, { Origin: 'https://other.example' })).status, 403);
  assert.equal((await fetch(`${base}/api/forms/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
  assert.equal((await send(base, 'contact', { ...submission, message: 'x'.repeat(20000) })).status, 413);
  assert.equal(calls, 0);
});

test('upstream permission and response failures do not report success or leak secrets', async t => {
  for (const fetchImpl of [async () => new Response('private-test-token error', { status: 403 }), async () => Response.json({ error: 'private-test-token' }), async (_url, options) => options.method === 'GET' ? Response.json({ results: [] }) : Response.json({ error: 'bad row' })]) {
    const base = await running(t, { fetchImpl });
    const response = await send(base, 'contact', { ...submission, message: 'Hello' });
    assert.equal(response.status, 503); assert.deepEqual(await response.json(), { error: 'forms_unavailable' });
  }
});

test('rate limits bound automatic emails and failed writes remain retryable', async t => {
  let calls = 0;
  const base = await running(t, { fetchImpl: async () => { calls++; throw new Error('unavailable'); } });
  for (let i = 0; i < 5; i++) assert.equal((await send(base, 'newsletter', { ...submission, interests: [] })).status, 503);
  const limited = await send(base, 'newsletter', { ...submission, interests: [] });
  assert.equal(limited.status, 429); assert.equal(limited.headers.get('retry-after'), '600'); assert.equal(calls, 5);
});
