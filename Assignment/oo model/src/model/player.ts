import { CardTypes, UnoPlayer } from "./interfaces.js"

// Requirement 6 2/2
export class Player implements UnoPlayer {
    playerName: string
    playerCards: CardTypes[]


    constructor(playerName: string) {
        this.playerName = playerName
        this.playerCards = []
    }

    playCard(index: number): CardTypes | undefined {
        if (index < 0 || index >= this.playerCards.length) {
            return undefined
        }
        return this.playerCards.splice(index, 1)[0]
    }

    takeCard(card: CardTypes): void {
        this.playerCards.push(card)
    }

    showHand(): CardTypes[] {
        return [...this.playerCards]
    }

    getHandSize(): number {
        return this.playerCards.length
    }

    yellUno(): void {
        if (this.getHandSize() == 1) console.log("UNO!")
    }

} 