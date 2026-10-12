import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, BookOpen, Paintbrush } from 'lucide-react';
import { useLang } from '../lib/i18n';

type Product = { id: number; title: string; description: string; category: 'ebook' | 'coloring'; language: string; price: number; cover: string | null; download: string | null };
type Category = 'all' | 'ebook' | 'coloring';

export default function Catalog() {
  const { lang, tr } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [state, setState] = useState<'loading' | 'ready' | 'disabled' | 'error'>('loading');
  const [nextPage, setNextPage] = useState<number | null>(null);
  const controller = useRef<AbortController | null>(null);
  async function load(page = 1) {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setState('loading');
    try {
      const response = await fetch(`/api/products?page=${page}`, { signal: abort.signal });
      if (!response.ok) throw new Error('Catalog unavailable');
      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error('Invalid catalogue');
      setProducts(current => page === 1 ? data.results : [...current, ...data.results]);
      setNextPage(data.nextPage);
      setState(data.status === 'not_configured' ? 'disabled' : 'ready');
    } catch (error) { if (!(error instanceof Error) || error.name !== 'AbortError') setState('error'); }
  }
  useEffect(() => { load(); return () => controller.current?.abort(); }, []);
  if (state === 'disabled') return null;
  const visible = products.filter(product => category === 'all' || product.category === category);
  const labels = { all: tr('Wszystko', 'Alles'), ebook: tr('Ebooki', 'E-books'), coloring: tr('Kolorowanki', 'Kleurplaten') };
  return <div id="biblioteka" className="mt-16" data-testid="catalog"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="kicker-line">{tr('// BIBLIOTEKA HEDOIX', '// HEDOIX-BIBLIOTHEEK')}</p><h3 className="mt-6 font-display text-3xl font-black">{tr('Ebooki i kolorowanki', 'E-books en kleurplaten')}</h3></div><div className="flex flex-wrap gap-2">{(['all', 'ebook', 'coloring'] as const).map(value => <button key={value} onClick={() => setCategory(value)} aria-pressed={category === value} className={`chip ${category === value ? 'border-teal/60 bg-teal/10 text-teal' : ''}`}>{labels[value]}</button>)}</div></div>
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map(product => <article className="panel-card overflow-hidden" key={product.id}><div className="relative grid aspect-[4/3] place-items-center bg-teal/5 text-teal">{product.cover ? <img className="h-full w-full object-cover" src={product.cover} alt={product.title} loading="lazy"/> : product.category === 'ebook' ? <BookOpen size={52}/> : <Paintbrush size={52}/>}<span className="chip absolute bottom-4 left-4 bg-ink/90">{labels[product.category]}</span></div><div className="p-7"><h4 className="font-display text-xl font-black">{product.title}</h4><p className="mt-4 whitespace-pre-line text-sm leading-7 text-mist">{product.description}</p><div className="my-6 flex justify-between gap-3 font-mono text-xs"><span className="text-teal">{product.price === 0 ? tr('Bezpłatnie', 'Gratis') : new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'pl-PL', { style: 'currency', currency: 'EUR' }).format(product.price)}</span><span className="text-mist">{product.language.toUpperCase()}</span></div>{product.download ? <a href={product.download} target="_blank" rel="noreferrer" className="btn-secondary">{tr('Pobierz', 'Downloaden')}<ArrowDownToLine size={16}/></a> : product.price > 0 ? <a className="btn-secondary" href="#kontakt">{tr('Zapytaj o produkt', 'Vraag naar dit product')}<ArrowUpRight size={16}/></a> : <p className="text-xs text-mist">{tr('Plik w przygotowaniu', 'Bestand in voorbereiding')}</p>}</div></article>)}</div>
    <div role="status" aria-live="polite" className="mt-6 text-sm text-mist">{state === 'loading' && <p>{tr('Wczytujemy bibliotekę…', 'Bibliotheek laden…')}</p>}{state === 'error' && <><p>{tr('Nie możemy teraz wczytać biblioteki.', 'De bibliotheek kan nu niet worden geladen.')}</p><button onClick={() => load(nextPage || 1)} className="btn-secondary mt-4">{tr('Spróbuj ponownie', 'Probeer opnieuw')}</button></>}{state === 'ready' && visible.length === 0 && <p>{tr('Pierwsze publikacje pojawią się tutaj wkrótce.', 'De eerste publicaties verschijnen hier binnenkort.')}</p>}</div>{nextPage && state !== 'loading' && <button onClick={() => load(nextPage)} className="btn-secondary mt-6">{tr('Pokaż więcej', 'Meer tonen')}</button>}
  </div>;
}
