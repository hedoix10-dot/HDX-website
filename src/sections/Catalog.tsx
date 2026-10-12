import { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, BookOpen, Paintbrush } from 'lucide-react';
import { useLang } from '../lib/i18n';
import { Link } from 'react-router-dom';

type Product = { id: number; title: string; description: string; category: 'ebook' | 'coloring'; section?: 'education' | 'entertainment'; language: string; price: number; cover: string | null; download: string | null; fileName?: string | null };
type Category = 'all' | 'ebook' | 'coloring';
type FeaturedBook = { id: string; title: string; aliases?: string[]; downloadUrl?: string; coverUrl?: string; pages?: number };
const normalizedTitle = (title: string) => title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^e[-\s]?book\s*/i, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export default function Catalog({ section = 'entertainment', featuredBooks = [] }: { section?: 'education' | 'entertainment'; featuredBooks?: FeaturedBook[] }) {
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
  if (state === 'disabled' && featuredBooks.length === 0) return null;
  const visible = products.filter(product => (product.section || 'entertainment') === section && (section !== 'education' || (product.category === 'ebook' && product.price === 0)) && (category === 'all' || product.category === category));
  const featured = featuredBooks.map(book => ({ book, product: visible.find(product => [book.title, ...(book.aliases || [])].some(title => normalizedTitle(title) === normalizedTitle(product.title))) }));
  const featuredIds = new Set(featured.map(item => item.product?.id));
  const otherProducts = visible.filter(product => !featuredIds.has(product.id));
  const labels = { all: tr('Wszystko', 'Alles'), ebook: tr('Ebooki', 'E-books'), coloring: tr('Kolorowanki', 'Kleurplaten') };
  return <div id={section === 'education' ? 'ebooki-niderlandzki' : 'biblioteka'} className="mt-8" data-testid={section === 'education' ? 'education-catalog' : 'catalog'}>{section === 'entertainment' && <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="kicker-line">{tr('// BIBLIOTEKA HEDOIX', '// HEDOIX-BIBLIOTHEEK')}</p><h3 className="mt-6 font-display text-3xl font-black">{tr('Ebooki i kolorowanki', 'E-books en kleurplaten')}</h3></div><div className="flex flex-wrap gap-2">{(['all', 'ebook', 'coloring'] as const).map(value => <button key={value} onClick={() => setCategory(value)} aria-pressed={category === value} className={`chip ${category === value ? 'border-teal/60 bg-teal/10 text-teal' : ''}`}>{labels[value]}</button>)}</div></div>}
    {featured.length > 0 && <div className="grid gap-6 md:grid-cols-2">{featured.map(({ book, product }) => <article key={book.id} className="panel-card panel-card-hover overflow-hidden" data-testid={`ebook-card-${book.id}`}>
      <div className="relative grid h-[320px] place-items-center bg-teal/5 p-5 text-teal">
        {(product?.cover || book.coverUrl) ? <img src={product?.cover || book.coverUrl} alt={book.title} loading="lazy" className="h-full min-h-0 w-full object-contain"/> : <BookOpen size={64}/>}
        <span className="chip absolute bottom-4 left-4 border-teal/40 bg-ink/90 text-teal">{tr('ZA DARMO', 'GRATIS')}</span>
      </div>
      <div className="p-7"><h4 className="font-display text-xl font-black leading-snug">{book.title}</h4>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-mist">{product?.description || tr('Darmowy ebook do samodzielnej nauki języka niderlandzkiego.', 'Een gratis e-book om zelfstandig Nederlands te leren.')}</p>
        {book.pages && <p className="mt-4 font-mono text-xs text-teal">PDF · {book.pages} {tr('stron', "pagina's")}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {(product?.download || book.downloadUrl) ? <a href={product?.download || book.downloadUrl} download={product?.fileName || book.downloadUrl?.split('/').pop()} target="_blank" rel="noreferrer" className="btn-primary"><ArrowDownToLine size={16}/>{tr('Pobierz PDF', 'PDF downloaden')}</a> : <p className="text-sm text-mist">{tr('PDF w przygotowaniu', 'PDF wordt voorbereid')}</p>}
          <Link className="text-sm text-teal underline underline-offset-4" to={`/ebooki/${book.id}`}>{tr('Przejdź do formularza', 'Naar het formulier')}</Link>
        </div>
      </div>
    </article>)}</div>}
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{otherProducts.map(product => <article className="panel-card panel-card-hover overflow-hidden" key={product.id}><div className="relative grid aspect-[4/3] place-items-center bg-teal/5 text-teal">{product.cover ? <img className="h-full w-full object-cover" src={product.cover} alt={product.title} loading="lazy"/> : product.category === 'ebook' ? <BookOpen size={52}/> : <Paintbrush size={52}/>}<span className="chip absolute bottom-4 left-4 bg-ink/90">{labels[product.category]}</span></div><div className="p-7"><h4 className="font-display text-xl font-black">{product.title}</h4><p className="mt-4 whitespace-pre-line text-sm leading-7 text-mist">{product.description}</p><div className="my-6 flex justify-between gap-3 font-mono text-xs"><span className="text-teal">{product.price === 0 ? tr('Bezpłatnie', 'Gratis') : new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'pl-PL', { style: 'currency', currency: 'EUR' }).format(product.price)}</span><span className="text-mist">{product.language.toUpperCase()}</span></div>{product.download ? <a href={product.download} target="_blank" rel="noreferrer" className="btn-secondary">{tr('Pobierz', 'Downloaden')}<ArrowDownToLine size={16}/></a> : product.price > 0 ? <a className="btn-secondary" href="#kontakt">{tr('Zapytaj o produkt', 'Vraag naar dit product')}<ArrowUpRight size={16}/></a> : <p className="text-xs text-mist">{tr('Plik w przygotowaniu', 'Bestand in voorbereiding')}</p>}</div></article>)}</div>
    <div role="status" aria-live="polite" className="mt-6 text-sm text-mist">{state === 'loading' && <p>{tr('Wczytujemy bibliotekę…', 'Bibliotheek laden…')}</p>}{state === 'error' && <><p>{tr('Nie możemy teraz wczytać biblioteki.', 'De bibliotheek kan nu niet worden geladen.')}</p><button onClick={() => load(nextPage || 1)} className="btn-secondary mt-4">{tr('Spróbuj ponownie', 'Probeer opnieuw')}</button></>}{state === 'ready' && visible.length === 0 && featuredBooks.length === 0 && <p>{tr('Pierwsze publikacje pojawią się tutaj wkrótce.', 'De eerste publicaties verschijnen hier binnenkort.')}</p>}</div>{nextPage && state !== 'loading' && <button onClick={() => load(nextPage)} className="btn-secondary mt-6">{tr('Pokaż więcej', 'Meer tonen')}</button>}
  </div>;
}
