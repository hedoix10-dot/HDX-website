import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import Lenis from 'lenis';
import App from './App';
import { LangProvider } from './lib/i18n';
import '@fontsource/unbounded/latin-700.css';
import '@fontsource/unbounded/latin-ext-700.css';
import '@fontsource/unbounded/latin-900.css';
import '@fontsource/unbounded/latin-ext-900.css';
import '@fontsource/sora/latin-400.css';
import '@fontsource/sora/latin-ext-400.css';
import '@fontsource/sora/latin-600.css';
import '@fontsource/sora/latin-ext-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-ext-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import '@fontsource/jetbrains-mono/latin-ext-700.css';
import './index.css';

function SmoothScroll() {
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute('href')?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        history.pushState(null, '', `#${id}`);
        lenis.scrollTo(el, { offset: -80 });
      }
    };
    document.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);
  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        <SmoothScroll />
        <App />
        <Toaster theme="dark" position="bottom-center" richColors />
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
