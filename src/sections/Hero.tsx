import { ArrowUpRight } from 'lucide-react';
import Ticker from '../components/Ticker';
import { useLang } from '../lib/i18n';

export default function Hero() {
  const { t, tr } = useLang();
  return (
    <section id="start" className="relative overflow-hidden pt-[72px]">
      <div className="container-x grid min-h-[calc(100vh-72px)] items-start gap-12 py-16 lg:grid-cols-[1.45fr_0.65fr] lg:py-10">
        <div className="hero-copy">
          <p className="kicker">{t.eyebrow}</p>
          <h1 className="hero-title mt-7 font-display font-black leading-[1.04] tracking-tight">
            <span className="block">{t.titleA}</span>
            <span className="block text-blaze text-glow-orange">{t.titleB}</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-mist">{t.heroText}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#automatyzacje" className="btn-primary">{t.ctaOffer}</a>
            <a href="#kontakt" className="btn-secondary">{t.ctaTalk}<ArrowUpRight size={16} /></a>
          </div>
          <p className="mt-10 font-mono text-[11px] tracking-mega text-mist/70">{tr("HEDOIX © 2026 — AI · SAAS · AUTOMATYZACJA", "HEDOIX © 2026 — AI · SAAS · AUTOMATISERING")}</p>
        </div>
        <div className="hero-portrait relative mx-auto w-full max-w-[360px] lg:mt-28">
          <div className="absolute -inset-8 rounded-full bg-blaze/10 blur-3xl" />
          <div className="image-frame float-slow relative aspect-[4/5]">
            <img src="/images/hedi-hero.jpg" alt="HeDi — maskotka HeDoiX" />
            <div className="absolute left-4 top-4 rounded-full border border-teal/40 bg-ink/80 px-4 py-2 font-mono text-[10px] tracking-mega text-teal backdrop-blur">
              HEDI ONLINE
            </div>
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-line bg-panel/95 px-5 py-3 font-mono text-[11px] tracking-mega text-snow shadow-card backdrop-blur">
            {tr("HeDi — maskotka HeDoiX", "HeDi — de HeDoiX-mascotte")} </div>
        </div>
      </div>
      <Ticker />
    </section>
  );
}
