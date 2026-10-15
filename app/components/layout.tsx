import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { site } from '../lib/catalog';
import { Arrow, Spark } from './icons';

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  return <header className={`header ${open ? 'menu-open' : ''}`}>
    <Link to="/" className="brand" aria-label="Luzzinterest, início"><img src="/brand/symbol.jpg" width="40" height="40" alt="" /><span>luzzinterest<span className="brand-cross">♱</span></span></Link>
    <nav className="nav-desktop" aria-label="Navegação principal">
      <NavLink to="/acervo/">Acervo</NavLink><Link to="/#manifesto">Manifesto</Link><Link to="/#contato">Contato <Arrow diagonal /></Link>
    </nav>
    <span className="header-note">FEITO PARA SENTIR.<br />{site.location.toUpperCase()}</span>
    <button className="menu-toggle" type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}><span /><span /></button>
    <nav id="mobile-menu" className="nav-mobile" aria-label="Navegação no celular" hidden={!open}><NavLink to="/acervo/">Acervo <Arrow diagonal /></NavLink><Link to="/#manifesto" onClick={() => setOpen(false)}>Manifesto <Arrow diagonal /></Link><Link to="/#contato" onClick={() => setOpen(false)}>Contato <Arrow diagonal /></Link></nav>
  </header>;
}

export function Contact({ compact = false }: { compact?: boolean }) {
  return <section id="contato" className={`contact-section ${compact ? 'contact-compact' : ''}`}>
    <div className="contact-kicker"><span className="eyebrow">FAÇA PARTE DA NOSSA SEITA.</span><Spark /></div>
    <div className="contact-main"><h2>O próximo<br /><span>traço é seu.</span></h2><div className="contact-copy"><p>Tem uma ideia que não sai da cabeça?</p><p>Entre no nosso grupo para conversar sobre encomendas, valores e possibilidades de criação.</p><a className="button button-red" href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">Conversar sobre encomenda no grupo <Arrow diagonal /></a><a className="text-link" href={site.instagramUrl} target="_blank" rel="noopener noreferrer">Acompanhe no Instagram <Arrow diagonal /></a></div></div>
  </section>;
}

export function Footer() {
  return <footer className="footer"><div className="footer-wordmark" aria-hidden="true">luzzinterest<span>♱</span></div><div className="footer-bottom"><span>{site.tagline}</span><span>{site.location} · ARTE AUTORAL</span><a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">@luzzinterest <Arrow diagonal /></a><span>© {new Date().getFullYear()} Luzzinterest</span></div></footer>;
}

export function MotionController() {
  const { pathname } = useLocation();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cleanup = () => {};
    function setup() {
      cleanup();
      const elements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
      if (preference.matches) { elements.forEach(el => el.classList.remove('will-reveal')); return; }
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }), { threshold: 0.06 });
      elements.forEach(el => { if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('will-reveal'); observer.observe(el); } });
      const hero = document.querySelector<HTMLElement>('.hero');
      let frame = 0;
      const update = () => { if (!frame) frame = requestAnimationFrame(() => { hero?.style.setProperty('--scroll', `${Math.min(window.scrollY, 1000)}`); frame = 0; }); };
      window.addEventListener('scroll', update, { passive: true });
      cleanup = () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', update); elements.forEach(el => el.classList.remove('will-reveal')); hero?.style.removeProperty('--scroll'); };
    }
    setup();
    preference.addEventListener('change', setup);
    return () => { cleanup(); preference.removeEventListener('change', setup); };
  }, [pathname]);
  return null;
}
