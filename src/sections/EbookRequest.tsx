import { Link, useParams } from 'react-router-dom';
import { ArrowDownToLine, BookOpen, Send } from 'lucide-react';
import ebooks from '../../shared/ebooks.json';
import { useLang } from '../lib/i18n';
import { useFormDelivery } from '../lib/useFormDelivery';

export default function EbookRequest() {
  const { bookId } = useParams();
  const book = ebooks.find(book => book.id === bookId);
  const { tr } = useLang();
  const { loading, draft, endpoint, deliver, clearDraft } = useFormDelivery('ebook');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    if (payload.website || !book) return;
    if (await deliver({ ...payload, book_id: book.id, book_title: book.title })) form.reset();
  }
  if (!book) return <section className="container-x pb-24 pt-36"><h1 className="section-title">{tr('Nie znaleziono ebooka', 'E-book niet gevonden')}</h1><Link className="btn-secondary mt-8" to="/#niderlandzki">{tr('Wróć do ebooków', 'Terug naar de e-books')}</Link></section>;
  return <section className="container-x max-w-3xl pb-24 pt-36">
    <Link className="btn-secondary" to="/#niderlandzki">{tr('Wróć do ebooków', 'Terug naar de e-books')}</Link>
    <div className="panel-card mt-8 p-7 md:p-10">
      <BookOpen className="text-teal" size={30}/>
      <p className="kicker mt-6">{tr('DARMOWY EBOOK / NIDERLANDZKI', 'GRATIS E-BOOK / NEDERLANDS')}</p>
      <h1 className="mt-6 font-display text-2xl font-black leading-snug md:text-4xl">{book.title}</h1>
      {book.downloadUrl && <a href={book.downloadUrl} download className="btn-primary mt-6"><ArrowDownToLine size={16}/>{tr('Pobierz PDF', 'PDF downloaden')}</a>}
      <p className="mt-5 leading-7 text-mist">{tr('Zostaw adres e-mail, na który chcesz otrzymać ten ebook. Zgłoszenie przekażemy zespołowi HeDoiX.', 'Laat het e-mailadres achter waarop je dit e-book wilt ontvangen. Je aanvraag wordt doorgestuurd naar het HeDoiX-team.')}</p>
      <form className="mt-8 grid gap-5" onSubmit={submit} onChange={clearDraft} data-testid="ebook-request-form">
        <label className="grid gap-2"><span>{tr('Imię', 'Naam')}</span><input name="name" required maxLength={120} className="input-dark"/></label>
        <label className="grid gap-2"><span>E-mail</span><input name="email" type="email" required maxLength={254} className="input-dark"/></label>
        <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
        <label className="flex items-start gap-3 text-sm leading-6 text-mist"><input name="consent" type="checkbox" required className="mt-1 accent-[#FF6A00]"/><span>{tr('Zgadzam się na wykorzystanie mojego imienia i adresu e-mail do obsługi prośby o ten ebook. Nie zapisuje mnie to do newslettera.', 'Ik geef toestemming om mijn naam en e-mailadres te gebruiken voor deze e-bookaanvraag. Dit meldt me niet aan voor de nieuwsbrief.')} <Link to="/polityka-prywatnosci" className="text-teal underline">{tr('Polityka prywatności', 'Privacybeleid')}</Link></span></label>
        {!endpoint && <p className="text-xs leading-6 text-mist">{tr('Formularz przygotuje e-mail. Otwórz go i wyślij w swoim programie pocztowym.', 'Het formulier bereidt een e-mail voor. Open en verstuur hem in je e-mailprogramma.')}</p>}
        <button className="btn-primary disabled:opacity-60" disabled={loading}><Send size={16}/>{loading ? tr('WYSYŁANIE…', 'VERZENDEN…') : endpoint ? tr('POPROŚ O EBOOK', 'E-BOOK AANVRAGEN') : tr('PRZYGOTUJ WIADOMOŚĆ', 'BERICHT VOORBEREIDEN')}</button>
        {draft && <div role="status"><p className="text-sm leading-7 text-mist">{tr('Prośba jest przygotowana. Potwierdź wysłanie w programie pocztowym.', 'Je aanvraag is klaar. Bevestig de verzending in je e-mailprogramma.')}</p><a href={draft} className="mt-3 inline-block text-teal underline">{tr('Otwórz wiadomość e-mail', 'E-mailbericht openen')}</a></div>}
      </form>
    </div>
  </section>;
}
