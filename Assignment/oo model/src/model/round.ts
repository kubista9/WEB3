import { Deck } from "./deck"
import { UnoRound, CardTypes, UnoPlayer, RoundMemento } from "./requirements"
import { Player } from "./player"

// Requirement 7 2/2
export class Round implements UnoRound {
    players: string[]
    unoPlayers: Player[]
    dealer: any
    shuffler: any
    cardsPerPlayer: number
    currentPlayerIndex: number
    direction: 1 | -1
    activeColor: string | undefined
    deck: Deck
    ended: boolean = false
    winnerIndex: number | undefined
    endCallbacks: ((e: { winner: number }) => void)[] = []
    unoCalls: Set<number> = new Set()
    accusedAlready: Set<number> = new Set()
    lastAction: "play" | "draw" | undefined

    constructor(players: string[], dealer: any, shuffler: any, cardsPerPlayer: number) {
        this.players = players
        this.unoPlayers = players.map(name => new Player(name))
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
            for (const player of this.unoPlayers) {
                const card = this.deck.drawFromDeck()
                if (card) player.takeCard(card)
            }
        }
    }

    flipOneCard() {
        let first = this.deck.drawFromDeck()
        while (first && (first.type === "WILD CARD" || first.type === "WILD DRAW")) {
            this.deck.cards.unshift(first)
            first = this.deck.drawFromDeck()
        }
        if (first) this.deck.discardCard(first)

        console.log("Round started!")
        this.unoPlayers.forEach(hand =>
            console.log(`${hand.playerName} has ${hand.getHandSize()} cards`)
        );
        console.log("First card on table:", this.deck.discardPile.at(-1))
    }

    playerTurn(): string {
        return this.unoPlayers[this.currentPlayerIndex].playerName
    }

    nextPlayer(): void {
        this.currentPlayerIndex =
            (this.currentPlayerIndex + this.direction + this.unoPlayers.length) % this.unoPlayers.length
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
        const player = this.unoPlayers[this.currentPlayerIndex]
        const card = player.playCard(cardIndex)

        if (player.getHandSize() === 0 && !this.unoCalls.has(this.currentPlayerIndex)) {
            for (let i = 0; i < 4; i++) {
                const c = this.deck.drawFromDeck()
                if (c) player.takeCard(c)
            }
        }

        switch (card?.type) {
            case "REVERSE":
                this.direction *= -1
                if (this.players.length === 2) this.advancePlayer()
                break

            case "SKIP":
                this.advancePlayer()
                break

            case "DRAW CARD":
                this.advancePlayer()
                this.unoPlayers[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                this.unoPlayers[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                break

            case "WILD CARD":
                if (!chosenColor) throw new Error("Must choose a color for Wild")
                this.activeColor = chosenColor
                break

            case "WILD DRAW":
                if (!chosenColor) throw new Error("Must choose a color for Wild Draw Four")
                this.activeColor = chosenColor
                this.advancePlayer()
                for (let i = 0; i < 4; i++) {
                    this.unoPlayers[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                }
                break

            case "NUMBERED":
                this.activeColor = card.color
                break
        }
    }

    toMemento(): RoundMemento {
        return {
            players: this.players,
            hands: this.unoPlayers.map(p => p.showHand()),
            drawPile: [...this.deck.cards],
            discardPile: [...this.deck.discardPile],
            currentColor: this.activeColor ?? "",
            currentDirection: this.direction === 1 ? "clockwise" : "counterclockwise",
            dealer: this.dealer,
            playerInTurn: this.currentPlayerIndex
        }
    }

    static fromMemento(memento: RoundMemento, shuffler?: any): Round {
        const round = new Round(memento.players, memento.dealer, shuffler, memento.hands[0]?.length ?? 7)
        round.unoPlayers.forEach((player, i) => {
            for (const card of memento.hands[i]) {
                player.takeCard(card)
            }
        })

        round.deck.cards = [...memento.drawPile]
        round.deck.discardPile = [...memento.discardPile]
        round.activeColor = memento.currentColor
        round.direction = memento.currentDirection === "clockwise" ? 1 : -1
        round.currentPlayerIndex = memento.playerInTurn

        return round
    }

    draw(): void {
        if (this.ended) throw new Error("Round has ended")
        const card = this.deck.drawFromDeck()
        if (!card) throw new Error("No cards left to draw")
        this.unoPlayers[this.currentPlayerIndex].takeCard(card)
        this.lastAction = "draw"
        this.advancePlayer()
    }

    hasEnded(): boolean {
        return this.ended
    }

    winner(): number | undefined {
        return this.winnerIndex
    }

    score(): number | undefined {
        if (!this.ended || this.winnerIndex === undefined) return undefined
        let total = 0
        this.unoPlayers.forEach((p, i) => {
            if (i === this.winnerIndex) return
            for (const card of p.showHand()) {
                switch (card.type) {
                    case "NUMBERED": total += card.number; break
                    case "SKIP":
                    case "REVERSE":
                    case "DRAW CARD": total += 20; break
                    case "WILD CARD":
                    case "WILD DRAW": total += 50; break
                }
            }
        })
        return total
    }

    catchUnoFailure({ accuser, accused }: { accuser: number, accused: number }): boolean {
        if (accused < 0 || accused >= this.unoPlayers.length) throw new Error("Invalid accused index")
        if (this.ended) return false
        if (this.accusedAlready.has(accused)) return false

        const accusedPlayer = this.unoPlayers[accused]
        // must have exactly 1 card
        if (accusedPlayer.getHandSize() !== 1) return false
        // must have just played
        if (this.lastAction !== "play") return false
        // must not have called UNO
        if (this.unoCalls.has(accused)) return false

        // punish: draw 4 cards
        for (let i = 0; i < 4; i++) {
            if (this.deck.cards.length === 0) {
                // reshuffle from discard (leave top card)
                const top = this.deck.discardPile.pop()
                this.deck.shuffle(this.deck.discardPile)
                this.deck.cards = this.deck.discardPile
                this.deck.discardPile = top ? [top] : []
            }
            const card = this.deck.drawFromDeck()
            if (card) accusedPlayer.takeCard(card)
        }

        this.accusedAlready.add(accused)
        return true
    }

    playerHand(index: number): CardTypes[] {
        return this.unoPlayers[index].showHand()
    }

    drawPile() {
        return { size: this.deck.cards.length }
    }

    sayUno(index: number): void {
        if (index < 0 || index >= this.unoPlayers.length) throw new Error("Invalid player index")
        if (this.ended) throw new Error("Round has ended")
        this.unoCalls.add(index)
    }

    playerInTurn(): number | undefined {
        return this.ended ? undefined : this.currentPlayerIndex
    }

    canPlay(index: number): boolean {
        if (this.ended) return false
        return index >= 0 && index < this.unoPlayers[this.currentPlayerIndex].getHandSize()
    }

    canPlayAny(): boolean {
        if (this.ended) return false
        return this.unoPlayers[this.currentPlayerIndex].getHandSize() > 0
    }

    onEnd(callback: (e: { winner: number }) => void): void {
        this.endCallbacks.push(callback)
    }

    // update play() to handle ending the round
    play(index: number, chosenColor?: string): void {
        if (this.ended) throw new Error("Round has ended")
        this.checkPlayedCard(index, chosenColor)
        this.lastAction = "play"
        const player = this.unoPlayers[this.currentPlayerIndex]
        if (player.getHandSize() === 0) {
            this.ended = true
            this.winnerIndex = this.currentPlayerIndex
            this.endCallbacks.forEach(cb => cb({ winner: this.winnerIndex! }))
            return
        }
        this.advancePlayer()
    }

    discardPile() {

    }
}