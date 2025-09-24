import { Deck } from "./deck"
import { UnoRound, CardTypes, UnoPlayer } from "./requirements"
import { Player } from "./player"

// Requirement 7 2/2
export class Round implements UnoRound {
    players: string[]
    dealer: any
    shuffler: any
    cardsPerPlayer: number
    currentPlayerIndex: number
    direction: 1 | -1
    activeColor: string | undefined
    deck: Deck

    constructor(players: string[], dealer: any, shuffler: any, cardsPerPlayer: number) {
        this.players = players
        this.dealer = dealer
        this.shuffler = shuffler
        this.cardsPerPlayer = cardsPerPlayer
        this.currentPlayerIndex = 0
        this.direction = 1
        this.activeColor = undefined
        this.deck = new Deck()
    }

    startRound(): void {
        this.deck.startTheGame()
        this.dealCards()
        this.flipOneCard()
    }

    dealCards() {
        for (let i = 0; i < 7; i++) {
            for (const player of this.players) {
                const card = this.deck.drawFromDeck()
                if (card) player.takeCard(card)
            }
        }
    }

    flipOneCard() {
        let first = this.deck.drawFromDeck()
        while (first && (first.type === "WILD" || first.type === "WILD_DRAW_FOUR")) {
            this.deck.drawPile.unshift(first)
            first = this.deck.drawFromDeck()
        }
        if (first) this.deck.discardCard(first)

        console.log("Round started!")
        this.players.forEach(hand =>
            console.log(`${hand.playerName} has ${hand.getHandSize()} cards`)
        );
        console.log("First card on table:", this.deck.discardPile.at(-1))
    }

    playerTurn(): string {
        return this.players[this.currentPlayerIndex].playerName
    }

    nextPlayer(): void {
        this.currentPlayerIndex =
            (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length
    }

    getTopCard(): CardTypes | undefined {
        return this.deck.discardPile.at(-1)
    }

    advancePlayer(): void {
        this.currentPlayerIndex =
            (this.currentPlayerIndex + this.direction + this.players.length) %
            this.players.length
    }

    checkPlayedCard(cardIndex: number, chosenColor?: string): void {
        const player = this.players[this.currentPlayerIndex]
        const card = player.playCard(cardIndex)

        if (player.getHandSize() === 0 && !player.yellUno) {
            for (let i = 0; i <= 4; i++) {
                this.players[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
            }
        }

        switch (card.type) {
            case "REVERSE":
                this.direction *= -1
                if (this.players.length === 2) this.advancePlayer()
                break

            case "SKIP":
                this.advancePlayer()
                break

            case "DRAW_TWO":
                this.advancePlayer()
                this.players[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                this.players[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                break

            case "WILD":
                if (!chosenColor) throw new Error("Must choose a color for Wild")
                this.activeColor = chosenColor
                break

            case "WILD_DRAW_FOUR":
                if (!chosenColor) throw new Error("Must choose a color for Wild Draw Four")
                this.activeColor = chosenColor
                this.advancePlayer()
                for (let i = 0; i < 4; i++) {
                    this.players[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                }
                break

            case "NUMBERED":
                this.activeColor = card.color
                break

        }
    }
}