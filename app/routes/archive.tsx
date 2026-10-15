import { useMemo, useState } from 'react';
import { pieces, pageMeta } from '../lib/catalog';
import { PieceCard } from '../components/piece-card';
import { Contact } from '../components/layout';
import { Spark } from '../components/icons';

export const meta = () => pageMeta('Acervo', 'Explore peças da coleção Hipersensível e customizações autorais da Luzzinterest.', '/acervo/', 'hipersensivel-01.jpg');

export default function Archive() {
  const [collection, setCollection] = useState('');
  const [category, setCategory] = useState('');
  const collections = [...new Set(pieces.map(p => p.collection))];
  const categories = [...new Set(pieces.map(p => p.category))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
  const filtered = useMemo(() => pieces.filter(p => (!collection || p.collection === collection) && (!category || p.category === category)), [collection, category]);
  return <main id="conteudo"><section className="archive-page section-pad"><div className="section-top"><span className="eyebrow">O ACERVO / LUZZINTEREST</span><span className="eyebrow">ARTE QUE JÁ GANHOU CORPO.</span></div><div className="archive-heading"><h1>O que já<br /><span>ganhou forma.</span></h1><div><Spark /><p>Um registro de peças, customizações e outras maneiras de vestir o que se sente.</p></div></div><div className="archive-filters"><div className="filter-fields">{collections.length > 1 && <label>Coleção<select value={collection} onChange={e => setCollection(e.target.value)}><option value="">Todas</option>{collections.map(c => <option key={c}>{c}</option>)}</select></label>}{categories.length > 1 && <label>Tipo de peça<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todos</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>}</div><span className="filter-count" role="status" aria-live="polite">{String(filtered.length).padStart(2, '0')} {filtered.length === 1 ? 'PEÇA' : 'PEÇAS'}</span></div><noscript><p className="noscript-note">Todas as peças estão disponíveis abaixo. Os filtros ficam disponíveis com JavaScript ativado.</p></noscript><div className="archive-grid">{filtered.map((piece,index) => <PieceCard key={piece.id} piece={piece} index={index} />)}</div>{filtered.length === 0 && <div className="empty-state"><h2>Nenhuma peça por aqui.</h2><p>Tente outra combinação de coleção e tipo.</p><button className="button" onClick={() => {setCollection('');setCategory('');}}>Limpar filtros</button></div>}<p className="archive-note">Este é um acervo de trabalhos produzidos. Para conversar sobre uma nova criação, encontre a gente no grupo.</p></section><Contact compact /></main>;
}
