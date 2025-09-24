import { CardTypes, UnoPlayer } from "./requirements.js"

// Requirement 6 2/2
export class Player implements UnoPlayer {
    playerName: string
    playerCards: CardTypes[]


    constructor(playerName: string) {
        this.playerName = playerName
        this.playerCards = []
    }

    playCard(index: number): CardTypes {
        if (index < 0 || index >= this.playerCards.length) {
            throw new Error("Invalid card index");
        }
        this.yellUno()
        return this.playerCards.splice(index, 1)[0]
    }

    takeCard(card: CardTypes): void {
        this.playerCards.push(card)
    }

    showHand(): CardTypes[] {
        console.log(this.playerCards)
        return [...this.playerCards]
    }

    getHandSize(): number {
        return this.playerCards.length
    }

    yellUno(): void {
        if (this.getHandSize() == 1) console.log("UNO!")
    }
} 