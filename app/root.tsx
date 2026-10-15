import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from 'react-router';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import './styles.css';
import { Header, Footer, MotionController } from './components/layout';
import { NotFound } from './routes/not-found';

export function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#080808" /><link rel="icon" href="/brand/symbol.jpg" type="image/jpeg" /><Meta /><Links /></head><body><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><Header /><noscript><style>{'.menu-toggle{display:none}'}</style><nav className="fallback-nav" aria-label="Navegação alternativa"><a href="/acervo/">Acervo</a><a href="/#manifesto">Manifesto</a><a href="/#contato">Contato</a></nav></noscript>{children}<Footer /><ScrollRestoration /><Scripts /></body></html>;
}
export default function App() { return <><Outlet /><MotionController /></>; }
export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return <main id="conteudo" className="error-page"><p className="eyebrow">ALGO SAIU DO TRAÇO</p><h1>Vamos tentar<br />de novo.</h1><p>Não foi possível abrir esta página agora.</p><a className="button" href="/">Voltar ao início</a></main>;
}
