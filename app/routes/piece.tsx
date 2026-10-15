import { Link } from 'react-router';
import type { Route } from './+types/piece';
import { pieces, site, pieceUrl, pageMeta } from '../lib/catalog';
import { Gallery } from '../components/gallery';
import { PieceCard } from '../components/piece-card';
import { Arrow } from '../components/icons';

export function loader({ params }: Route.LoaderArgs) {
  const piece = pieces.find(p => p.slug === params.slug);
  if (!piece) throw new Response('Peça não encontrada', {status:404});
  return { piece };
}
export const meta: Route.MetaFunction = ({loaderData}) => loaderData ? pageMeta(loaderData.piece.name, loaderData.piece.description, pieceUrl(loaderData.piece), loaderData.piece.images[0].src) : [{title:'Peça não encontrada · Luzzinterest'}];

export default function PiecePage({ loaderData }: Route.ComponentProps) {
  const { piece } = loaderData;
  const related = pieces.filter(p => p.id !== piece.id).sort((a,b) => Number(b.collection === piece.collection) - Number(a.collection === piece.collection)).slice(0,2);
  return <main id="conteudo" className="piece-page"><div className="piece-breadcrumb"><Link to="/acervo/">← VOLTAR AO ACERVO</Link><span>{piece.collection.toUpperCase()} / {piece.category.toUpperCase()}</span></div><div className="piece-layout"><div><Gallery key={piece.id} piece={piece} /></div><div className="piece-information"><p className="eyebrow">ACERVO AUTORAL / {piece.collection}</p><h1>{piece.name}</h1><p className="piece-description">{piece.description}</p>{piece.details.length > 0 && <dl className="piece-details"><dt>POR DENTRO DA PEÇA</dt>{piece.details.map(d => <dd key={d}>{d}</dd>)}</dl>}<div className="piece-order"><span className="eyebrow">TEM UMA IDEIA PRA CHAMAR DE SUA?</span><p>Esta peça faz parte do nosso acervo. Para falar sobre uma encomenda, valores e possibilidades, entre no grupo.</p><a className="button button-red" href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">Conversar sobre encomenda no grupo <Arrow diagonal /></a></div><div className="piece-credits">{piece.credits.map(c => <a href={c.url} key={c.url} target="_blank" rel="noopener noreferrer">{c.name} <Arrow diagonal /></a>)}<a href={piece.sourceUrl} target="_blank" rel="noopener noreferrer">Ver publicação original <Arrow diagonal /></a></div></div></div><section className="related-section section-pad"><div className="section-title-row"><h2>Outras formas<br /><span>de sentir.</span></h2><Link className="text-link" to="/acervo/">Todo o acervo <Arrow diagonal /></Link></div><div className="related-grid">{related.map((p,i) => <PieceCard key={p.id} piece={p} index={i} />)}</div></section></main>;
}
