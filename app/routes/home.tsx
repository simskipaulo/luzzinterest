import { Link } from 'react-router';
import { pieces, site, pieceUrl, pageMeta } from '../lib/catalog';
import { Picture } from '../components/picture';
import { PieceCard } from '../components/piece-card';
import { Arrow, Spark } from '../components/icons';
import { Contact } from '../components/layout';
import { CustomProcess } from '../components/custom-process';

export const meta = () => pageMeta('Arte que se veste', site.introduction, '/', site.heroImage);

export default function Home() {
  const selection = pieces.filter(piece => piece.featured).slice(0, 4);
  const spotlight = pieces.find(piece => piece.featured && piece.category === 'Regatas') ?? pieces.find(piece => piece.featured) ?? pieces[0];
  const heroPiece = pieces.find(piece => piece.images.some(image => image.src === site.heroImage));
  const heroAlt = heroPiece?.images.find(image => image.src === site.heroImage)?.alt ?? 'Peça autoral da Luzzinterest.';
  return <main id="conteudo">
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-topline"><span>ROUPAS, ARTE & ALGUM IRRACIONAL.</span><span>ACERVO AUTORAL / 26</span></div>
      <div className="hero-stage">
        <div className="hero-orbit" aria-hidden="true"><Spark /></div>
        <div className="hero-photo-frame"><Picture source={site.heroImage} alt={heroAlt} className="hero-photo" eager sizes="(max-width: 700px) 78vw, 45vw" /><span className="hero-photo-tag">{heroPiece?.name.toUpperCase() ?? 'ARTE QUE SE VESTE'}<br />UMA PEÇA, OUTRO UNIVERSO.</span></div>
        <h1 id="hero-title">Vista o<br /><span>irracional.</span></h1>
        <div className="hero-bottom-copy"><p>O que você sente<br />também pode ganhar forma.</p><Link to="/acervo/" className="button button-light">Explore o acervo <Arrow diagonal /></Link></div>
        <span className="hero-vertical" aria-hidden="true">NÃO CABE NO CONVENCIONAL.</span>
      </div>
      <div className="hero-bottomline"><span><span className="status-dot" /> CRIADO EM NATAL, RN</span><a href="#manifesto">DESÇA PARA SENTIR <span aria-hidden="true">↓</span></a><span>♱ LUZZINTEREST</span></div>
    </section>

    <div className="ribbon-viewport" aria-hidden="true"><div className="manifesto-ribbon"><div><span>MAIS QUE ARTE</span><Spark /><span>UM TRIBUTO AO IRRACIONAL</span><Spark /><span>MAIS QUE ARTE</span><Spark /><span>UM TRIBUTO AO IRRACIONAL</span><Spark /></div></div></div>

    <section id="manifesto" className="manifesto section-pad">
      <div className="section-top"><span className="eyebrow">01 / POR DENTRO</span><span className="eyebrow">A ROUPA É SÓ O COMEÇO.</span></div>
      <div className="manifesto-layout"><div className="manifesto-art" data-reveal><Picture source="espera-01.jpg" alt="Grafismo autoral em preto e branco da coleção Hipersensível, com um olho e linhas pontiagudas." sizes="(max-width: 700px) 70vw, 27vw" /><span className="image-note">SENTIR TAMBÉM É UM ATO DE CRIAÇÃO.</span></div><div className="manifesto-copy" data-reveal><h2>Não cabe no padrão.<br /><span>Ainda bem.</span></h2><p className="manifesto-lead">{site.introduction}</p>{site.manifesto.slice(0,2).map(paragraph => <p key={paragraph}>{paragraph}</p>)}<a className="text-link" href={site.instagramUrl} target="_blank" rel="noopener noreferrer">Conheça nosso universo <Arrow diagonal /></a></div></div>
      <div className="manifesto-footnote"><span>EXPRESSÃO ANTES DE QUALQUER RÓTULO.</span><span>♱</span><span>TRAÇO. CORPO. SENTIMENTO.</span></div>
    </section>

    <section className="selected-section section-pad" aria-labelledby="selected-title">
      <div className="section-top"><span className="eyebrow">02 / PEÇAS QUE FALAM</span><span className="eyebrow">SELEÇÃO DO ACERVO</span></div>
      <div className="section-title-row"><h2 id="selected-title">Vestígios<br /><span>do que sentimos.</span></h2><p>Peças que já ganharam vida.<br />Histórias que continuam no corpo.</p></div>
      <div className="selected-grid">{selection.map((piece, index) => <PieceCard key={piece.id} piece={piece} index={index} />)}</div>
      <div className="archive-invitation"><span>{String(pieces.length).padStart(2, '0')} PEÇAS. MUITAS FORMAS DE SENTIR.</span><Link to="/acervo/" className="button">Ver todo o acervo <Arrow diagonal /></Link></div>
    </section>

    {spotlight && <section className="feeling-section" aria-label={`Coleção ${spotlight.collection}`}><div className="feeling-image"><Picture source={spotlight.images[0].src} alt={spotlight.images[0].alt} sizes="(max-width: 700px) 100vw, 50vw" /></div><div className="feeling-copy"><span className="eyebrow">{spotlight.collection.toUpperCase()} / {spotlight.name.toUpperCase()}</span><Spark /><h2>Tem coisa<br />que só dá<br />pra <em>sentir.</em></h2><Link to={pieceUrl(spotlight)} className="text-link">Por dentro da peça <Arrow diagonal /></Link></div></section>}

    <section className="process-section section-pad" aria-labelledby="process-title">
      <div className="section-top"><span className="eyebrow">03 / FORA DO CABIDE</span><span className="eyebrow">PROCESSO & ENCONTROS</span></div>
      <div className="process-heading"><h2 id="process-title">Da ideia<br /><span>pra cena.</span></h2><p>A arte encontra o corpo, a rua e a música. Um pouco de onde essas peças já estiveram.</p></div>
      <div className="process-grid"><figure className="process-first" data-reveal><Picture source={site.processImages[0]} alt="Duas pessoas na primeira exposição da marca, com peças autorais ao fundo." sizes="(max-width: 700px) 100vw, 50vw" /><figcaption><span>01 / PRIMEIRA EXPOSIÇÃO</span><span>GLOBAL CLUB · FOTO @AUGUSTOLIRAOFC</span></figcaption></figure><figure className="process-second" data-reveal><Picture source={site.processImages[1]} alt="Peça com grafismos da Luzzinterest em uma apresentação musical do editorial de styling para Chediak." sizes="(max-width: 700px) 100vw, 45vw" /><figcaption><span>02 / STYLING PARA CHEDIAK</span><a href="https://www.instagram.com/luzzinterest/p/DeJ1IgTEfdx/" target="_blank" rel="noopener noreferrer">VER EDITORIAL <Arrow diagonal /></a></figcaption></figure></div>
      <p className="process-credits">Exposição: foto de <a href="https://www.instagram.com/augustoliraofc/" target="_blank" rel="noopener noreferrer">@augustoliraofc</a>. Editorial Chediak: fotografias de <a href="https://www.instagram.com/fabs_gmj/" target="_blank" rel="noopener noreferrer">@fabs_gmj</a> e <a href="https://www.instagram.com/joaotinos/" target="_blank" rel="noopener noreferrer">@joaotinos</a>; peça de tela por <a href="https://www.instagram.com/global.site/" target="_blank" rel="noopener noreferrer">@global.site</a>.</p>
    </section>
    <CustomProcess />
    <Contact />
  </main>;
}
