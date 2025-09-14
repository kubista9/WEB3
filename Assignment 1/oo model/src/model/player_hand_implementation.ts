import { CardTypes, PlayerHand } from "./requirements.js";

export class Hand implements PlayerHand {
    PlayerName: string
    PlayerCards: CardTypes[]


    constructor(playerName: string) {
        this.PlayerName = playerName
        this.PlayerCards = []
    }

    playCard(card: CardTypes): void {
        
    }

    takeCard(card: CardTypes): void {
        this.PlayerCards.push(card)
    }

    showHand(): CardTypes[] {
        console.log(this.PlayerCards)
        return [...this.PlayerCards]
    }

    getHandSize(): number {
        return this.PlayerCards.length
    }
    yellUno(): void {
        if (this.getHandSize() == 1) console.log("Uno")
    }
} 