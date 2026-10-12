import { createSupabase, providers } from './supabase.js';

export function emailQueueConfigured(env) {
  const id = env.BASEROW_EMAIL_TABLE_ID;
  return Boolean(env.BASEROW_TOKEN && /^\d+$/.test(id || '') && ![env.BASEROW_TABLE_ID, env.BASEROW_NEWSLETTER_TABLE_ID, env.BASEROW_CONTACT_TABLE_ID, env.BASEROW_EBOOK_REQUEST_TABLE_ID].includes(id));
}

export async function dispatchBaserowEmail(job, { env, fetchImpl = fetch }) {
  if (!emailQueueConfigured(env)) throw new Error('Email queue not configured');
  if (!job || typeof job.id !== 'string' || typeof job.recipient !== 'string' || typeof job.subject !== 'string' || typeof job.body !== 'string') throw new Error('Invalid email job');
  const base = new URL(env.BASEROW_API_URL || 'https://api.baserow.io');
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Invalid Baserow URL');
  const url = new URL(`/api/database/rows/table/${env.BASEROW_EMAIL_TABLE_ID}/`, base);
  url.searchParams.set('user_field_names', 'true');
  url.searchParams.set('size', '1');
  url.searchParams.set('filters', JSON.stringify({ filter_type: 'AND', filters: [{ field: 'job_id', type: 'equal', value: job.id }] }));
  const headers = { Authorization: `Token ${env.BASEROW_TOKEN}`, 'Content-Type': 'application/json' };
  const options = { headers, redirect: 'error' };
  const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Baserow queue unavailable');
  const rows = await response.json();
  if (!Array.isArray(rows.results)) throw new Error('Invalid email queue response');
  if (rows.results.length) return rows.results[0].sent === true;
  url.search = new URLSearchParams({ user_field_names: 'true' });
  const created = await fetchImpl(url, { ...options, method: 'POST', signal: AbortSignal.timeout(10000), body: JSON.stringify({ job_id: job.id, recipient: job.recipient, subject: job.subject, body: job.body, source: 'contact_confirmation', created_at: new Date().toISOString(), sent: false }) });
  if (!created.ok || !Number.isInteger((await created.json()).id)) throw new Error('Email job not saved');
  // Baserow's Rows created -> Gmail SMTP -> sent=true workflow sends the mail.
  // Merely saving the queue row must never be reported as a sent confirmation.
  return false;
}

export async function sendQueuedEmails({ env, fetchImpl = fetch }) {
  if (!emailQueueConfigured(env)) throw new Error('Email queue not configured');
  const supabase = createSupabase({ env, fetchImpl });
  const jobs = await supabase.claimEmails();
  let accepted = 0;
  for (const job of jobs) {
    let sent = false;
    try { sent = await dispatchBaserowEmail(job, { env, fetchImpl }); if (sent) accepted++; }
    catch { /* Never log provider responses or personal data. */ }
    await supabase.finishEmail(job, sent);
  }
  return { accepted };
}

export function startEmailWorker({ env, fetchImpl = fetch, log = console.log }) {
  if (providers(env).contact !== 'supabase' || !createSupabase({ env, fetchImpl }).configured || !emailQueueConfigured(env)) return () => {};
  let running = false;
  let stopped = false;
  let current = Promise.resolve();
  async function processQueue() {
    try { await sendQueuedEmails({ env, fetchImpl }); }
    catch { log('HeDoiX confirmation queue worker failed; check Baserow and Supabase settings'); }
  }
  function run() {
    if (running || stopped) return;
    running = true;
    current = processQueue().finally(() => { running = false; });
  }
  const timer = setInterval(run, 60000);
  timer.unref();
  run();
  return () => { stopped = true; clearInterval(timer); return current; };
}
