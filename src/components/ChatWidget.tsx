import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, X } from 'lucide-react';
import { useLang } from '../lib/i18n';

type Message = { role: 'user' | 'assistant'; content: string };

export default function ChatWidget() {
  const { lang, tr } = useLang();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const questions = [tr('Potrzebuję strony', 'Ik wil een website'), tr('Chcę automatyzacji', 'Ik wil automatiseren'), tr('Co to Pakiet Hero?', 'Wat is het Hero-pakket?')];

  useEffect(() => {
    if (!open) return;
    let current = true;
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 45000);
    setStatus('checking');
    fetch('/api/chat/status', { signal: abort.signal }).then(async response => {
      if (!response.ok) throw new Error('Chat unavailable');
      const data = await response.json();
      setStatus(data.enabled === true ? 'available' : 'unavailable');
    }).catch(() => { if (current) setStatus('unavailable'); }).finally(() => clearTimeout(timer));
    return () => { current = false; clearTimeout(timer); abort.abort(); };
  }, [open]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages, pending, error, open]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    function close(event: KeyboardEvent) { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } }
    if (open) document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || content.length > 1000 || pending || status !== 'available') return;
    const input: Message[] = [...messages, { role: 'user' as const, content }].slice(-10);
    while (input.reduce((sum, message) => sum + message.content.length, 0) > 6000) input.shift();
    setPending(content);
    setError('');
    const abort = new AbortController();
    request.current = abort;
    const timer = setTimeout(() => abort.abort(), 45000);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: input, language: lang }), signal: abort.signal });
      if (response.status === 429) {
        setError(tr('Chwilę przerwy — spróbuj ponownie za minutę.', 'Even pauze — probeer het over een minuut opnieuw.'));
        return;
      }
      if (!response.ok) throw new Error('Chat unavailable');
      const data = await response.json();
      if (typeof data.message !== 'string' || !data.message.trim()) throw new Error('Empty answer');
      setMessages(current => [...current, { role: 'user', content }, { role: 'assistant', content: data.message }]);
      setDraft('');
    } catch {
      setError(tr('HeDi nie może teraz odpowiedzieć. Spróbuj ponownie lub skontaktuj się z nami.', 'HeDi kan nu niet antwoorden. Probeer opnieuw of neem contact met ons op.'));
    } finally { clearTimeout(timer); request.current = null; setPending(''); }
  }
  function submit(event: FormEvent) { event.preventDefault(); send(draft); }

  return <>
    <button ref={button} type="button" onClick={() => setOpen(value => !value)} aria-label={open ? tr('Zamknij czat HeDi', 'HeDi-chat sluiten') : tr('Otwórz czat HeDi', 'HeDi-chat openen')} aria-expanded={open} aria-haspopup="dialog" aria-controls="hedi-chat" className="hedi-launcher fixed bottom-5 right-5 z-50">
      <span className="hedi-launcher-portrait"><img src="/images/hedi-closeup.jpg" alt="" width={76} height={76} /></span>
      <span className="hedi-launcher-label" aria-hidden="true">HeDi</span>
      {open ? <span className="hedi-launcher-close" aria-hidden="true"><X size={13}/></span> : <span className="hedi-launcher-hint" aria-hidden="true">{tr('Porozmawiaj z HeDi', 'Praat met HeDi')}</span>}
    </button>
    {open && <section id="hedi-chat" role="dialog" aria-label={tr('Rozmowa z HeDi', 'Gesprek met HeDi')} className="fixed bottom-28 right-5 z-50 flex max-h-[calc(100dvh-156px)] w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-[24px] border border-teal/30 bg-panel/95 shadow-card backdrop-blur">
      <div className="flex items-center justify-between border-b border-line px-5 py-4"><div className="flex items-center gap-3"><img src="/images/hedi-closeup.jpg" alt="" width={40} height={40} className="h-10 w-10 rounded-full border border-teal/40 object-cover"/><div><p className="font-mono text-xs tracking-mega text-teal">HEDI</p><p className="mt-1 text-xs text-mist">{tr('Twój asystent AI', 'Je AI-assistent')}</p></div></div><button onClick={() => { setOpen(false); button.current?.focus(); }} aria-label={tr('Zamknij rozmowę', 'Gesprek sluiten')} className="rounded-full p-2 text-mist hover:text-teal"><X size={18}/></button></div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5" role="log" aria-live="polite" aria-relevant="additions text">
        <div className="rounded-2xl border border-line bg-black/25 p-4 text-sm leading-6 text-snow/90">{tr('Cześć! Jestem HeDi. Jak mogę pomóc Twojej firmie?', 'Hoi! Ik ben HeDi. Hoe kan ik jouw bedrijf helpen?')}</div>
        {messages.map((message, index) => <div key={index} className={`mt-3 whitespace-pre-wrap break-words rounded-2xl p-4 text-sm leading-6 ${message.role === 'user' ? 'ml-5 border border-teal/20 bg-teal/10 text-snow' : 'mr-3 border border-line bg-black/25 text-snow/90'}`}>{message.content}</div>)}
        {pending && <><div className="ml-5 mt-3 whitespace-pre-wrap break-words rounded-2xl border border-teal/20 bg-teal/10 p-4 text-sm leading-6">{pending}</div><p className="mt-3 font-mono text-[10px] text-teal" role="status">{tr('HeDi pisze…', 'HeDi typt…')}</p></>}
        {messages.length === 0 && status === 'available' && <div className="mt-4 flex flex-wrap gap-2">{questions.map(question => <button key={question} disabled={Boolean(pending)} onClick={() => send(question)} className="rounded-full border border-teal/30 px-3 py-2 text-xs text-teal disabled:opacity-50">{question}</button>)}</div>}
        {status === 'checking' && <p className="mt-4 text-xs text-mist" role="status">{tr('Łączenie z HeDi…', 'Verbinding maken met HeDi…')}</p>}
        {status === 'unavailable' && <p className="mt-4 text-sm leading-6 text-mist">{tr('HeDi jest chwilowo niedostępny. Chętnie pomożemy przez formularz kontaktowy.', 'HeDi is tijdelijk niet beschikbaar. We helpen je graag via het contactformulier.')} <a href="/#kontakt" onClick={() => setOpen(false)} className="text-teal underline">{tr('Kontakt', 'Contact')}</a></p>}
        {error && <p className="mt-4 text-sm leading-6 text-blaze" role="alert">{error}</p>}
        <div ref={end}/>
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-line p-4"><label className="sr-only" htmlFor="hedi-message">{tr('Wiadomość do HeDi', 'Bericht aan HeDi')}</label><input id="hedi-message" value={draft} onChange={event => setDraft(event.target.value)} maxLength={1000} disabled={Boolean(pending) || status !== 'available'} placeholder={tr('Napisz do HeDi…', 'Schrijf aan HeDi…')} className="input-dark !rounded-full !px-4 !py-3 !text-base"/><button type="submit" disabled={Boolean(pending) || status !== 'available' || !draft.trim()} aria-label={tr('Wyślij do HeDi', 'Verstuur naar HeDi')} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blaze text-ink disabled:opacity-40"><Send size={18}/></button></form>
      <a href="/polityka-prywatnosci" className="px-5 pb-4 text-[10px] leading-4 text-mist underline">{tr('Polityka prywatności', 'Privacybeleid')}</a>
    </section>}
  </>;
}
