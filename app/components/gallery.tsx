import { useEffect, useRef, useState } from 'react';
import type { Piece } from '../lib/catalog';
import { Picture } from './picture';

export function Gallery({ piece }: { piece: Piece }) {
  const [selected, setSelected] = useState(0);
  const [opened, setOpened] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  function close() { dialog.current?.close(); }
  function show(index: number, button: HTMLButtonElement) { setSelected(index); trigger.current = button; setOpened(true); dialog.current?.showModal(); }
  function move(direction: number) { setSelected(current => (current + direction + piece.images.length) % piece.images.length); }
  useEffect(() => {
    if (!opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [opened]);
  return <>
    <div className="piece-gallery">{piece.images.map((image,index) => <button type="button" className={`gallery-photo ${index === 0 ? 'gallery-photo-main' : ''}`} key={image.src} aria-label={`Ampliar foto ${index+1} de ${piece.name}`} onClick={e => show(index,e.currentTarget)}><Picture source={image.src} alt={image.alt} position={image.position} eager={index === 0} sizes={index === 0 ? '(max-width: 800px) 100vw, 60vw' : '(max-width: 800px) 50vw, 30vw'} /><span className="gallery-photo-badge" aria-hidden="true">{String(index+1).padStart(2,'0')} / AMPLIAR <span>↗</span></span></button>)}</div>
    <noscript><p>As fotografias completas estão apresentadas acima. A ampliação interativa fica disponível com JavaScript ativado.</p></noscript>
    <dialog ref={dialog} className="lightbox" aria-label={`Galeria de ${piece.name}`} onClose={() => {setOpened(false);trigger.current?.focus();}} onClick={e => {if(e.target === e.currentTarget)close();}} onKeyDown={e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
      if (e.key === 'Tab') {
        const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
        const first = buttons[0], last = buttons.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }}>
      {opened && <div className="lightbox-inner"><div className="lightbox-top"><span>{piece.name} / {String(selected+1).padStart(2,'0')} DE {String(piece.images.length).padStart(2,'0')}</span><button type="button" aria-label="Fechar galeria" className="lightbox-close" onClick={close} autoFocus>FECHAR <span aria-hidden="true">×</span></button></div><div className="lightbox-image"><Picture source={piece.images[selected].src} alt={piece.images[selected].alt} sizes="100vw" eager /></div><div className="lightbox-bottom"><p>{piece.images[selected].alt}</p>{piece.images.length > 1 && <div className="lightbox-controls"><button type="button" aria-label="Foto anterior" onClick={() => move(-1)}>←</button><button type="button" aria-label="Próxima foto" onClick={() => move(1)}>→</button></div>}</div></div>}
    </dialog>
  </>;
}
