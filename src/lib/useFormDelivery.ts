import { useState } from 'react';
import { toast } from 'sonner';
import { useLang } from './i18n';
import { contact } from './content';

export function useFormDelivery(type: 'contact' | 'newsletter') {
  const { tr } = useLang();
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const endpoint = (type === 'contact' ? import.meta.env.VITE_CONTACT_ENDPOINT : import.meta.env.VITE_SIGNUP_ENDPOINT) || import.meta.env.VITE_WEBHOOK_URL;
  async function deliver(payload: Record<string, unknown>) {
    setDraft('');
    if (!endpoint) {
      const body = Object.entries(payload).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value ?? '')}`).join('\n');
      setDraft(`mailto:${contact.email}?subject=${encodeURIComponent(`HeDoiX — ${type}`)}&body=${encodeURIComponent(body)}`);
      return false;
    }
    setLoading(true);
    try {
      const url = new URL(endpoint, window.location.origin);
      if ((url.protocol !== 'https:' && url.origin !== window.location.origin) || url.username || url.password) throw new Error('Invalid endpoint');
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ type, ...payload }), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('Submission rejected');
      toast.success(tr('Zgłoszenie wysłane. Dziękujemy!', 'Je aanvraag is verzonden. Bedankt!'));
      return true;
    } catch {
      toast.error(tr('Nie udało się wysłać zgłoszenia. Spróbuj ponownie lub napisz do nas e-mail.', 'Verzenden is niet gelukt. Probeer opnieuw of stuur ons een e-mail.'));
      return false;
    } finally { setLoading(false); }
  }
  return { loading, draft, endpoint, deliver, clearDraft: () => setDraft('') };
}
