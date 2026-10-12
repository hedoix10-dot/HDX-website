import Header from './components/Header';
import ChatWidget from './components/ChatWidget';
import Hero from './sections/Hero';
import Agency from './sections/Agency';
import PackageHero from './sections/PackageHero';
import Creative from './sections/Creative';
import HowWeWork from './sections/HowWeWork';
import Capabilities from './sections/Capabilities';
import Education from './sections/Education';
import Help from './sections/Help';
import Entertainment from './sections/Entertainment';
import Signup from './sections/Signup';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import Privacy from './sections/Privacy';
import EbookRequest from './sections/EbookRequest';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useLang } from './lib/i18n';

export default function App() {
  const { tr } = useLang();
  const location = useLocation();
  useEffect(() => { if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView()); else window.scrollTo(0, 0); }, [location.pathname, location.hash]);
  return (
    <div className="site-surface min-h-screen text-snow">
      <Header />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-teal focus:p-4 focus:text-ink">{tr('Przejdź do treści', 'Ga naar de inhoud')}</a>
      <main id="main">
        <Routes><Route path="/" element={<>
        <Hero />
        <Agency />
        <PackageHero />
        <Creative />
        <HowWeWork />
        <Capabilities />
        <Education />
        <Help />
        <Entertainment />
        <Signup />
        <Contact />
        </>}/><Route path="/ebooki/:bookId" element={<EbookRequest/>}/><Route path="/polityka-prywatnosci" element={<Privacy/>}/><Route path="*" element={<section className="container-x pb-24 pt-36"><h1 className="section-title">404</h1><p className="mt-6 text-mist">{tr('Nie znaleziono strony.', 'Pagina niet gevonden.')}</p><Link to="/" className="btn-primary mt-8">{tr('Wróć na stronę', 'Terug naar de website')}</Link></section>}/></Routes>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
