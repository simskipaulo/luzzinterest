import rawCatalog from '../../.generated/catalog.json';
import rawMedia from '../../.generated/media.json';

export interface PieceImage { src: string; alt: string; position?: string }
export interface Piece {
  id: string; slug: string; name: string; description: string;
  collection: string; category: string; featured: boolean;
  images: PieceImage[]; credits: { name: string; url: string }[];
  details: string[]; sourceUrl: string;
}
export interface Site {
  name: string; tagline: string; introduction: string; manifesto: string[];
  location: string; instagramUrl: string; whatsappUrl: string;
  heroImage: string; processImages: string[]; publicUrl?: string;
  customProcess?: {
    eyebrow: string; title: string; introduction: string;
    steps: { title: string; text: string }[];
  };
}
export interface Media { src: string; srcSet: string; width: number; height: number }
export const { site, pieces } = rawCatalog as { site: Site; pieces: Piece[] };
export const media = rawMedia as Record<string, Media>;
export const pieceUrl = (piece: Piece) => `/pecas/${piece.slug}/`;

export function pageMeta(title: string, description: string, pathname: string, image?: string) {
  const resolvedImage = image ? media[image]?.src : undefined;
  const absolute = (value: string) => site.publicUrl ? new URL(value, site.publicUrl).href : value;
  return [
    { title: `${title} · ${site.name}` },
    { name: 'description', content: description },
    { property: 'og:title', content: `${title} · ${site.name}` },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'pt_BR' },
    { property: 'og:site_name', content: site.name },
    { name: 'twitter:card', content: 'summary_large_image' },
    ...(resolvedImage ? [{ property: 'og:image', content: absolute(resolvedImage) }] : []),
    ...(site.publicUrl ? [
      { property: 'og:url', content: absolute(pathname) },
      { tagName: 'link' as const, rel: 'canonical', href: absolute(pathname) },
    ] : []),
  ];
}
