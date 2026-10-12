import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Lang = 'pl' | 'nl';

const dict = {
  pl: {
    start: 'START',
    automations: 'AUTOMATYZACJE',
    heroPackage: 'PAKIET HERO',
    creative: 'CREATIVE & AI',
    education: 'EDUKACJA',
    contact: 'KONTAKT',
    cta: 'UMÓW ROZMOWĘ',
    eyebrow: 'HEDOIX · AI & AUTOMATYZACJA',
    titleA: 'AUTOMATYZUJEMY FIRMĘ.',
    titleB: 'DAJEMY JEJ CHARAKTER.',
    heroText: 'Strony internetowe, automatyzacje i asystenci AI z własną maskotką. Mniej ręcznej roboty, więcej efektów.',
    ctaOffer: 'ZOBACZ OFERTĘ',
    ctaTalk: 'UMÓW ROZMOWĘ',
  },
  nl: {
    start: 'START',
    automations: 'AUTOMATISERING',
    heroPackage: 'HERO PAKKET',
    creative: 'CREATIVE & AI',
    education: 'EDUCATIE',
    contact: 'CONTACT',
    cta: 'PLAN GESPREK',
    eyebrow: 'HEDOIX · AI & AUTOMATISERING',
    titleA: 'WIJ AUTOMATISEREN BEDRIJVEN.',
    titleB: 'WIJ GEVEN KARAKTER.',
    heroText: 'Websites, automatiseringen en AI-assistenten met een eigen mascotte. Minder handwerk, meer resultaat.',
    ctaOffer: 'BEKIJK AANBOD',
    ctaTalk: 'PLAN GESPREK',
  },
} as const;

type Dict = { [K in keyof (typeof dict)['pl']]: string };

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict; tr: (pl: string, nl: string) => string }>({
  lang: 'pl',
  setLang: () => {},
  t: dict.pl,
  tr: (pl) => pl,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => { try { return localStorage.getItem('hdx-language') === 'nl' ? 'nl' : 'pl'; } catch { return 'pl'; } });
  useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('hdx-language', lang); } catch { /* Storage can be disabled. */ } }, [lang]);
  return <LangContext.Provider value={{ lang, setLang, t: dict[lang], tr: (pl, nl) => lang === 'pl' ? pl : nl }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
