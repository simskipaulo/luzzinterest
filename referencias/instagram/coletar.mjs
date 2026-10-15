// Coleta somente páginas e imagens públicas; não utiliza login ou endpoints privados.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(root, '../..');
const media = path.join(workspace, 'content/media');
await mkdir(media, { recursive: true });
const sources = [
  ['chediak', 'https://www.instagram.com/luzzinterest/p/DeJ1IgTEfdx/'],
  ['ramemes', 'https://www.instagram.com/luzzinterest/p/DZ8VSaFkWbK/'],
  ['midazs', 'https://www.instagram.com/luzzinterest/p/DdFnEaIEeTi/'],
  ['drop', 'https://www.instagram.com/luzzinterest/p/Dbo0z_VESs3/'],
  ['barcellos', 'https://www.instagram.com/luzzinterest/p/DbgadwZkfmD/'],
  ['exposicao', 'https://www.instagram.com/luzi.eug/p/DZas_aGlT01/'],
  ['hipersensivel', 'https://www.instagram.com/luzzinterest/p/DZn-9JPkQCe/'],
  ['frisson', 'https://www.instagram.com/luzzinterest/reel/DZkh-NGxGxZ/'],
  ['espera', 'https://www.instagram.com/luzzinterest/p/DZYHh28j9fa/'],
  ['manifesto', 'https://www.instagram.com/luzzinterest/p/DZYSM_8D9Eu/'],
  ['escorpiao', 'https://www.instagram.com/luzzinterest/p/DZYf5rND_nj/'],
];
function decode(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x([a-f0-9]+);/gi, (_, n) => String.fromCodePoint(parseInt(n,16))).replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}
const summary = [];
for (const [slug, url] of sources) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const meta = {};
    for (const tag of html.matchAll(/<meta\s[^>]*>/gi)) {
      const attributes = Object.fromEntries([...tag[0].matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], decode(m[2])]));
      if ((attributes.property || attributes.name) && attributes.content) meta[attributes.property || attributes.name] = attributes.content;
    }
    const code = new URL(url).pathname.split('/').filter(Boolean).at(-1);
    const embedUrl = `https://www.instagram.com/p/${code}/embed/`;
    const embed = await (await fetch(embedUrl, { signal: AbortSignal.timeout(30000) })).text();
    const contextMatch = embed.match(/"contextJSON":("(?:\\.|[^"\\])*")/);
    const context = contextMatch ? JSON.parse(JSON.parse(contextMatch[1])) : null;
    const post = context?.gql_data?.shortcode_media;
    const children = post?.edge_sidecar_to_children?.edges?.map(({node}) => node) || (post ? [post] : []);
    const photoSources = context?.context?.copyright_blocked ? [] : children.filter(item => item.display_url).map(item => ({ url: item.display_url, dimensions: item.dimensions, videoPoster: Boolean(item.is_video) }));
    if (!photoSources.length && meta['og:image'] && !context?.context?.copyright_blocked) photoSources.push({url:meta['og:image'],videoPoster:false});
    const source = { url, embedUrl, title: meta['og:title'], description: meta['og:description'] || meta.description, caption: post?.edge_media_to_caption?.edges?.[0]?.node?.text, media: [], collectedAt: new Date().toISOString(), access: 'public', note: 'Conteúdo público da incorporação oficial. Os destaques exigem login e não foram extraídos.' };
    for (const [index, photo] of photoSources.entries()) {
      const filename = `${slug}-${String(index+1).padStart(2,'0')}.jpg`;
      const image = await fetch(photo.url, { signal: AbortSignal.timeout(30000) });
      if (!image.ok || !image.headers.get('content-type')?.startsWith('image/')) throw new Error('Imagem pública indisponível');
      await writeFile(path.join(media, filename), Buffer.from(await image.arrayBuffer()));
      source.media.push({filename,...photo});
    }
    await writeFile(path.join(root, 'feed', `${slug}.json`), JSON.stringify(source, null, 2) + '\n');
    summary.push({ slug, photos: source.media.length });
  } catch (error) { summary.push({ slug, error: error.message }); }
}
console.log(JSON.stringify(summary, null, 2));
