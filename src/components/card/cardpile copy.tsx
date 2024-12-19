import React, { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { Flip } from "gsap/Flip"
import { Draggable } from "gsap/Draggable"
import styles from "./style.module.css"
import data from "@/content/data.json"
import type { MapPoint } from "@/types"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(Draggable, Flip)

export default function CardPile() {
  const MapPoints = data as unknown as MapPoint[]

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [cards, setCards] = useState(MapPoints)
  const [activeCard, setActiveCard] = useState(0)

  useGSAP(
    () => {
      if (!containerRef.current) return
      let flipEntranceState = Flip.getState(cardRefs.current)
      //
      const topCard = cardRefs.current[0]
      if (!topCard) return

      let flipDragState: Flip.FlipState

      // entrance animation
      gsap.set(cardRefs.current, {
        // y: (index) => cardRefs.current.length - index * -20,
        // scale: (index) => 1 - index * 0.05,
        zIndex: (index) => cards.length - index,
        rotation: 0,
        x: 0,
      })

      Flip.from(flipEntranceState, {
        targets: cardRefs.current,
        position: "absolute",
        duration: 2,
      })

      Draggable.create(topCard, {
        bounds: containerRef.current,
        type: "x,y",
        edgeResistance: 0,
        inertia: false,
        onDrag: function () {
          gsap.to(topCard, {
            rotation: this.x / 10,
            duration: 0.1,
          })
          flipDragState = Flip.getState(topCard)
        },
        onDragEnd: function () {
          const x = flipDragState.elementStates[0].x

          if (Math.abs(x) > 10) {
            gsap.set(topCard, {
              x: x < 0 ? -500 : 500,
              rotationZ: x < 0 ? -30 : 30,
            })
          }
          Flip.from(flipDragState, {
            targets: topCard,
            absolute: true,
            duration: 0.5,
            onComplete: () => {
              // gsap.set(topCard, {
              //   y: 0,
              //   x: 0,
              //   scale: 1,
              //   zIndex: 0,
              //   rotation: 0,
              // })
              const newCards = [...cards]
              const [removed] = newCards.splice(0, 1)
              newCards.push(removed)
              setCards(newCards)
            },
          })
        },
      })
    },
    { dependencies: [cards] }
  )

  useEffect(() => {
    const newCards = [...cards]
    const index = newCards.findIndex((card) => card.id === activeCard)
    if (index === -1) return
    const [removed] = newCards.splice(index, 1)
    newCards.unshift(removed)
    setCards(newCards)
  }, [activeCard])

  return (
    <div className={styles.container}>
      <nav>
        <button onClick={() => setActiveCard(1)}>Bera 1</button>
        <button onClick={() => setActiveCard(2)}>Noware 2</button>
        <button onClick={() => setActiveCard(3)}>Caseros 3</button>
      </nav>
      <div className={styles.cardContainer} ref={containerRef}>
        {MapPoints.map((card, index) => (
          <div
            key={card.id}
            ref={(el) => (cardRefs.current[index] = el)}
            className={styles.card}
            style={{
              background: card.color,
            }}
          >
            <h1>{card.id}</h1>
            <p>{card.title}</p>
            <small>{card.description}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
