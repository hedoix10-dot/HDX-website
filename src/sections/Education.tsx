import { useLang } from '../lib/i18n';
import Reveal from '../components/Reveal';
import { useContent } from '../lib/useContent';
import Catalog from './Catalog';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ebooks from '../../shared/ebooks.json';

export default function Education() {
  const { educationCards } = useContent();
  const { tr } = useLang();
  return (
    <section id="edukacja" className="container-x py-24">
      <Reveal>
        <p className="kicker-line">{tr("// EDUKACJA", "// EDUCATIE")}</p>
        <h2 className="section-title mt-6">
          {tr("EDUKACJA", "EDUCATIE")} <span className="text-blaze text-glow-orange">{tr("I NO-CODE", "EN NO-CODE")}</span>
        </h2>
        <p className="section-subtitle">{tr("Darmowe aplikacje No-Code i narzędzia e-learningowe dla dzieci i dorosłych.", "Gratis No-Code-apps en e-learningtools voor kinderen en volwassenen.")}</p>
      </Reveal>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {educationCards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.07} className="panel-card panel-card-hover p-8">
            <span className={`chip ${i < 2 ? 'border-blaze/40 text-blaze' : ''}`}>{card.badge}</span>
            <h3 className="mt-7 font-display text-xl font-black leading-tight">{card.title}</h3>
            <p className="mt-4 min-h-20 text-sm leading-7 text-mist">{card.text}</p>
            <div className="mt-7 rounded-full border border-line py-3 text-center font-mono text-[11px] tracking-mega text-mist">{card.status}</div>
          </Reveal>
        ))}
      </div>
      <div className="mt-14" id="niderlandzki"><Reveal className="panel-card panel-card-hover p-7 md:p-10"><div className="flex flex-wrap items-center gap-4"><div className="icon-box"><BookOpen size={22}/></div><span className="chip border-teal/40 text-teal">{tr('ZA DARMO', 'GRATIS')}</span><span className="font-mono text-xs tracking-mega text-mist">NEDERLANDS</span></div><h3 className="mt-6 font-display text-2xl font-black md:text-3xl">{tr('Ebooki do nauki języka niderlandzkiego', 'E-books om Nederlands te leren')}</h3><p className="mt-4 max-w-3xl text-sm leading-7 text-mist">{tr('Darmowe materiały do samodzielnej nauki niderlandzkiego. Wybierz ebook i wypełnij formularz, aby otrzymać go e-mailem.', 'Gratis materiaal om zelfstandig Nederlands te leren. Kies een e-book en vul het formulier in om het per e-mail te ontvangen.')}</p><a href="#zapis" className="btn-secondary mt-6">{tr('Powiadom mnie o nowych ebookach', 'Houd me op de hoogte')}</a></Reveal>
      <div className="mt-6 grid gap-6 md:grid-cols-2">{ebooks.map(book => <article key={book.id} className="panel-card panel-card-hover p-7"><span className="chip border-teal/40 text-teal">{tr('ZA DARMO', 'GRATIS')}</span><h4 className="mt-6 font-display text-xl font-black leading-snug">{book.title}</h4><p className="mt-4 text-sm leading-7 text-mist">{tr('Poproś o ebook do nauki niderlandzkiego. W formularzu zostaw adres e-mail do wysyłki.', 'Vraag het e-book aan om Nederlands te leren. Laat je e-mailadres achter in het formulier.')}</p><Link className="btn-secondary mt-6" to={`/ebooki/${book.id}`}>{tr('Przejdź do formularza', 'Naar het formulier')}</Link></article>)}</div>
      <Catalog section="education"/></div>
      <Reveal className="mt-10 text-center"><a href="#zapis" className="btn-secondary">{tr("WIĘCEJ O EDUKACJI", "MEER OVER EDUCATIE")}</a></Reveal>
    </section>
  );
}
