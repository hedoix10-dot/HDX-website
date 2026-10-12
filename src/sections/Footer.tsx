import { useLang } from '../lib/i18n';
import Logo from '../components/Logo';

export default function Footer() {
  const { tr, t } = useLang();
  return (
    <footer className="border-t border-line bg-panel/50">
      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1fr_auto]">
        <div>
          <Logo />
          <p className="mt-4 font-mono text-[12px] tracking-mega text-mist">YOUR AI & B2B SAAS EVOLUTION</p>
        </div>
        <div className="flex flex-wrap gap-8 font-mono text-[11px] tracking-mega text-snow/75">
          {[["HEDOIX AI", 'start'], [t.automations, 'automatyzacje'], [t.heroPackage, 'pakiet-hero'], [t.creative, 'creative-ai'], [t.contact, 'kontakt']].map(([label, id]) => (
            <a key={id} href={`/#${id}`} className="hover:text-teal">{label}</a>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col justify-between gap-3 py-6 font-mono text-[11px] tracking-mega text-mist md:flex-row">
          <p>Copyright 2026 HeDoiX</p>
          <a href="/polityka-prywatnosci" className="hover:text-teal">{tr("Polityka prywatności", "Privacybeleid")}</a>
          <p>HDX // AI SYSTEMS</p>
        </div>
      </div>
    </footer>
  );
}
