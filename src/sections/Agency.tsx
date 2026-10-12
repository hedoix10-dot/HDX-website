import { useLang } from '../lib/i18n';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import { useContent } from '../lib/useContent';
import { Bell, Bot, FileText, Radio, Share2, Users } from 'lucide-react';

const icons = { users: Users, bot: Bot, share: Share2, rss: Radio, file: FileText, bell: Bell };

export default function Agency() {
  const { automationCards, crmAutomations, pillars } = useContent();
  const { tr } = useLang();
  return (
    <section id="automatyzacje" className="container-x py-24">
      <Reveal>
        <p className="kicker-line">{tr("// AGENCJA B2B I AUTOMATYZACJE", "// B2B-BUREAU EN AUTOMATISERING")}</p>
        <h2 className="section-title mt-6">
          {tr("AGENCJA", "BUREAU")} <span className="text-blaze text-glow-orange">B2B</span>  {tr("I", "EN")} <span className="text-teal text-glow-teal">{tr("AUTOMATYZACJE", "AUTOMATISERING")}</span>
        </h2>
        <p className="section-subtitle">{tr("Trzy filary, na których budujemy przewagę naszych klientów.", "Drie pijlers waarmee we onze klanten vooruit helpen.")}</p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal key={p.no} delay={i * 0.08} className={`panel-card panel-card-hover p-8 ${i === 1 ? 'border-teal/35 shadow-glow-teal' : ''}`}>
            <p className="font-mono text-sm text-blaze">{p.no}</p>
            <h3 className="mt-6 font-display text-[22px] font-black leading-tight">{p.title}</h3>
            <p className={`mt-5 text-sm leading-7 ${i === 1 ? 'font-semibold text-teal' : i === 2 ? 'font-semibold text-blaze' : 'font-semibold text-blaze'}`}>{p.lead}</p>
            <p className="mt-3 leading-7 text-mist">{p.text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-20">
        <h3 className="section-title text-[28px] md:text-[42px]">
          {tr("AUTOMATYZACJE DLA", "AUTOMATISERING VOOR")} <span className="text-teal text-glow-teal">{tr("FIRM", "BEDRIJVEN")}</span>
        </h3>
      </Reveal>
      <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {automationCards.map((card, i) => {
          const Icon = icons[card.icon as keyof typeof icons];
          return (
            <Reveal key={card.title} delay={i * 0.04} className={`panel-card panel-card-hover p-6 ${i === 0 ? 'border-teal/50 shadow-glow-teal' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="icon-box"><Icon size={20} /></div>
                <div>
                  <h4 className="font-semibold leading-snug text-snow">{card.title}</h4>
                  <p className="mt-3 text-sm leading-6 text-mist">{card.text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-20 grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <h3 className="section-title text-[28px] md:text-[42px]">
            {tr("ŁATWE AUTOMATYZACJE", "SLIMME AUTOMATISERING")} <span className="text-blaze text-glow-orange">{tr("Z CRM", "MET CRM")}</span>
          </h3>
          <div className="mt-8 grid gap-4">
            {crmAutomations.map((item) => (
              <div key={item} className="flex items-center gap-4 rounded-2xl border border-line bg-panel/60 px-5 py-4">
                <span className="check-dot"><ArrowRight size={14} /></span>
                <p className="text-sm text-snow/90">{item}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.12} className="image-frame aspect-[4/3]">
          <img src="/images/dashboard.jpg" alt="Automatyzacje CRM" />
        </Reveal>
      </div>
    </section>
  );
}
