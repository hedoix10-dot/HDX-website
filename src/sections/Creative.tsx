import { useLang } from '../lib/i18n';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';

export default function Creative() {
  const { tr } = useLang();
  return (
    <section id="creative-ai" className="container-x py-24">
      <Reveal>
        <p className="kicker-line">{tr("// CREATIVE & AI — NASZE \"SIGNATURE DISH\"", "// CREATIVE & AI — ONS SIGNATURE DISH")}</p>
        <h2 className="section-title mt-6">
          CREATIVE <span className="text-blaze text-glow-orange">& AI</span>
        </h2>
        <p className="section-subtitle">{tr("Maskotki i asystenci, którzy dają marce charakter — i realnie rozmawiają z klientami.", "Mascottes en assistenten die je merk karakter geven — en met klanten praten.")}</p>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal className="relative">
          <div className="image-frame aspect-[4/5] max-w-[430px]">
            <img src="/images/hedi-closeup.jpg" alt="HeDi — Anime/3D" />
          </div>
          <div className="absolute -right-3 top-6 rounded-full border border-teal/40 bg-ink/85 px-4 py-2 font-mono text-[10px] tracking-mega text-teal backdrop-blur">
            HEDI — ANIME/3D
          </div>
        </Reveal>

        <div className="grid content-start gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal className="panel-card panel-card-hover border-blaze/25 p-7">
              <h3 className="font-display text-lg font-black leading-tight">{tr("OŻYWIONE AWATARY I MASKOTKI", "LEVENDE AVATARS EN MASCOTTES")}</h3>
              <p className="mt-4 text-sm leading-7 text-mist">{tr("Postacie Anime/3D — jak HeDi — z animacjami wejścia, czekania i interakcji. Twoja firma dostaje twarz, którą klienci zapamiętują.", "Anime/3D-personages zoals HeDi met animaties en interacties. Je bedrijf krijgt een gezicht dat klanten onthouden.")}</p>
            </Reveal>
            <Reveal delay={0.06} className="panel-card panel-card-hover border-teal/25 p-7">
              <h3 className="font-display text-lg font-black leading-tight">{tr("INTELIGENTNI ASYSTENCI AI", "INTELLIGENTE AI-ASSISTENTEN")}</h3>
              <p className="mt-4 text-sm leading-7 text-mist">{tr("Postać zintegrowana z systemem (Botpress, Voiceflow, OpenAI), która realnie rozmawia z klientami na stronie lub w komunikatorach, np. WhatsApp.", "Een personage gekoppeld aan Botpress, Voiceflow of OpenAI, dat klanten helpt op je website en in berichtenapps zoals WhatsApp.")}</p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="rounded-[22px] border border-line bg-black/25 p-6 text-lg text-snow/90 shadow-card">
            {tr("Cześć! Jestem HeDi. Jak mogę pomóc Twojej firmie?", "Hoi! Ik ben HeDi. Hoe kan ik jouw bedrijf helpen?")} </Reveal>
          <Reveal delay={0.14} className="inline-flex w-fit items-center gap-3 rounded-full border border-line bg-panel/70 px-5 py-3 font-mono text-[11px] tracking-mega text-mist">
            <span className="flex gap-1">
              <i className="blink-dot h-1.5 w-1.5 rounded-full bg-blaze" />
              <i className="blink-dot h-1.5 w-1.5 rounded-full bg-teal [animation-delay:.2s]" />
              <i className="blink-dot h-1.5 w-1.5 rounded-full bg-snow/70 [animation-delay:.4s]" />
            </span>
            {tr("HEDI PISZE…", "HEDI TYPT…")} </Reveal>
          <Reveal delay={0.18}><a href="#kontakt" className="btn-secondary mt-2">{tr("POZNAJ MOŻLIWOŚCI", "ONTDEK DE MOGELIJKHEDEN")} <ArrowUpRight size={16} /></a></Reveal>
        </div>
      </div>
    </section>
  );
}
