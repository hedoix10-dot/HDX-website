import { useState } from 'react';
import Reveal from '../components/Reveal';
import { useContent } from '../lib/useContent';
import { useFormDelivery } from '../lib/useFormDelivery';
import { useLang } from '../lib/i18n';
import { Link } from 'react-router-dom';

export default function Signup() {
  const { interests } = useContent();
  const [selected, setSelected] = useState<number[]>([]);
  const { tr } = useLang();
  const { loading, draft, endpoint, deliver, clearDraft } = useFormDelivery('newsletter');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      type: 'newsletter',
      name: form.get('name'),
      email: form.get('email'),
      interests: selected.map(index => interests[index]),
      consent: form.get('consent') === 'on',
    };
    if (await deliver(payload)) { formElement.reset(); setSelected([]); }
  }

  return (
    <section id="zapis" className="container-x py-24">
      <Reveal className="panel-card p-8 md:p-12">
        <h2 className="section-title max-w-5xl">
          {tr("WKÓTCE WIĘCEJ.", "BINNENKORT MEER.")} <span className="text-blaze text-glow-orange">{tr("CHCESZ WIEDZIEĆ PIERWSZY?", "WIL JE HET ALS EERSTE WETEN?")}</span>
        </h2>
        <p className="section-subtitle">{tr("Zostaw kontakt — damy znać, gdy pojawią się nowe projekty i narzędzia.", "Laat je e-mail achter — we informeren je over nieuwe projecten en tools.")}</p>
        <form onSubmit={submit} onChange={clearDraft} className="mt-10 grid gap-6" data-testid="signup-form">
          <div className="grid gap-5 md:grid-cols-2">
            <input name="name" required aria-label={tr('Imię', 'Naam')} placeholder={tr('IMIĘ', 'NAAM')} className="input-dark" />
            <input name="email" required type="email" aria-label="E-mail" placeholder="E-MAIL" className="input-dark" />
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-mega text-mist">{tr("CZYM JESTEŚ ZAINTERESOWANY?", "WAAR BEN JE IN GEÏNTERESSEERD?")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {interests.map((item, index) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => { clearDraft(); setSelected(s => s.includes(index) ? s.filter(x => x !== index) : [...s, index]); }}
                  aria-pressed={selected.includes(index)}
                  className={`chip transition ${selected.includes(index) ? 'border-teal/60 bg-teal/10 text-teal' : 'hover:border-blaze/50 hover:text-blaze'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm text-mist">
            <input name="consent" required type="checkbox" className="mt-1 accent-[#FF6A00]" />
            <span>{tr('Zgadzam się na przetwarzanie moich danych w celu kontaktu —', 'Ik geef toestemming voor de verwerking van mijn gegevens —')} <Link to="/polityka-prywatnosci" className="text-teal underline">{tr('polityka prywatności', 'privacybeleid')}</Link>.</span>
          </label>
          {!endpoint && <p className="text-xs leading-6 text-mist">{tr('Formularz przygotuje e-mail. Wyślij go w swoim programie pocztowym.', 'Dit formulier bereidt een e-mail voor. Verzend hem in je e-mailprogramma.')}</p>}
          <button disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? tr('ZAPISYWANIE…', 'VERZENDEN…') : endpoint ? tr('ZOSTAW KONTAKT', 'LAAT JE E-MAIL ACHTER') : tr('PRZYGOTUJ WIADOMOŚĆ', 'BERICHT VOORBEREIDEN')}</button>
          {draft && <div role="status" className="text-sm leading-7 text-mist"><p>{tr('Wiadomość jest gotowa. Otwórz ją i potwierdź wysłanie w programie pocztowym.', 'Je bericht is klaar. Open het en bevestig de verzending in je e-mailprogramma.')}</p><a href={draft} className="mt-3 inline-block text-teal underline">{tr('Otwórz wiadomość e-mail', 'E-mailbericht openen')}</a></div>}
        </form>
      </Reveal>
    </section>
  );
}
