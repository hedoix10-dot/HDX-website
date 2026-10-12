import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerChat } from './chat.js';
import { registerForms } from './forms.js';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const selectValue = value => typeof value === 'string' ? value : value?.value || '';
const httpsUrl = value => {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
};

export function publicProduct(row) {
  if (row.published !== true || typeof row.title !== 'string' || !row.title.trim()) return null;
  const category = selectValue(row.category);
  if (!['ebook', 'coloring'].includes(category)) return null;
  const section = selectValue(row.section) || 'entertainment';
  if (!['education', 'entertainment'].includes(section)) return null;
  const amount = Number(row.price ?? 0);
  if (!Number.isFinite(amount) || amount < 0) return null;
  const file = row.file?.[0];
  return {
    id: row.id, title: row.title.slice(0, 200), description: String(row.description || '').slice(0, 3000),
    category, section, language: selectValue(row.language) || 'pl', price: amount,
    cover: httpsUrl(row.cover?.[0]?.url),
    // Public free downloads only. This is not a payment or file authorization service.
    download: amount === 0 ? httpsUrl(file?.url) : null,
    fileName: amount === 0 ? String(file?.visible_name || file?.name || '') : null,
  };
}

export function createApp({ env = process.env, fetchImpl = fetch } = {}) {
  const app = express();
  app.disable('x-powered-by');
  const cache = new Map();
  const inflight = new Map();
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/chat', express.json({ limit: '32kb' }));
  registerChat(app, { env, fetchImpl });
  app.use('/api/chat', (error, _req, res, _next) => res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: 'invalid_request' }));
  app.use('/api/forms', express.json({ limit: '16kb' }));
  registerForms(app, { env, fetchImpl });
  app.use('/api/forms', (error, _req, res, _next) => res.status(error.type === 'entity.too.large' ? 413 : 400).json({ error: 'invalid_request' }));
  app.get('/api/products', async (req, res) => {
    const page = Number(req.query.page || 1);
    if (!Number.isInteger(page) || page < 1 || page > 100) return res.status(400).json({ error: 'invalid_page' });
    if (!env.BASEROW_TABLE_ID || !env.BASEROW_TOKEN) return res.json({ status: 'not_configured', results: [], nextPage: null });
    if (!/^\d+$/.test(env.BASEROW_TABLE_ID)) return res.status(503).json({ error: 'catalog_configuration' });
    const hit = cache.get(page);
    if (hit && hit.expires > Date.now()) return res.set('Cache-Control', 'public, max-age=30').json(hit.data);
    try {
      let pending = inflight.get(page);
      if (!pending) {
        pending = (async () => {
          const base = new URL(env.BASEROW_API_URL || 'https://api.baserow.io');
          if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Invalid API URL');
          const url = new URL(`/api/database/rows/table/${env.BASEROW_TABLE_ID}/`, base);
          url.search = new URLSearchParams({ user_field_names: 'true', size: '100', page: String(page) });
          const response = await fetchImpl(url, { headers: { Authorization: `Token ${env.BASEROW_TOKEN}` }, signal: AbortSignal.timeout(10000), redirect: 'error' });
          if (!response.ok) throw new Error('Baserow unavailable');
          const payload = await response.json();
          if (!Array.isArray(payload.results)) throw new Error('Invalid Baserow response');
          const data = { status: 'ok', results: payload.results.map(publicProduct).filter(Boolean), nextPage: payload.next && page < 100 ? page + 1 : null };
          cache.set(page, { data, expires: Date.now() + 60000 });
          return data;
        })();
        inflight.set(page, pending);
      }
      const data = await pending;
      res.set('Cache-Control', 'public, max-age=30').json(data);
    } catch {
      res.status(503).json({ error: 'catalog_unavailable' });
    } finally { inflight.delete(page); }
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));
  app.use('/assets', express.static(path.join(dist, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(dist));
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(dist, 'index.html'), { headers: { 'Cache-Control': 'no-cache' } }));
  return app;
}
