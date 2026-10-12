import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useContent } from '../lib/useContent';
import { useLang } from '../lib/i18n';

const labels: Record<string, keyof ReturnType<typeof useLang>['t']> = {
  start: 'start',
  automatyzacje: 'automations',
  'pakiet-hero': 'heroPackage',
  'creative-ai': 'creative',
  edukacja: 'education',
  kontakt: 'contact',
};

export default function Header() {
  const { navItems } = useContent();
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { function close(event: KeyboardEvent) { if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); } } if (open) document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main navigation" className="hidden items-center gap-5 font-mono text-[10px] tracking-mega text-snow/80 xl:gap-8 lg:flex">
          {navItems.map((item) => (
            <a key={item.id} href={`/#${item.id}`} className="transition hover:text-teal" data-testid={`nav-link-${item.id}`}>
              {t[labels[item.id]]}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex overflow-hidden rounded-full border border-line bg-panel p-1">
            <button onClick={() => setLang('pl')} aria-pressed={lang === 'pl'} className={`rounded-full px-3 py-1 font-mono text-[11px] tracking-mega ${lang === 'pl' ? 'bg-teal/15 text-teal' : 'text-mist'}`}>PL</button>
            <button onClick={() => setLang('nl')} aria-pressed={lang === 'nl'} className={`rounded-full px-3 py-1 font-mono text-[11px] tracking-mega ${lang === 'nl' ? 'bg-teal/15 text-teal' : 'text-mist'}`}>NL</button>
          </div>
          <a href="/#kontakt" className="btn-primary !px-4 !text-[10px] xl:!px-6">{t.cta}</a>
        </div>
        <button ref={menuButton} onClick={() => setOpen(v => !v)} className="grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden" aria-label={open ? (lang === 'pl' ? 'Zamknij menu' : 'Menu sluiten') : (lang === 'pl' ? 'Otwórz menu' : 'Menu openen')} aria-expanded={open} aria-controls="mobile-menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-line bg-ink/95 px-5 pb-6 pt-4 lg:hidden">
          <div className="grid gap-4 font-mono text-[12px] tracking-mega text-snow/85">
            {navItems.map((item) => (
              <a key={item.id} href={`/#${item.id}`} onClick={() => setOpen(false)} data-testid={`mobile-nav-${item.id}`}>{t[labels[item.id]]}</a>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={() => setLang('pl')} aria-pressed={lang === 'pl'} className={`chip ${lang === 'pl' ? 'border-teal/60 text-teal' : ''}`}>PL</button>
            <button onClick={() => setLang('nl')} aria-pressed={lang === 'nl'} className={`chip ${lang === 'nl' ? 'border-teal/60 text-teal' : ''}`}>NL</button>
            <a href="/#kontakt" onClick={() => setOpen(false)} className="btn-primary flex-1 !px-3 !text-[10px]">{t.cta}</a>
          </div>
        </div>
      )}
    </header>
  );
}
