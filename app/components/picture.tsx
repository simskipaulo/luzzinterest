import { media } from '../lib/catalog';

interface Props { source: string; alt: string; className?: string; eager?: boolean; sizes?: string; position?: string }
export function Picture({ source, alt, className = '', eager = false, sizes = '(max-width: 700px) 100vw, 50vw', position }: Props) {
  const image = media[source];
  if (!image) return null;
  return <img className={`piece-image ${className}`} src={image.src} srcSet={image.srcSet} sizes={sizes}
    width={image.width} height={image.height} alt={alt} loading={eager ? 'eager' : 'lazy'}
    fetchPriority={eager ? 'high' : 'auto'} decoding="async" style={position ? { objectPosition: position } : undefined} />;
}
