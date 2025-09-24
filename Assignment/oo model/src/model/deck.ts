import { CardTypes, UnoDeck, colors, Color } from "./requirements"
import { standardShuffler } from "../utils/random_utils"

// Requirement 5 2/2
export class Deck implements UnoDeck {
    cards: CardTypes[]
    discardPile: CardTypes[]

    constructor() {
        this.cards = []
        this.discardPile = []
    }

    startTheGame(): void {
        for (const color of colors) {
            this.cards.push({ type: "NUMBERED", color: color, number: 0 })

            for (let v = 1; v <= 9; v++) {
                this.cards.push({ type: "NUMBERED", color: color, number: v as any })
                this.cards.push({ type: "NUMBERED", color: color, number: v as any })
            }

            for (let i = 0; i < 2; i++) {
                this.cards.push(
                    { type: "DRAW CARD", color: color },
                    { type: "REVERSE", color: color },
                    { type: "SKIP", color: color }
                )
            }
        }

        for (let i = 0; i < 4; i++) {
            this.cards.push({ type: "WILD CARD" })
            this.cards.push({ type: "WILD DRAW" })
        }


        this.shuffle(this.cards)
    }

    shuffle(cards: CardTypes[]): void {
        standardShuffler(cards)
    }


    drawFromDeck(): CardTypes | undefined {
        return this.cards.pop()

    }
    getDeckSize(): number {
        return this.cards.length
    }

    drawCards(number: number): CardTypes[] {
        const cardsToTake: CardTypes[] = []
        for (let i = 0; i <= number; i++) {
            const cardFromPile = this.drawFromDeck()
            if (cardFromPile) cardsToTake.push(cardFromPile)
        }
        return cardsToTake
    }

    discardCard(card: CardTypes): void {
        this.discardPile.push(card)
    }

    get size(): number {
        return this.cards.length
    }

    deal(): CardTypes | undefined {
        return this.cards.shift()
    }

    filter(predicate: (c: CardTypes) => boolean): Deck {
        const newDeck = new Deck();
        newDeck.cards = this.cards.filter(predicate);
        return newDeck;
    }

    toArray(): CardTypes[] {
        return [...this.cards]
    }

    toMemento(): Record<string, string | number>[] {
        return this.cards.map(card => {
            switch (card.type) {
                case "NUMBERED":
                    return { type: "NUMBERED", color: card.color, number: card.number }
                case "SKIP":
                case "REVERSE":
                case "DRAW CARD":
                    return { type: card.type, color: card.color }
                case "WILD CARD":
                case "WILD DRAW":
                    return { type: card.type }
                default:
                    throw new Error(`Unsupported card type in toMemento: ${card}`)
            }
        }) as Record<string, string | number>[]
    }

    static fromMemento(cards: Record<string, string | number>[]): Deck {
        const deck = new Deck()
        for (const card of cards) {
            switch (card.type) {
                case "NUMBERED":
                    if (typeof card.color !== "string" || typeof card.number !== "number") {
                        throw new Error("Invalid NUMBERED card in memento")
                    }
                    deck.cards.push({
                        type: "NUMBERED",
                        color: card.color,
                        number: card.number as any
                    })
                    break

                case "SKIP":
                case "REVERSE":
                case "DRAW_CARD":
                    if (typeof card.color !== "string") {
                        throw new Error(`Missing color on ${card.type}`)
                    }
                    deck.cards.push({
                        type: card.type,
                        color: card.color as Color
                    } as CardTypes)
                    break

                case "WILD CARD":
                    deck.cards.push({ type: "WILD CARD" })
                    break

                case "WILD DRAW":
                    deck.cards.push({ type: "WILD DRAW" })
                    break

                default:
                    throw new Error(`Invalid card type in memento: ${card.type}`)
            }
        }
        return deck
    }

}