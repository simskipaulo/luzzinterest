import { Link } from 'react-router';
import { type Piece, pieceUrl } from '../lib/catalog';
import { Picture } from './picture';
import { Arrow } from './icons';

export function PieceCard({ piece, index = 0 }: { piece: Piece; index?: number }) {
  return <article className="piece-card" data-reveal>
    <Link className="piece-card-link" to={pieceUrl(piece)} aria-label={piece.name}>
      <div className="piece-card-photo">
        <Picture source={piece.images[0].src} alt={piece.images[0].alt} position={piece.images[0].position} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 40vw" />
        {piece.images[1] && <Picture className="piece-card-alternate" source={piece.images[1].src} alt="" sizes="(max-width: 600px) 100vw, 40vw" />}
        <span className="photo-number">{String(index + 1).padStart(2, '0')} / ACERVO</span>
        <span className="photo-visit"><Arrow diagonal /></span>
      </div>
      <div className="piece-card-caption"><div><span className="eyebrow">{piece.collection} / {piece.category}</span><h3>{piece.name}</h3></div><Arrow diagonal /></div>
    </Link>
  </article>;
}
