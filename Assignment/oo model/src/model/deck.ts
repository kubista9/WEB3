import { CardTypes, UnoDeck, ValidColors } from "./requirements"

// Requirement 5 2/2
export class Deck implements UnoDeck {
    drawPile: CardTypes[]
    discardPile: CardTypes[]

    constructor() {
        this.drawPile = []
        this.discardPile = []
    }

    startTheGame(): void {
        for (const color of ValidColors) {
            this.drawPile.push({ type: "NUMBERED", color: color, number: 0 })

            for (let v = 1; v <= 9; v++) {
                this.drawPile.push({ type: "NUMBERED", color: color, number: v as any })
                this.drawPile.push({ type: "NUMBERED", color: color, number: v as any })
            }

            this.drawPile.push(
                { type: "SKIP", color: color },
                { type: "SKIP", color: color })
            this.drawPile.push(
                { type: "REVERSE", color: color },
                { type: "REVERSE", color: color }
            );
            this.drawPile.push(
                { type: "DRAW_TWO", color: color },
                { type: "DRAW_TWO", color: color }
            );
        }

        for (let i = 0; i < 4; i++) {
            this.drawPile.push({ type: "WILD" })
            this.drawPile.push({ type: "WILD_DRAW_FOUR" })
        }

        this.shuffleDeck()
    }

    shuffleDeck(): void {
        this.drawPile.sort(() => Math.random() - 0.5)
    }


    drawFromDeck(): CardTypes | undefined {
        return this.drawPile.pop()

    }
    getDeckSize(): number {
        return this.drawPile.length
    }

    drawCards(number: number): CardTypes[] {
        const cardsToTake: CardTypes[] = []
        for (let i = 0; i < number; i++) {
            const cardFromPile = this.drawFromDeck()
            if (cardFromPile) cardsToTake.push(cardFromPile)
        }
        return cardsToTake
    }

    discardCard(card: CardTypes): void {
        this.discardPile.push(card)
    }
}