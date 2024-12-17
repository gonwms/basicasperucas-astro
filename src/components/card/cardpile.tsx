import React, { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import styles from "./style.module.css"
import data from "@/data.json"
import type { MapPoint } from "@/types"
gsap.registerPlugin(Draggable)

export default function CardPile() {
  //
  const MapPoints = data as unknown as MapPoint[]

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [cards, setCards] = useState(MapPoints)
  const [activeCard, setActiveCard] = useState(0)

  // useEffect(() => {
  //   cardRefs.current = cardRefs.current.slice(0, cards.length)
  // }, [cards])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const topCard = cardRefs.current[0]

    if (!topCard) return

    const [draggable] = Draggable.create(topCard, {
      type: "x,y",
      edgeResistance: 0.45,
      bounds: container,
      inertia: false,

      onDrag: function () {
        gsap.to(topCard, {
          rotation: this.x / 10,
          duration: 0.1,
        })
      },
      onDragEnd: function () {
        if (Math.abs(this.x) > 40) {
          gsap.to(topCard, {
            x: this.x < 0 ? "-50vw" : "50vw",
            // y: -100,
            rotationZ: this.x < 0 ? -30 : 30,
            scale: 0.8,
            duration: 0.2,

            onComplete: () => {
              //
              const newCards = [...cards] // clone cards
              const [removed] = newCards.splice(0, 1) // remove first
              newCards.push(removed) // put it the end
              setCards(newCards) // set cards

              gsap.set(topCard, {
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
                rotation: 0,
              })
            },
          })
        } else {
          gsap.to(topCard, {
            delay: 0.2,
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.2,
          })
        }
      },
    })

    return () => {
      draggable.kill()
    }
  }, [cards])

  useEffect(() => {
    const newCards = [...cards] // clone cards
    const index = newCards.findIndex((card) => card.id === activeCard)
    if (index === -1) return
    const [removed] = newCards.splice(index, 1) // remove first
    newCards.unshift(removed) // put it the end
    setCards(newCards) // set cards
  }, [activeCard])

  return (
    <div className={styles.container}>
      <nav>
        <button onClick={() => setActiveCard(1)}>Bera 1</button>
        <button onClick={() => setActiveCard(2)}>Noware 2</button>
        <button onClick={() => setActiveCard(3)}>Caseros 3</button>
      </nav>
      <div className={styles.cardContainer} ref={containerRef}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            ref={(el) => (cardRefs.current[index] = el)}
            className={styles.card}
            style={{
              background: card.color,
              zIndex: cards.length - index,
              transform: `translateY(${index * 10}px) scale(${
                1 - index * 0.05
              })`,
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
