const instructions = `You are HeDi, the AI assistant of HeDoiX. Help visitors understand the services and prepare a contact request. Be warm, concise and concrete. Use only the business facts below, and ask a brief clarifying question when needed.
HeDoiX offers websites, B2B SaaS solutions, HR/onboarding automation, Make/Zapier operational automation, CRM workflows, and branded Anime/3D mascots and AI assistants.
The Hero package combines a professional website, AI assistant and HR/process automation. Quotes are individual: do not invent prices, delivery dates, guarantees or client results.
Educational Memory and flashcards are announced as coming soon. WerkBuddy is the owner's Dutch language-learning application linked in Education at https://werkbuddy.onrender.com. Education offers two free PDFs without a signup: E-book Trening Gramatyczny i Czasowniki (48 pages) at https://hdx-website.onrender.com/ebooks/trening-gramatyczny-czasowniki.pdf and E-Book PODSTAWY Nederlands leren (10 pages) at https://hdx-website.onrender.com/ebooks/podstawy-nederlands-leren.pdf. Optional email request forms remain at /ebooki/trening-gramatyczny-czasowniki and /ebooki/podstawy-nederlands-leren. Do not claim that an email or ebook has been sent. Creative projects include other ebooks, PDF coloring books and AI music. You do not have live product inventory, other downloads, legal information or payment data: direct visitors to the education section, catalogue or contact team for current details.
Contact: Hedoix10@gmail.com, phone +31 641 504 563. Responses are usually within 24 hours. Encourage visitors to use the contact section for a quote.
You cannot send email, book meetings, access Baserow, charge payments or perform actions. Do not claim you performed any action. Do not request passwords or API keys. Website information above is your reference; do not invent a different business identity.`;

export function registerChat(app, { env, fetchImpl }) {
  const key = String(env.HEDI_OPENAI_API_KEY || '').trim() || String(env.OPENAI_API_KEY || '').trim();
  const model = env.HEDI_OPENAI_MODEL || 'gpt-4.1-mini';
  const visitors = new Map();
  let windowStart = Date.now();
  let total = 0;
  let active = 0;
  // Render terminates HTTPS at its reverse proxy. A global limit also applies.
  app.set('trust proxy', 1);
  app.get('/api/chat/status', (_req, res) => res.set('Cache-Control', 'no-store').json({ enabled: Boolean(key) }));
  app.post('/api/chat', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!key) return res.status(503).json({ error: 'chat_not_configured' });
    const { messages, language = 'pl' } = req.body || {};
    if (!['pl', 'nl'].includes(language) || !Array.isArray(messages) || messages.length < 1 || messages.length > 10) return res.status(400).json({ error: 'invalid_messages' });
    let characters = 0;
    const valid = messages.every(message => {
      if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' || !message.content.trim() || message.content.length > (message.role === 'assistant' ? 4000 : 1000)) return false;
      characters += message.content.length;
      return true;
    });
    if (!valid || characters > 6000 || messages.at(-1).role !== 'user') return res.status(400).json({ error: 'invalid_messages' });
    const now = Date.now();
    if (now - windowStart >= 60000) { visitors.clear(); total = 0; windowStart = now; }
    const count = visitors.get(req.ip) || 0;
    if (count >= 10 || total >= 60 || active >= 4) return res.set('Retry-After', '60').status(429).json({ error: 'chat_rate_limited' });
    visitors.set(req.ip, count + 1);
    total++;
    active++;
    try {
      const response = await fetchImpl('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          instructions: `${instructions}\nReply in ${language === 'nl' ? 'Dutch' : 'Polish'}.`,
          input: messages.map(({ role, content }) => ({ role, content: content.trim() })),
          max_output_tokens: 600,
          store: false,
        }),
        signal: AbortSignal.timeout(30000),
        redirect: 'error',
      });
      if (response.status === 401 || response.status === 403) return res.status(503).json({ error: 'chat_auth_failed' });
      if (response.status === 429) return res.set('Retry-After', '60').status(429).json({ error: 'chat_rate_limited' });
      if (!response.ok) throw new Error('OpenAI unavailable');
      const data = await response.json();
      const text = typeof data.output_text === 'string' ? data.output_text : (Array.isArray(data.output) ? data.output : []).filter(item => item.type === 'message').flatMap(item => Array.isArray(item.content) ? item.content : []).filter(part => part.type === 'output_text' && typeof part.text === 'string').map(part => part.text).join('\n');
      if (!text.trim()) throw new Error('Empty assistant response');
      res.json({ message: text.trim().slice(0, 4000) });
    } catch {
      // Never expose provider error bodies, request headers or API keys.
      res.status(503).json({ error: 'chat_unavailable' });
    } finally { active--; }
  });
}
