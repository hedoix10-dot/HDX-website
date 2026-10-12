import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useLang } from './i18n';
import { contact } from './content';

export function useFormDelivery(type: 'contact' | 'newsletter') {
  const { tr, lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const externalEndpoint = (type === 'contact' ? import.meta.env.VITE_CONTACT_ENDPOINT : import.meta.env.VITE_SIGNUP_ENDPOINT) || import.meta.env.VITE_WEBHOOK_URL;
  const [configured, setConfigured] = useState(false);
  const [checking, setChecking] = useState(!externalEndpoint);
  const submission = useRef({ payload: '', id: '' });
  const sending = useRef(false);
  const endpoint = externalEndpoint || (configured ? `/api/forms/${type}` : '');
  useEffect(() => {
    if (externalEndpoint) return;
    const abort = new AbortController();
    fetch('/api/forms/status', { signal: AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]) }).then(response => response.ok ? response.json() : null).then(data => setConfigured(data?.[type] === true)).catch(() => {}).finally(() => { if (!abort.signal.aborted) setChecking(false); });
    return () => abort.abort();
  }, [type, externalEndpoint]);
  async function deliver(payload: Record<string, unknown>) {
    if (checking || sending.current) return false;
    setDraft('');
    if (!endpoint) {
      const body = Object.entries(payload).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value ?? '')}`).join('\n');
      setDraft(`mailto:${contact.email}?subject=${encodeURIComponent(`HeDoiX — ${type}`)}&body=${encodeURIComponent(body)}`);
      return false;
    }
    sending.current = true;
    setLoading(true);
    try {
      const url = new URL(endpoint, window.location.origin);
      if ((url.protocol !== 'https:' && url.origin !== window.location.origin) || url.username || url.password) throw new Error('Invalid endpoint');
      const data = { ...payload, type, language: lang };
      const serialized = JSON.stringify(data);
      if (submission.current.payload !== serialized) submission.current = { payload: serialized, id: crypto.randomUUID() };
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...data, submission_id: submission.current.id }), signal: AbortSignal.timeout(25000) });
      if (response.status === 429) {
        toast.error(tr('Zbyt wiele prób. Spróbuj ponownie za 10 minut.', 'Te veel pogingen. Probeer het over 10 minuten opnieuw.'));
        return false;
      }
      if (!response.ok) throw new Error('Submission rejected');
      if (!externalEndpoint && (await response.json()).status !== 'accepted') throw new Error('Submission not saved');
      submission.current = { payload: '', id: '' };
      toast.success(type === 'contact' ? tr('Zgłoszenie wysłane. Dziękujemy!', 'Je aanvraag is verzonden. Bedankt!') : tr('Zapis przyjęty. Dziękujemy!', 'Je aanmelding is ontvangen. Bedankt!'));
      return true;
    } catch {
      toast.error(tr('Nie udało się wysłać zgłoszenia. Spróbuj ponownie lub napisz do nas e-mail.', 'Verzenden is niet gelukt. Probeer opnieuw of stuur ons een e-mail.'));
      return false;
    } finally { setLoading(false); sending.current = false; }
  }
  return { loading: loading || checking, draft, endpoint, deliver, clearDraft: () => setDraft('') };
}
