import { useLang } from '../lib/i18n';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import Catalog from './Catalog';
import { useContent } from '../lib/useContent';

export default function Entertainment() {
  const { entertainmentCards } = useContent();
  const { tr } = useLang();
  return (
    <section id="rozrywka" className="container-x py-24">
      <Reveal>
        <p className="kicker-line">{tr("// ROZRYWKA I E-COMMERCE", "// CREATIVITEIT EN E-COMMERCE")}</p>
        <h2 className="section-title mt-6">
          {tr("ROZRYWKA", "CREATIVITEIT")} <span className="text-blaze text-glow-orange">E-COMMERCE</span>
        </h2>
        <p className="section-subtitle">{tr("Kreatywna strona HeDoiX — projekty, które lubimy i rozwijamy.", "De creatieve kant van HeDoiX — projecten die we graag ontwikkelen.")}</p>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {entertainmentCards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.07} className="panel-card panel-card-hover p-8">
            <h3 className="font-display text-xl font-black leading-tight">{card.title}</h3>
            <p className="mt-4 min-h-28 text-sm leading-7 text-mist">{card.text}</p>
            <div className="mt-7 rounded-full border border-line py-3 text-center font-mono text-[11px] tracking-mega text-mist">{card.status}</div>
          </Reveal>
        ))}
      </div>

      <Catalog />

      <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="image-frame aspect-[4/3]"><img src="/images/office-chaos.jpg" alt="Satyryczne kolorowanki PDF" /></Reveal>
        <Reveal delay={0.08}>
          <h3 className="font-display text-4xl font-black leading-tight md:text-5xl">{tr("SATYRYCZNE KOLOROWANKI PDF", "SATIRISCHE PDF-KLEURPLATEN")}</h3>
          <p className="mt-4 font-mono text-sm tracking-wide text-blaze">{tr("Biuro w pigułce — do pokolorowania", "Het kantoorleven — om in te kleuren")}</p>
          <p className="mt-5 max-w-xl leading-8 text-mist">{tr("Kolorowanki dla dorosłych i dla dzieci. Satyra na życie biurowe i korporacyjną rzeczywistość — pliki PDF do pobrania i druku w domu.", "Kleurplaten voor volwassenen en kinderen. Satire op het kantoorleven — PDF-bestanden om thuis af te drukken.")}</p>
          <a href="#zapis" className="btn-primary mt-8">{tr("POWIADOM MNIE O PREMIERZE", "HOUD ME OP DE HOOGTE")} <ArrowUpRight size={16} /></a>
        </Reveal>
      </div>

      <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <h3 className="font-display text-4xl font-black leading-tight md:text-5xl">{tr("EBOOKI I PORADNIKI", "E-BOOKS EN GIDSEN")}</h3>
          <p className="mt-4 font-mono text-sm tracking-wide text-teal">{tr("Automatyzacja bez lania wody", "Praktische automatisering")}</p>
          <p className="mt-5 max-w-xl leading-8 text-mist">{tr("Praktyczne poradniki: automatyzacja procesów, praca z AI i narzędziami No-Code — konkretnie, po polsku, z przykładami z realnych wdrożeń.", "Praktische gidsen over automatisering, AI en No-Code — in het Pools, met voorbeelden uit echte projecten.")}</p>
          <a href="#zapis" className="btn-primary mt-8">{tr("POWIADOM MNIE O PREMIERZE", "HOUD ME OP DE HOOGTE")} <ArrowUpRight size={16} /></a>
        </Reveal>
        <Reveal delay={0.08} className="image-frame order-1 aspect-[4/3] lg:order-2"><img src="/images/ebook-ai.jpg" alt="Ebooki i poradniki" /></Reveal>
      </div>

      <div className="mt-20 grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="relative image-frame aspect-[4/3]">
          <img src="/images/music-ai.jpg" alt="Muzyka AI — Human vs AI" />
          <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-full border border-teal/30 bg-ink/85 px-5 py-2 font-mono text-[10px] tracking-mega text-teal">{tr("PREMIERA WKÓTCE", "BINNENKORT")}</div>
        </Reveal>
        <Reveal delay={0.08}>
          <h3 className="font-display text-4xl font-black leading-tight md:text-5xl">{tr("MUZYKA AI — HUMAN VS. AI", "AI-MUZIEK — HUMAN VS. AI")}</h3>
          <p className="mt-4 font-mono text-sm tracking-wide text-blaze">{tr("Autorska muzyka kontra algorytm", "Originele muziek versus het algoritme")}</p>
          <p className="mt-5 max-w-xl leading-8 text-mist">{tr("Seria utworów i postów, w której muzyka pisana przez człowieka mierzy się z propozycjami wygenerowanymi przez AI. Ty decydujesz, kto wygrywa.", "Een serie waarin muziek van mensen het opneemt tegen AI-muziek. Jij bepaalt wie wint.")}</p>
          <a href="#zapis" className="btn-primary mt-8">{tr("POWIADOM MNIE O PREMIERZE", "HOUD ME OP DE HOOGTE")} <ArrowUpRight size={16} /></a>
        </Reveal>
      </div>

      <Reveal className="mt-16 rounded-[22px] border border-teal/25 bg-teal/5 p-5 text-center font-mono text-sm tracking-wide text-teal">
        {tr("Produkty są w przygotowaniu — zostaw kontakt, a damy znać o premierze jako pierwszy.", "De producten zijn in voorbereiding. Laat je e-mail achter en hoor als eerste over de lancering.")} </Reveal>

      <Reveal className="panel-card mt-8 overflow-hidden p-10 text-center md:p-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,106,0,0.14),transparent_45%)]" />
        <h3 className="section-title">{tr("GOTOWY NA", "KLAAR VOOR")} <span className="text-blaze text-glow-orange">{tr("EWOLUCJĘ AI?", "DE AI-EVOLUTIE?")}</span></h3>
        <p className="mx-auto mt-5 max-w-2xl leading-8 text-mist">{tr("Napisz do nas — HeDi i zespół HeDoiX wybiorą rozwiązanie najlepsze dla Twojego biznesu.", "Neem contact op — HeDi en het HeDoiX-team kiezen een oplossing die bij jouw bedrijf past.")}</p>
        <a href="#kontakt" className="btn-primary mt-8">{tr("SKONTAKTUJ SIĘ Z NAMI", "NEEM CONTACT OP")}</a>
      </Reveal>
    </section>
  );
}
