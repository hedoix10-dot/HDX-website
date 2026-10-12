import { createSupabase, providers } from './supabase.js';

const select = value => typeof value === 'string' ? value : value?.value || '';
const https = value => { try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; } };

export async function syncBaserowCatalog({ env, fetchImpl = fetch }) {
  const supabase = createSupabase({ env, fetchImpl });
  if (!supabase.configured || !env.BASEROW_TOKEN || !/^\d+$/.test(env.BASEROW_TABLE_ID || '')) throw new Error('Sync not configured');
  const base = new URL(env.BASEROW_API_URL || 'https://api.baserow.io');
  if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Invalid Baserow URL');
  const products = [];
  for (let page = 1; page <= 100; page++) {
    const url = new URL(`/api/database/rows/table/${env.BASEROW_TABLE_ID}/`, base);
    url.search = new URLSearchParams({ user_field_names: 'true', size: '100', page: String(page) });
    const response = await fetchImpl(url, { headers: { Authorization: `Token ${env.BASEROW_TOKEN}` }, signal: AbortSignal.timeout(10000), redirect: 'error' });
    if (!response.ok) throw new Error('Baserow unavailable');
    const payload = await response.json();
    if (!Array.isArray(payload.results) || payload.results.some(row => !row || !Number.isSafeInteger(row.id) || row.id < 1)) throw new Error('Invalid Baserow rows');
    for (const row of payload.results) {
      const category = select(row.category);
      const section = select(row.section) || 'entertainment';
      const price = Number(row.price ?? 0);
      const title = typeof row.title === 'string' ? row.title.trim().slice(0, 200) : '';
      if (!title || !['ebook', 'coloring'].includes(category) || !['education', 'entertainment'].includes(section) || !Number.isFinite(price) || price < 0 || price >= 1e10) continue;
      products.push({ baserow_id: row.id, title, description: String(row.description || '').slice(0, 3000), category, section, language: ['pl', 'nl', 'pl/nl'].includes(select(row.language)) ? select(row.language) : 'pl', price, published: row.published === true, cover_url: https(row.cover_url) || https(row.cover?.[0]?.url), file_url: https(row.file_url) || https(row.file?.[0]?.url), file_name: String(row.file_name || row.file?.[0]?.visible_name || row.file?.[0]?.name || '').slice(0, 250) });
    }
    if (!payload.next) return supabase.sync(products);
  }
  // Never apply an incomplete snapshot or delete mirrored rows after a failed page.
  throw new Error('Catalogue exceeds sync limit');
}

export function startCatalogSync({ env, fetchImpl = fetch, log = console.log }) {
  if (providers(env).catalog !== 'supabase' || !createSupabase({ env, fetchImpl }).configured || !env.BASEROW_TOKEN || !/^\d+$/.test(env.BASEROW_TABLE_ID || '')) return () => {};
  let running = false;
  let stopped = false;
  async function run() {
    if (running || stopped) return;
    running = true;
    try { const result = await syncBaserowCatalog({ env, fetchImpl }); log(`HeDoiX catalogue sync complete: ${result.synced} products`); }
    catch { log('HeDoiX catalogue sync failed; check database settings and permissions'); }
    finally { running = false; }
  }
  const seconds = Number(env.BASEROW_SYNC_INTERVAL_SECONDS || 300);
  const interval = setInterval(run, (Number.isFinite(seconds) ? Math.max(60, Math.min(seconds, 86400)) : 300) * 1000);
  interval.unref();
  void run();
  return () => { stopped = true; clearInterval(interval); };
}
