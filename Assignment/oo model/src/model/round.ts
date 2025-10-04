import { Deck } from "./deck"
import { UnoRound, CardTypes, RoundMemento } from "./interfaces"
import { Player } from "./player"

// Normalizer: make sure shorthand types in memento match internal naming
function normalizeCard(card: any): CardTypes {
    switch (card.type) {
        case "WILD CARD":
            return { type: "WILD CARD" }
        case "DRAW CARD":
            return { type: "DRAW CARD", color: card.color }
        default:
            return card as CardTypes
    }
}

export class Round implements UnoRound {
    players: string[]
    unoPlayers: Player[]
    dealer: number
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
    turnFrozen: boolean = false
    lastPlayedBy: number | null = null
    playerCount: number

    constructor(players: string[], dealer: number, shuffler: any, cardsPerPlayer: number) {
        this.players = players
        this.unoPlayers = players.map(name => new Player(name))
        this.dealer = dealer
        this.shuffler = shuffler
        this.cardsPerPlayer = cardsPerPlayer
        this.currentPlayerIndex = 0
        this.direction = 1
        this.activeColor = undefined
        this.deck = new Deck()
        this.playerCount = players.length
    }

    player(index: number): string {
        return this.players[index]
    }

    playerHand(index: number): CardTypes[] {
        return this.unoPlayers[index].showHand()
    }

    drawPile() {
        const self = this
        return {
            deal(): CardTypes | undefined {
                return self.deck.cards.shift()
            },
            get size() {
                return self.deck.cards.length
            },
            peek(): CardTypes[] {
                return self.deck.cards.slice(0, 3)
            }
        }
    }

    discardPile() {
        const self = this
        return {
            top(): CardTypes | undefined {
                return self.deck.discardPile[0]
            },
            get size() {
                return self.deck.discardPile.length
            }
        }
    }

    playerInTurn(): number | undefined {
        return this.ended ? undefined : this.currentPlayerIndex
    }

    getTopCard(): CardTypes | undefined {
        return this.deck.discardPile.at(-1)
    }

