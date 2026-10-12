import { randomUUID } from 'node:crypto';
import { createSupabase, providers } from './supabase.js';
import ebooks from '../shared/ebooks.json' with { type: 'json' };

const ids = { contact: 'BASEROW_CONTACT_TABLE_ID', newsletter: 'BASEROW_NEWSLETTER_TABLE_ID', ebook: 'BASEROW_EBOOK_REQUEST_TABLE_ID' };
const consentVersion = '2026-10-12';
const emailPattern = /^[^\s@<>,;:"\\]+@[^\s@<>,;:"\\]+\.[^\s@<>,;:"\\]+$/;
const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const segmentLabels = {
  business_automation: ['Automatyzacje dla firm', 'Bedrijfsautomatisering'], hero_package: ['Strona i asystent AI', 'Website en AI-assistent'], werkbuddy: ['WerkBuddy', 'WerkBuddy'],
  coloring: ['Kolorowanki', 'Kleurplaten'], ebook: ['Ebooki', 'E-books'], dutch_learning: ['Niderlandzki — darmowe ebooki', 'Nederlands — gratis e-books'], ai_music: ['Muzyka AI', 'AI-muziek'], general_updates: ['Nowości HeDoiX', 'HeDoiX-updates'],
};

function text(value, maximum, required = false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string' || value.length > maximum || (required && !value.trim())) throw new Error('Invalid input');
  return value.trim();
}

function validate(body, type) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid input');
  const name = text(body.name, 120, true);
  const email = text(body.email, 254, true).toLowerCase();
  if (!emailPattern.test(email) || ![true, 'on'].includes(body.consent)) throw new Error('Invalid input');
  const language = body.language ?? 'pl';
  if (!['pl', 'nl'].includes(language)) throw new Error('Invalid input');
  const submissionId = body.submission_id ?? randomUUID();
  if (typeof submissionId !== 'string' || !uuidPattern.test(submissionId)) throw new Error('Invalid input');
  const common = { name, email, language, submission_id: submissionId };
  if (type === 'ebook') {
    const book = ebooks.find(book => book.id === body.book_id);
    if (!book) throw new Error('Invalid ebook');
    return { ...common, book_id: book.id, book_title: book.title };
  }
  if (type === 'contact') {
    const topic = body.topic || 'business_offer';
    if (!['business_offer', 'coloring', 'ebook', 'general'].includes(topic)) throw new Error('Invalid topic');
    return { ...common, topic, company: text(body.company, 200), message: text(body.message, 5000, true) };
  }
  if (!Array.isArray(body.interests) || body.interests.length > 12) throw new Error('Invalid input');
  const codes = body.interest_codes ?? [];
  if (!Array.isArray(codes) || codes.length > 8 || codes.some(code => typeof code !== 'string' || !Object.hasOwn(segmentLabels, code))) throw new Error('Invalid segments');
  return { ...common, interests: [...new Set(body.interests.map(value => text(value, 100, true)))].join(', '), segments: [...new Set(codes.length ? codes : ['general_updates'])].join(', ') };
}

function confirmation(type, language, input) {
  if (type === 'contact') return language === 'nl'
    ? { confirmation_subject: 'HeDoiX — we hebben je bericht ontvangen', confirmation_body: 'Bedankt voor je bericht! We hebben je aanvraag ontvangen. Het HeDoiX-team neemt contact met je op.\n\nDit is een automatische ontvangstbevestiging. Je wordt hiermee niet aangemeld voor de nieuwsbrief.\n\nHeDi en het HeDoiX-team\nHedoix10@gmail.com' }
    : { confirmation_subject: 'HeDoiX — otrzymaliśmy Twoje zgłoszenie', confirmation_body: 'Dziękujemy za wiadomość! Otrzymaliśmy Twoje zgłoszenie. Zespół HeDoiX skontaktuje się z Tobą.\n\nTo automatyczne potwierdzenie przyjęcia wiadomości. Nie zapisuje Cię do newslettera.\n\nHeDi i zespół HeDoiX\nHedoix10@gmail.com' };
  const result = language === 'nl'
    ? { confirmation_subject: 'HeDoiX — bedankt voor je aanmelding', confirmation_body: 'Bedankt voor je aanmelding voor updates van HeDoiX! We informeren je over nieuwe projecten en materialen die aansluiten bij je interesses.\n\nJe kunt je afmelden door een e-mail te sturen naar Hedoix10@gmail.com met het onderwerp Afmelden.\n\nHeDi en het HeDoiX-team' }
    : { confirmation_subject: 'HeDoiX — dziękujemy za zapis na nowości', confirmation_body: 'Dziękujemy za zapis na nowości HeDoiX! Będziemy informować Cię o nowych projektach i materiałach zgodnych z Twoimi zainteresowaniami.\n\nMożesz zrezygnować, wysyłając e-mail na Hedoix10@gmail.com z tematem Wypisz mnie.\n\nHeDi i zespół HeDoiX' };
  const subjects = input.segments.split(', ').map(code => segmentLabels[code][language === 'nl' ? 1 : 0]);
  result.confirmation_body = `${language === 'nl' ? 'Je gekozen onderwerpen' : 'Wybrane tematy'}: ${subjects.join(', ')}.\n\n${result.confirmation_body}`;
  return result;
}

