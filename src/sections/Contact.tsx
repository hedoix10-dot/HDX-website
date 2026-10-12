import { Mail, Phone, Radio, Send, Timer } from 'lucide-react';
import Reveal from '../components/Reveal';
import { contact } from '../lib/content';
import { useFormDelivery } from '../lib/useFormDelivery';
import { Link } from 'react-router-dom';
import { useLang } from '../lib/i18n';

export default function Contact() {
  const { tr } = useLang();
  const { loading, draft, endpoint, deliver, clearDraft } = useFormDelivery('contact');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    if (payload.website) return;
    delete payload.website;
    if (await deliver(payload)) form.reset();
  }

  return (
    <section id="kontakt" className="container-x py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="kicker-line">{tr("// KONTAKT", "// CONTACT")}</p>
          <h2 className="section-title mt-6">
            {tr("ZBUDUJMY", "BOUW MET ONS AAN")} <span className="text-blaze text-glow-orange">{tr("TWOJĄ PRZEWAGĘ AI", "JOUW AI-VOORSPRONG")}</span>
          </h2>
          <p className="section-subtitle">{tr("Opowiedz nam o swoim biznesie — HeDi i zespół HeDoiX zaproponują ścieżkę automatyzacji dopasowaną do Twoich procesów.", "Vertel ons over je bedrijf — HeDi en het HeDoiX-team stellen automatiseringen voor die passen bij jouw processen.")}</p>
          <div className="mt-10 grid gap-4">
            <a href={`mailto:${contact.email}`} className="panel-card panel-card-hover flex items-center gap-4 p-5">
              <div className="icon-box"><Mail size={20} /></div>
              <div><p className="font-mono text-[10px] tracking-mega text-mist">E-MAIL</p><p className="mt-1 text-snow">{contact.email}</p></div>
            </a>
            <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="panel-card panel-card-hover flex items-center gap-4 p-5">
              <div className="icon-box"><Phone size={20} /></div>
              <div><p className="font-mono text-[10px] tracking-mega text-mist">{tr("TELEFON", "TELEFOON")}</p><p className="mt-1 text-snow">{contact.phone}</p></div>
            </a>
            <div className="panel-card flex items-center justify-between gap-4 p-5 text-mist">
              <p className="font-mono text-[11px] tracking-mega">{tr("SOCIAL MEDIA — WKRÓTCE", "SOCIAL MEDIA — BINNENKORT")}</p>
              <div className="flex gap-3 text-teal"><Radio size={18} /><Send size={18} /></div>
            </div>
            <div className="panel-card flex items-center gap-4 border-teal/25 p-5">
              <div className="icon-box"><Timer size={20} /></div>
              <p className="text-sm leading-6 text-mist">{tr("HeDi odpowiada na każde zgłoszenie —", "HeDi beantwoordt je aanvraag —")} <span className="text-teal">{tr("zwykle w 24h", "meestal binnen 24 uur")}</span>.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="panel-card relative overflow-hidden p-7 md:p-9">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal via-blaze to-teal" />
          <form onSubmit={submit} onChange={clearDraft} className="grid gap-5" data-testid="contact-form">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2"><span className="font-mono text-[10px] tracking-mega text-mist">{tr("IMIĘ I NAZWISKO *", "VOOR- EN ACHTERNAAM *")}</span><input name="name" required className="input-dark" placeholder="Jan Kowalski" /></label>
              <label className="grid gap-2"><span className="font-mono text-[10px] tracking-mega text-mist">E-MAIL *</span><input name="email" type="email" required className="input-dark" placeholder="jan@firma.pl" /></label>
            </div>
            <label className="grid gap-2"><span className="font-mono text-[10px] tracking-mega text-mist">{tr("FIRMA (OPCJONALNIE)", "BEDRIJF (OPTIONEEL)")}</span><input name="company" className="input-dark" placeholder="Nazwa Twojej firmy" /></label>
            <label className="grid gap-2"><span className="font-mono text-[10px] tracking-mega text-mist">{tr("WIADOMOŚĆ *", "BERICHT *")}</span><textarea name="message" required className="input-dark min-h-44" placeholder="W czym może pomóc HeDi?" /></label>
            <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className="flex items-start gap-3 text-sm text-mist"><input name="consent" required type="checkbox" className="mt-1 accent-[#FF6A00]" /><span>{tr('Zgadzam się na przetwarzanie moich danych w celu kontaktu zgodnie z', 'Ik geef toestemming voor de verwerking van mijn gegevens volgens het')} <Link to="/polityka-prywatnosci" className="text-teal underline">{tr('polityką prywatności', 'privacybeleid')}</Link>.</span></label>
            {!endpoint && <p className="text-xs leading-6 text-mist">{tr('Formularz przygotuje e-mail. Wyślij go w swoim programie pocztowym.', 'Dit formulier bereidt een e-mail voor. Verzend hem in je e-mailprogramma.')}</p>}
            <button disabled={loading} className="btn-primary w-full disabled:opacity-60"><Send size={16} /> {loading ? tr('WYSYŁANIE…', 'VERZENDEN…') : endpoint ? tr('WYŚLIJ WIADOMOŚĆ', 'BERICHT VERZENDEN') : tr('PRZYGOTUJ WIADOMOŚĆ', 'BERICHT VOORBEREIDEN')}</button>
            {draft && <div role="status" className="text-sm leading-7 text-mist"><p>{tr('Wiadomość jest gotowa. Otwórz ją i potwierdź wysłanie w programie pocztowym.', 'Je bericht is klaar. Open het en bevestig de verzending in je e-mailprogramma.')}</p><a href={draft} className="mt-3 inline-block text-teal underline">{tr('Otwórz wiadomość e-mail', 'E-mailbericht openen')}</a></div>}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
