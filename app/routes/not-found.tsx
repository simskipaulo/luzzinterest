import { Link } from 'react-router';
import { pageMeta } from '../lib/catalog';
import { Arrow } from '../components/icons';
export const meta = () => [...pageMeta('Página não encontrada','Este caminho não faz parte do acervo. Explore as peças da Luzzinterest.','/404'),{name:'robots',content:'noindex'}];
export function NotFound() {
  return <main id="conteudo" className="error-page"><span className="eyebrow">404 / FORA DO TRAÇO</span><h1>Esse caminho<br /><span>ainda não existe.</span></h1><p>Mas tem muita coisa pra sentir por aqui.</p><Link className="button button-red" to="/acervo/">Explorar o acervo <Arrow diagonal /></Link></main>;
}
export default NotFound;
