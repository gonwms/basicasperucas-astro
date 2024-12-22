import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import Draggable from 'gsap/Draggable';
import styles from './style.module.css';
import data from '@/data/data.json';
import type { MapPoint } from '@/types';
import { useGSAP } from '@gsap/react';
import useUrlParameters from '@/utils/useUrlParameters';

gsap.registerPlugin(Draggable, Flip);
const MAX_CARDS_TO_SHOW = 3;

export default function CardStack() {
  const mapPoints = data as unknown as MapPoint[];

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cards, setCards] = useState(mapPoints);
  const [visible, setVisible] = useState(false);
  const firstOpen = useRef(true);
  let FlipDragState: Flip.FlipState;

  const { search, searchParams } = useUrlParameters();

  // ENTRANCE AND UPDATE ANIMATION
  useGSAP(
    () => {
      if (cardsRefs.current === null) return;
      // FIRST OPENED ANIMATION
      if (firstOpen.current && visible) {
        gsap
          .timeline({
            defaults: { duration: 0.5 }
          })
          .fromTo(
            cardsRefs.current,
            { y: 400, scale: 0.5, rotation: (index) => index + 1 * 30, visibility: 'hidden' },
            {
              y: (index) => index * 15,
              scale: (index) => 1 - index * 0.05,
              rotation: 0,
              visibility: 'visible',
              stagger: {
                each: 0.1,
                from: 'end'
              }
            }
          );

        firstOpen.current = false;
        // NO FIRST OPENED ANIMATION
      } else {
        // cardsRefs.current.forEach((card, index) => {
        gsap.timeline().fromTo(
          cardsRefs.current,
          { y: (index) => (index + 1) * 15, scale: (index) => 1 - (index + 1) * 0.05, x: 0 },
          {
            y: (index) => index * 15,
            scale: (index) => 1 - index * 0.05,
            rotation: 0,
            x: 0,
            stagger: 0.1
          }
        );
        // });
      }
    },
    { dependencies: [cards] }
  );

  // DRAG ANIMATION
  useGSAP(
    () => {
      if (!containerRef.current || !cardsRefs.current) return;
      const topCard = cardsRefs.current[0];
      //
      // DRAG
      Draggable.create(topCard, {
        bounds: containerRef.current,
        type: 'x,y',
        edgeResistance: 0,
        inertia: false,
        // ON DRAG
        onDrag: function () {
          gsap.to(topCard, {
            rotation: this.x / 30,
            duration: 0.1
          });
          FlipDragState = Flip.getState(topCard);
        },
        // ON DRAG END
        onDragEnd: function () {
          const x = FlipDragState.elementStates[0].x;

          if (Math.abs(x) > 50) {
            gsap.set(topCard, { x: x < 0 ? -500 : 500, rotationZ: x < 0 ? -10 : 10 });
            Flip.from(FlipDragState, {
              targets: topCard,
              absolute: true,
              duration: 0.2,
              onComplete: () => {
                const newCards = [...cards];
                newCards.push(newCards.shift()!); // el primero pasa el final.
                setCards(newCards);
                //
                const url = new URL(window.location.href);
                url.searchParams.set('basica', newCards[0].id.toString()); // Add or update the search parameter
                window.history.pushState({}, '', url); // Update the URL without reloading
              }
            });
          } else {
            gsap.set(topCard, { x: 0, rotationZ: 0, y: 0 });
            Flip.from(FlipDragState, { targets: topCard, absolute: true, duration: 0.2 });
          }
        }
      });
    },
    { dependencies: [cards] }
  );

  // LISTEN SEARCHPARAMS CHANGES
  useEffect(() => {
    // UPDATE VISIBILITY
    searchParams?.get('basica') ? setVisible(true) : setVisible(false);
    // UPDATE TITLE
    const title = searchParams?.get('basica')
      ? `${searchParams?.get('basica')} | Basicas Perucas`
      : 'Basicas Perucas';
    document.title = title;

    // UPDATE CARDS ORDER
    const newCards = [...cards];
    // buscar el index de card.id en el array
    const index = newCards.findIndex((card) => {
      return card.id.toString() === searchParams?.get('basica');
    });
    if (index === -1) return;
    //
    const [selected] = newCards.splice(index, 1); // quitar el elegido del array
    newCards.splice(0, 0, selected); // agregarlo al principio
    //
    setCards(newCards);
  }, [search]);

  // HANDLE EVENTS
  function handleClick(id: number) {
    if (!searchParams) return;
    const url = new URL(window.location.href);
    url.searchParams.set('basica', id.toString()); // Add or update the search parameter
    window.history.pushState({}, '', url); // Update the URL without reloading
  }

  function handleClose(event: React.MouseEvent | React.TouchEvent) {
    event.stopPropagation(); // Stop event propagation
    firstOpen.current = true;

    // close animation
    gsap.to(cardsRefs.current, {
      y: 500,
      rotation: 20,
      stagger: 0.1,
      ease: 'power3.in',
      onComplete: () => {
        const url = new URL(window.location.href);
        url.searchParams.delete('basica'); // Remove the search parameter
        window.history.pushState({}, '', url); // Update the URL without reloading
      }
    });
  }

  // RENDER
  return (
    <>
      {/* <nav>
        <button onClick={() => handleClick(1)}>Bera 1</button>
        <button onClick={() => handleClick(2)}>Noware 2</button>
        <button onClick={() => handleClick(3)}>Caseros 3</button>
        <button onClick={() => handleClick(4)}>44</button>
        <button onClick={() => handleClick(5)}>55</button>
        <button onClick={() => handleClick(6)}>66</button>
      </nav> */}
      {visible && (
        <div className={styles.container}>
          <div className={styles.cardContainer} ref={containerRef}>
            {cards.map(
              (card, index) =>
                index < MAX_CARDS_TO_SHOW && (
                  <div
                    key={card.id}
                    ref={(el) => (cardsRefs.current[index] = el)}
                    className={styles.card + ' ' + card.title}
                    style={{
                      background: card.color,
                      zIndex: cards.length - index
                    }}
                  >
                    <button onClick={handleClose} onTouchEnd={handleClose}>
                      CERRAR
                    </button>
                    <h2>{card.id}</h2>
                    <p>{card.title}</p>
                    <small>{card.description}</small>
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </>
  );
}
