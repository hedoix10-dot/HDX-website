import { useLang } from '../lib/i18n';
import { ArrowUpRight, Bot, Check, Globe, RefreshCw } from 'lucide-react';
import Reveal from '../components/Reveal';
import { useContent } from '../lib/useContent';

const iconMap = { globe: Globe, bot: Bot, refresh: RefreshCw };

export default function PackageHero() {
  const { packageCards, packageIncludes } = useContent();
  const { tr } = useLang();
  return (
    <section id="pakiet-hero" className="container-x py-24">
      <Reveal>
        <p className="kicker-line">{tr("// OFERTA HERO", "// HERO-PAKKET")}</p>
        <h2 className="section-title mt-6 max-w-5xl">
          {tr("PAKIET HERO:", "HERO-PAKKET:")} <span className="text-blaze text-glow-orange">{tr("TWOJA FIRMA NA AUTOPILOCIE", "JE BEDRIJF OP DE AUTOMATISCHE PILOOT")}</span>
        </h2>
        <p className="section-subtitle">{tr("Najpełniejszy pakiet HeDoiX w jednym wdrożeniu:", "Het meest complete HeDoiX-pakket in één implementatie:")}</p>
      </Reveal>

      <Reveal className="mt-10 max-w-3xl">
        <div className="grid gap-4">
          {packageIncludes.map((item) => (
            <div key={item} className="flex items-center gap-4 rounded-2xl border border-line bg-panel/60 px-5 py-4">
              <span className="check-dot"><Check size={14} /></span>
              <p className="text-snow/90">{item}</p>
            </div>
          ))}
        </div>
        <p className="mt-7 font-mono text-sm tracking-wide text-blaze">{tr("Jeden partner, jedno wdrożenie, gotowe rozwiązanie.", "Eén partner, één implementatie, een complete oplossing.")}</p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <a href="#kontakt" className="btn-primary">{tr("ZAPYTAJ O WYCENĘ", "VRAAG EEN OFFERTE")}</a>
          <a href="#kontakt" className="btn-secondary">{tr("CO ZAWIERA PAKIET?", "WAT ZIT ER IN HET PAKKET?")} <ArrowUpRight size={16} /></a>
          <span className="font-mono text-[11px] tracking-mega text-mist">{tr("WYCENA INDYWIDUALNA — BEZ CEN NA STRONIE.", "EEN OFFERTE OP MAAT.")}</span>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {packageCards.map((card, i) => {
          const Icon = iconMap[card.icon as keyof typeof iconMap];
          return (
            <Reveal key={card.title} delay={i * 0.08} className="panel-card panel-card-hover p-8">
              <div className="icon-box"><Icon size={20} /></div>
              <h3 className="mt-7 font-display text-[20px] font-black leading-tight">{card.title}</h3>
              <ul className="mt-6 grid gap-4">
                {card.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-mist">
                    <Check size={16} className="mt-1 shrink-0 text-teal" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-10 rounded-[26px] border border-blaze/25 bg-panel/70 p-6 text-center font-mono text-sm tracking-wide text-blaze shadow-glow-orange">
        {tr("○ Jeden partner, jedno wdrożenie, gotowe rozwiązanie.", "○ Eén partner, één implementatie, een complete oplossing.")} </Reveal>
    </section>
  );
}