export function registerForms(app, { env, fetchImpl }) {
  const supabase = createSupabase({ env, fetchImpl });
  const provider = type => providers(env)[type];
  const available = type => provider(type) === 'supabase' ? type === 'contact' && supabase.configured : provider(type) === 'baserow' && Boolean(env.BASEROW_TOKEN && /^\d+$/.test(env[ids[type]] || '') && ![env.BASEROW_TABLE_ID, env.BASEROW_EMAIL_TABLE_ID, ...Object.entries(ids).filter(([other]) => other !== type).map(([, name]) => env[name])].includes(env[ids[type]]));
  const pending = new Map();
  const visitors = new Map();
  let windowStart = Date.now();
  let total = 0;
  let active = 0;

  app.get('/api/forms/status', (_req, res) => res.set('Cache-Control', 'no-store').json({ contact: available('contact'), newsletter: available('newsletter') }));
  app.get('/api/forms/ebook/status', (_req, res) => res.set('Cache-Control', 'no-store').json({ enabled: available('ebook') }));

  async function request(type, method, { filters, row } = {}) {
    const base = new URL(env.BASEROW_API_URL || 'https://api.baserow.io');
    if (base.protocol !== 'https:' || base.username || base.password) throw new Error('Invalid API URL');
    const url = new URL(`/api/database/rows/table/${env[ids[type]]}/`, base);
    url.searchParams.set('user_field_names', 'true');
    if (filters) { url.searchParams.set('size', '1'); url.searchParams.set('filters', JSON.stringify({ filter_type: 'AND', filters })); }
    const response = await fetchImpl(url, { method, headers: { Authorization: `Token ${env.BASEROW_TOKEN}`, 'Content-Type': 'application/json' }, ...(row && { body: JSON.stringify(row) }), signal: AbortSignal.timeout(10000), redirect: 'error' });
    if (!response.ok) throw new Error('Baserow unavailable');
    const result = await response.json();
    if (method === 'GET' ? !Array.isArray(result.results) : !Number.isInteger(result.id)) throw new Error('Invalid Baserow response');
    return result;
  }

  for (const type of Object.keys(ids)) app.post(`/api/forms/${type}`, async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!req.is('application/json')) return res.status(415).json({ error: 'json_required' });
    const origin = req.get('origin');
    if (origin) {
      try {
        const url = new URL(origin);
        const localDevelopment = env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname);
        if (url.host !== req.get('host') && !localDevelopment) return res.status(403).json({ error: 'invalid_origin' });
      } catch { return res.status(403).json({ error: 'invalid_origin' }); }
    }
    if (!available(type)) return res.status(503).json({ error: 'forms_not_configured' });
    let input;
    try { input = validate(req.body, type); } catch { return res.status(400).json({ error: 'invalid_submission' }); }
    const now = Date.now();
    if (now - windowStart >= 600000) { visitors.clear(); total = 0; windowStart = now; }
    const count = visitors.get(req.ip) || 0;
    if (count >= 5 || total >= 100 || active >= 4) return res.set('Retry-After', '600').status(429).json({ error: 'forms_rate_limited' });
    visitors.set(req.ip, count + 1);
    total++;
    if (req.body.website) return res.status(400).json({ error: 'invalid_submission' });
    const key = `${type}:${type === 'newsletter' ? input.email : input.submission_id}`;
    active++;
    try {
      let task = pending.get(key);
      if (!task) {
        task = (async () => {
          const row = {
            ...input, consent: true, consent_version: consentVersion, submitted_at: new Date().toISOString(),
            source: type === 'contact' ? 'website_contact' : type === 'ebook' ? 'website_ebook_request' : 'website_newsletter',
            ...(type === 'ebook' ? {
              owner_subject: `HeDoiX — zamówienie ebooka: ${input.book_title}`,
              owner_body: `Ebook: ${input.book_title}\nImię: ${input.name}\nE-mail: ${input.email}\nJęzyk: ${input.language}\nID zgłoszenia: ${input.submission_id}\nPDF: https://hdx-website.onrender.com${ebooks.find(book => book.id === input.book_id).downloadUrl}\n\nKlient prosi o darmowy ebook. To zgłoszenie nie zapisuje go do newslettera.`,
              notification_sent: false, fulfilled: false,
            } : { ...confirmation(type, input.language, input), confirmation_sent: false, ...(type === 'contact' ? { status: 'new' } : { active: true }) }),
          };
          if (provider(type) === 'supabase') return supabase.submit(type, row);
          // Baserow supports field names in filter trees with user_field_names=true.
          // Check persisted records before retrying a timed-out submission.
          const field = type === 'newsletter' ? 'email' : 'submission_id';
          const existing = await request(type, 'GET', { filters: [{ field, type: 'equal', value: input[field] }] });
          if (existing.results.length) return;
          await request(type, 'POST', { row });
        })();
        pending.set(key, task);
        task.finally(() => { if (pending.get(key) === task) pending.delete(key); }).catch(() => {});
      }
      await task;
      // Do not disclose whether an email already exists, row IDs, or personal data.
      res.json({ status: 'accepted' });
    } catch { res.status(503).json({ error: 'forms_unavailable' }); }
    finally { active--; }
  });
}
