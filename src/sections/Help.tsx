import { useLang } from '../lib/i18n';
import Reveal from '../components/Reveal';

export default function Help() {
  const { tr } = useLang();
  return (
    <section id="pomoc" className="container-x py-24">
      <Reveal>
        <p className="kicker-line">{tr("// POMOC", "// HULP")}</p>
        <h2 className="section-title mt-6">
          {tr("POMOC —", "HULP —")} <span className="text-blaze text-glow-orange">{tr("KANAŁY INFORMACYJNE UE", "EU-INFORMATIEKANALEN")}</span>
        </h2>
        <p className="section-subtitle">{tr("Rzetelne, merytoryczne informacje dla Polonii w Holandii — oparte na oficjalnych źródłach.", "Betrouwbare informatie voor Polen in Nederland — gebaseerd op officiële bronnen.")}</p>
      </Reveal>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Reveal className="panel-card panel-card-hover border-teal/25 p-8">
          <h3 className="font-display text-xl font-black">{tr("KANAŁ DLA POLONII W HOLANDII", "INFORMATIE VOOR POLEN IN NEDERLAND")}</h3>
          <p className="mt-5 leading-8 text-mist">{tr("Zautomatyzowany kanał informacyjny: rzetelne, merytoryczne informacje oparte na dyrektywach UE i oficjalnych holenderskich źródłach (Rijksoverheid, SNCU).", "Een geautomatiseerd informatiekanaal op basis van EU-richtlijnen en officiële Nederlandse bronnen: Rijksoverheid en SNCU.")}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {['DYREKTYWY UE', 'RIJKSOVERHEID', 'SNCU'].map((tag) => <span key={tag} className="chip border-teal/35 text-teal">{tag}</span>)}
          </div>
        </Reveal>
        <Reveal delay={0.08} className="panel-card panel-card-hover border-blaze/25 p-8">
          <h3 className="font-display text-xl font-black">{tr("CASE STUDY: \"TYLKO ZA MOJĄ ZGODĄ\"", "CASE STUDY: \"ALLEEN MET MIJN TOESTEMMING\"")}</h3>
          <p className="mt-5 leading-8 text-mist">{tr("System, w którym posty generowane automatycznie (Make.com) trafiają do social mediów dopiero po zatwierdzeniu w tabeli. Pełna kontrola nad AI.", "Automatisch gegenereerde posts uit Make.com worden pas gepubliceerd na goedkeuring in een tabel. Volledige controle over AI.")}</p>
        </Reveal>
      </div>
      <Reveal className="mt-6 rounded-[22px] border border-line bg-panel/60 p-5 text-sm text-mist">{tr("Treści mają charakter informacyjny i nie stanowią porady prawnej.", "De inhoud is informatief en vormt geen juridisch advies.")}</Reveal>
      <Reveal className="mt-8 text-center"><a href="#zapis" className="btn-secondary">{tr("WIĘCEJ O POMOCY", "MEER OVER HULP")}</a></Reveal>
    </section>
  );
}