    advancePlayer(): void {
        this.currentPlayerIndex =
            (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length
        this.turnFrozen = false
    }

    play(index: number, chosenColor?: string): void {
        if (this.ended) throw new Error("Round has ended")
        const current = this.currentPlayerIndex
        this.checkPlayedCard(index, chosenColor)
        this.lastAction = "play"
        this.lastPlayedBy = current
        this.turnFrozen = true

        const player = this.unoPlayers[current]
        if (player.getHandSize() === 0) {
            this.ended = true
            this.winnerIndex = current
            this.endCallbacks.forEach(cb => cb({ winner: this.winnerIndex! }))
            return
        }
        this.advancePlayer()
    }

    checkPlayedCard(cardIndex: number, chosenColor?: string): void {
        const player = this.unoPlayers[this.currentPlayerIndex]
        const card = player.playCard(cardIndex)
        if (!card) return

        this.deck.discardPile.unshift(card)

        switch (card.type) {
            case "REVERSE":
                this.direction *= -1
                if (this.players.length === 2) this.advancePlayer()
                this.activeColor = card.color
                break
            case "SKIP":
                this.advancePlayer()
                this.activeColor = card.color
                break
            case "DRAW CARD":
                this.advancePlayer()
                this.unoPlayers[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                this.unoPlayers[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!)
                this.activeColor = card.color
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

    canPlay(index: number): boolean {
        if (this.ended) return false
        const hand = this.unoPlayers[this.currentPlayerIndex].showHand()
        if (index < 0 || index >= hand.length) return false
        const card = hand[index]
        const top = this.getTopCard()
        if (!top) return false

        if (card.type === "WILD CARD") return true
        if (card.type === "WILD DRAW") {
            if (this.activeColor) {
                const hasPlayableColor = hand.some(c => "color" in c && c.color === this.activeColor)
                return !hasPlayableColor
            }
            return true
        }

        const currentColor = this.activeColor || ("color" in top ? top.color : undefined)
        if ("color" in card && card.color === currentColor) return true
        if (card.type === "NUMBERED" && top.type === "NUMBERED" && card.number === top.number) return true
        if (card.type === top.type && card.type !== "NUMBERED") return true
        return false
    }

    sayUno(index: number): void {
        if (index < 0 || index >= this.unoPlayers.length) throw new Error("Invalid player index")
        if (this.ended) throw new Error("Round has ended")
        this.unoCalls.add(index)
    }

    catchUnoFailure({ accuser, accused }: { accuser: number; accused: number }): boolean {
        if (accused < 0 || accused >= this.unoPlayers.length) throw new Error("Invalid accused index")
        if (this.ended) return false
        if (this.accusedAlready.has(accused)) return false

        const accusedPlayer = this.unoPlayers[accused]
        if (accusedPlayer.getHandSize() !== 1) return false
        if (!this.turnFrozen) return false
        if (this.lastPlayedBy !== accused) return false
        if (this.unoCalls.has(accused)) return false

        for (let i = 0; i < 4; i++) {
            if (this.deck.cards.length === 0) {
                const top = this.deck.discardPile.shift()
                this.deck.cards = this.deck.discardPile
                this.deck.discardPile = top ? [top] : []
                this.deck.shuffle(this.shuffler)
            }
            const c = this.deck.drawFromDeck()
            if (c) accusedPlayer.takeCard(c)
        }

        this.accusedAlready.add(accused)
        return true
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
            playerInTurn: this.ended ? -1 : this.currentPlayerIndex
        }
    }

    static fromMemento(m: RoundMemento, shuffler?: any): Round {
        if (!m.players || m.players.length < 2) throw new Error("Invalid memento: less than 2 players")
        if (m.hands.length !== m.players.length) throw new Error("Invalid memento: hands length mismatch")
        if (m.discardPile.length === 0) throw new Error("Invalid memento: empty discard pile")

        const emptyHands = m.hands.map(h => h.length === 0)
        const emptyCount = emptyHands.filter(Boolean).length
        if (emptyCount > 1) throw new Error("Invalid memento: multiple winners")
        const isFinished = emptyCount === 1

        if (m.dealer < 0 || m.dealer >= m.players.length) throw new Error("Invalid memento: invalid dealer index")

        if (!isFinished) {
            if (m.playerInTurn === undefined) throw new Error("Invalid memento: missing playerInTurn")
            if (m.playerInTurn < 0 || m.playerInTurn >= m.players.length)
                throw new Error("Invalid memento: invalid playerInTurn index")
        }

        const COLORS = new Set(["RED", "GREEN", "BLUE", "YELLOW"])
        if (!COLORS.has(m.currentColor)) throw new Error("Invalid memento: invalid currentColor")

        const topOfDiscard = m.discardPile[0]
        if ("color" in topOfDiscard && topOfDiscard.color && topOfDiscard.color !== m.currentColor) {
            throw new Error("Invalid memento: inconsistent currentColor with discard pile")
        }

        const round = new Round(m.players, m.dealer, shuffler, m.hands[0]?.length ?? 7)

        round.unoPlayers.forEach((p, i) => {
            for (const c of m.hands[i]) p.takeCard(normalizeCard(c))
        })

        round.deck.cards = m.drawPile.map(normalizeCard)
        round.deck.discardPile = m.discardPile.map(normalizeCard)
        round.direction = m.currentDirection === "clockwise" ? 1 : -1
        round.activeColor = m.currentColor

        if (isFinished) {
            round.ended = true
            round.winnerIndex = emptyHands.findIndex(Boolean)
            round.currentPlayerIndex = -1 as unknown as number
        } else {
            round.currentPlayerIndex = m.playerInTurn!
        }

        return round
    }

    hasEnded(): boolean {
        return this.ended
    }

    winner(): number | undefined {
        return this.winnerIndex
    }

    draw(): void {
        if (this.ended) throw new Error("Round has ended")
        const card = this.deck.drawFromDeck()
        if (!card) throw new Error("No cards left to draw")
        this.unoPlayers[this.currentPlayerIndex].takeCard(card)
        this.lastAction = "draw"
        this.advancePlayer()
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

    canPlayAny(): boolean {
        if (this.ended) return false
        return this.unoPlayers[this.currentPlayerIndex].getHandSize() > 0
    }

    onEnd(callback: (e: { winner: number }) => void): void {
        this.endCallbacks.push(callback)
    }

}
