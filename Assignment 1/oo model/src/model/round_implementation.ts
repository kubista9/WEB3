import { Deck } from "./deck_implementation";
import { Hand } from "./player_hand_implementation";
import { UnoRound, CardTypes } from "./requirements"

// Requirement 7
export class Round implements UnoRound {
    deck: Deck
    players: Hand[]
    currentPlayerIndex: number
    direction: 1 | -1
    activeColor: string | undefined

    constructor() {
        this.deck = new Deck()
        this.players = []
        this.currentPlayerIndex = 0
        this.direction = 1
        this.activeColor = undefined
    }

    startRound(playerNames: string[]): void {
        this.deck.startTheGame()
        this.players = playerNames.map(name => new Hand(name))
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
        while (first && (first.type === "Wild" || first.type === "Wild Draw Four")) {
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
        const top = this.getTopCard()

        switch (card.type) {
            case "Reverse":
                this.direction *= -1
                if (this.players.length === 2) this.advancePlayer()
                break

            case "Skip":
                this.advancePlayer()
                break

            case "Draw Two":
                this.advancePlayer()
                this.players[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                this.players[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                break

            case "Wild":
                if (!chosenColor) throw new Error("Must choose a color for Wild");
                this.activeColor = chosenColor
                break

            case "Wild Draw Four":
                if (!chosenColor) throw new Error("Must choose a color for Wild Draw Four")
                this.activeColor = chosenColor
                this.advancePlayer()
                for (let i = 0; i < 4; i++) {
                    this.players[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                }
                break

            case "Numbered":
                this.activeColor = card.color
                break
        }
    }
}