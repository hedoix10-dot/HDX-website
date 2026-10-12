export function providers(env) {
  return { catalog: env.CATALOG_PROVIDER || 'baserow', contact: env.CONTACT_PROVIDER || env.FORMS_PROVIDER || 'baserow', newsletter: env.NEWSLETTER_PROVIDER || env.FORMS_PROVIDER || 'baserow', ebook: 'baserow' };
}

export function createSupabase({ env, fetchImpl = fetch }) {
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  let base;
  try {
    base = new URL(env.SUPABASE_URL);
    if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/' || base.search || base.hash) base = null;
  } catch { base = null; }
  const configured = Boolean(base && key && !key.startsWith('sb_publishable_'));

  async function request(resource, { method = 'GET', query = {}, body, prefer } = {}) {
    if (!configured) throw new Error('Supabase not configured');
    const url = new URL(`/rest/v1/${resource}`, base);
    url.search = new URLSearchParams(query);
    const headers = { apikey: key, 'Content-Type': 'application/json' };
    // New sb_secret_ keys belong in apikey. Legacy service-role JWTs also
    // need Authorization; a new secret key must never be used as a JWT.
    if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
    if (prefer) headers.Prefer = prefer;
    const response = await fetchImpl(url, { method, headers, ...(body !== undefined && { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15000), redirect: 'error' });
    if (!response.ok) throw new Error('Supabase unavailable');
    if (prefer?.includes('return=minimal') || response.status === 204) return null;
    return response.json();
  }

  return {
    configured,
    async products(page) {
      const rows = await request('hdx_products', { query: { select: 'id,title,description,category,section,language,price,cover_url,file_url,file_name,published', published: 'eq.true', order: 'id.asc', offset: String((page - 1) * 100), limit: '101' } });
      if (!Array.isArray(rows)) throw new Error('Invalid catalogue');
      return { rows: rows.slice(0, 100), nextPage: rows.length > 100 && page < 100 ? page + 1 : null };
    },
    async submit(type, row) {
      if (type !== 'contact') throw new Error('Subscribers belong in Baserow');
      await request('hdx_contacts', { method: 'POST', query: { on_conflict: 'submission_id' }, prefer: 'resolution=ignore-duplicates,return=minimal', body: row });
    },
    async sync(products) {
      const result = await request('rpc/hdx_sync_baserow_products', { method: 'POST', body: { p_products: products } });
      if (!Number.isInteger(result?.synced)) throw new Error('Invalid sync response');
      return result;
    },
    async claimEmails() {
      const rows = await request('rpc/hdx_claim_emails', { method: 'POST', body: { p_limit: 10 } });
      if (!Array.isArray(rows)) throw new Error('Invalid email queue');
      return rows;
    },
    async finishEmail(job, sent) {
      return request('rpc/hdx_finish_email', { method: 'POST', body: { p_id: job.id, p_lock_token: job.lock_token, p_sent: sent } });
    },
  };
}
