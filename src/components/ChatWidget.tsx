import { useLang } from '../lib/i18n';
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function ChatWidget() {
  const { tr } = useLang();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const questions = [tr('Potrzebuję strony', 'Ik wil een website'), tr('Chcę automatyzacji', 'Ik wil automatiseren'), tr('Co to Pakiet Hero?', 'Wat is het Hero-pakket?')];
  const answers = [tr('Projektujemy strony dopasowane do Twojej marki. Opowiedz nam o projekcie w formularzu kontaktowym.', 'We ontwerpen websites die bij je merk passen. Vertel ons over je project via het contactformulier.'), tr('Łączymy formularze, CRM, faktury i powiadomienia przez Make lub Zapier. Napisz, co dziś robisz ręcznie.', 'We koppelen formulieren, CRM, facturen en meldingen via Make of Zapier. Vertel ons wat je nu handmatig doet.'), tr('Pakiet Hero łączy stronę WWW, asystenta AI i automatyzację procesów. Zakres oraz wycenę ustalamy indywidualnie.', 'Het Hero-pakket combineert een website, AI-assistent en procesautomatisering. We bepalen de omvang en prijs samen.')];
  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls="hedi-chat"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-teal/40 bg-panel/90 px-4 py-3 font-mono text-[11px] tracking-mega text-teal shadow-glow-teal backdrop-blur"
      >
        <MessageCircle size={16} />
        HEDI
      </button>
      {open && (
        <div id="hedi-chat" className="fixed bottom-24 right-5 z-50 w-[320px] max-w-[calc(100vw-40px)] rounded-[24px] border border-line bg-panel/95 p-5 shadow-card backdrop-blur">
          <p className="font-mono text-[11px] tracking-mega text-teal">HEDI · DEMO</p>
          <div className="mt-4 rounded-2xl border border-line bg-black/25 p-4 text-sm text-snow/90">
            {tr("Cześć! Jestem HeDi. Jak mogę pomóc Twojej firmie?", "Hoi! Ik ben HeDi. Hoe kan ik jouw bedrijf helpen?")} </div>
          {selected !== null && <p className="mt-4 text-sm leading-6 text-mist" role="status">{answers[selected]}</p>}
          <div className="mt-4 flex flex-wrap gap-2">{questions.map((question, i) => <button key={i} onClick={() => setSelected(i)} className="rounded-full border border-teal/30 px-3 py-2 text-xs text-teal">{question}</button>)}</div>
          <p className="mt-4 text-xs leading-5 text-mist">{tr('Przykładowa rozmowa z gotowymi odpowiedziami.', 'Voorbeeldgesprek met vooraf ingestelde antwoorden.')}</p>
        </div>
      )}
    </>
  );
}
