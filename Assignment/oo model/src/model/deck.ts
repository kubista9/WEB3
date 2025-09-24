import { CardTypes, UnoDeck, colors } from "./requirements"
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
                    { type: "DRAW_CARD", color: color },
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
}