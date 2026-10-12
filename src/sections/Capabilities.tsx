import { useLang } from '../lib/i18n';
import Reveal from '../components/Reveal';
import { useContent } from '../lib/useContent';
import { Sparkles, Wand2 } from 'lucide-react';

export default function Capabilities() {
  const { hediCapabilities } = useContent();
  const { tr } = useLang();
  return (
    <section className="container-x py-24">
      <Reveal>
        <h2 className="section-title">
          {tr("CO POTRAFI", "WAT KAN")} <span className="text-teal text-glow-teal">HEDI AI</span>
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {hediCapabilities.map((item, i) => {
          const Icon = i % 2 === 0 ? Wand2 : Sparkles;
          return (
            <Reveal key={item.title} delay={i * 0.05} className="panel-card panel-card-hover p-7">
              <div className="flex gap-5">
                <div className="icon-box border-blaze/30 bg-blaze/10 text-blaze"><Icon size={20} /></div>
                <div>
                  <h3 className="font-mono text-[13px] font-bold tracking-mega text-blaze">{item.title}</h3>
                  <p className="mt-3 leading-7 text-mist">{item.text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
