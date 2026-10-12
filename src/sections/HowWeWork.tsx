import { useLang } from '../lib/i18n';
import Reveal from '../components/Reveal';
import { useContent } from '../lib/useContent';

export default function HowWeWork() {
  const { howWeWork } = useContent();
  const { tr } = useLang();
  return (
    <section className="container-x py-10">
      <Reveal>
        <h2 className="section-title">{tr("JAK", "HOE WE")} <span className="text-teal text-glow-teal">{tr("PRACUJEMY", "WERKEN")}</span></h2>
      </Reveal>
      <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {howWeWork.map((step, i) => (
          <Reveal key={step.no} delay={i * 0.06} className="panel-card panel-card-hover p-7">
            <p className="font-mono text-sm text-blaze">{step.no}</p>
            <h3 className="mt-5 font-display text-lg font-black">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-mist">{step.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
