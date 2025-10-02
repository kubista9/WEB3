import { Deck } from "./deck"
import { UnoRound, CardTypes, RoundMemento } from "./interfaces"
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
    turnFrozen: boolean = false
    lastPlayedBy: number | null = null


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
        if (this.deck.discardPile.length === 0 && this.deck.cards.length > 0) {
            const first = this.deck.drawFromDeck();
            if (first) {
                this.deck.discardCard(first);
                this.activeColor = "color" in first ? first.color : undefined;
            }
        }
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
        this.currentPlayerIndex = (this.currentPlayerIndex + this.direction + this.players.length) % this.players.length
        this.turnFrozen = false
    }

    checkPlayedCard(cardIndex: number, chosenColor?: string): void {
        const player = this.unoPlayers[this.currentPlayerIndex];
        const card = player.playCard(cardIndex);

        if (!card) return;
        this.deck.discardCard(card);

        // Handle UNO penalty if they forgot to say it
        if (player.getHandSize() === 0 && !this.unoCalls.has(this.currentPlayerIndex)) {
            for (let i = 0; i < 4; i++) {
                const c = this.deck.drawFromDeck();
                if (c) player.takeCard(c);
            }
        }

        switch (card.type) {
            case "REVERSE":
                this.direction *= -1;
                if (this.players.length === 2) this.advancePlayer();
                this.activeColor = card.color;   // ✅ update active color
                break;

            case "SKIP":
                this.advancePlayer();
                this.activeColor = card.color;   // ✅ update active color
                break;

            case "DRAW CARD":
                this.advancePlayer();
                this.unoPlayers[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!);
                this.unoPlayers[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!);
                this.activeColor = card.color;   // ✅ update active color
                break;

            case "WILD CARD":
                if (!chosenColor) throw new Error("Must choose a color for Wild");
                this.activeColor = chosenColor;  // ✅ chosen color decides active color
                break;

            case "WILD DRAW":
                if (!chosenColor) throw new Error("Must choose a color for Wild Draw Four");
                this.activeColor = chosenColor;
                this.advancePlayer();
                for (let i = 0; i < 4; i++) {
                    this.unoPlayers[this.currentPlayerIndex].takeCard(this.deck.drawFromDeck()!);
                }
                break;

            case "NUMBERED":
                this.activeColor = card.color;   // ✅ update active color
                break;
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
        this.lastPlayedBy = this.currentPlayerIndex
        this.turnFrozen = false // accusation window closes
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
                    case "SKIP": total += 20; break
                    case "REVERSE": total += 20; break
                    case "DRAW CARD": total += 20; break
                    case "WILD CARD": total += 50; break
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

        // must be in the accusation window (after playing to 1 card, before next player acts)
        if (!this.turnFrozen) return false

        // the accused must be the one who just played
        if (this.lastPlayedBy !== accused) return false

        // fails if UNO was said by the accused player
        if (this.unoCalls.has(accused)) return false

        // draw 4 penalty
        for (let i = 0; i < 4; i++) {
            if (this.deck.cards.length === 0) {
                const top = this.deck.discardPile.pop()
                this.deck.cards = this.deck.discardPile
                this.deck.discardPile = top ? [top] : []
                this.deck.shuffle(this.shuffler)
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

    drawPile(): Deck {
        // Return a Deck object that wraps the actual draw pile
        const d = new Deck()
        d.cards = this.deck.cards
        return d
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
        if (this.ended) return false;

        const hand = this.unoPlayers[this.currentPlayerIndex].showHand();
        if (index < 0 || index >= hand.length) return false;

        const card = hand[index];
        const top = this.getTopCard();
        if (!top) return false;

        // --- Wild card ---
        if (card.type === "WILD CARD") return true;

        // --- Wild Draw Four ---
        if (card.type === "WILD DRAW") {
            // Must not have any other playable card of the active color
            if (this.activeColor) {
                const hasPlayableColor = hand.some(c =>
                    "color" in c && c.color === this.activeColor
                );
                return !hasPlayableColor;
            }
            // if no activeColor set, always legal
            return true;
        }

        // Determine the current effective color
        const currentColor = this.activeColor || ("color" in top ? top.color : undefined);

        // --- Color match ---
        if ("color" in card && card.color === currentColor) return true;

        // --- Number match ---
        if (card.type === "NUMBERED" && top.type === "NUMBERED" && card.number === top.number) {
            return true;
        }

        // --- Action match (skip, reverse, draw) ---
        if (card.type === top.type && card.type !== "NUMBERED") {
            return true;
        }

        return false;
    }

    canPlayAny(): boolean {
        if (this.ended) return false
        return this.unoPlayers[this.currentPlayerIndex].getHandSize() > 0
    }

    onEnd(callback: (e: { winner: number }) => void): void {
        this.endCallbacks.push(callback)
    }

    play(index: number, chosenColor?: string): void {
        if (this.ended) throw new Error("Round has ended")
        const current = this.currentPlayerIndex
        this.checkPlayedCard(index, chosenColor)
        this.lastAction = "play"
        this.lastPlayedBy = current
        this.turnFrozen = true  // open accusation window

        const player = this.unoPlayers[current]
        if (player.getHandSize() === 0) {
            this.ended = true
            this.winnerIndex = current
            this.endCallbacks.forEach(cb => cb({ winner: this.winnerIndex! }))
            return
        }

        this.advancePlayer()
    }

    discardPile(): Deck {
        // Return a Deck object that wraps the actual discard pile
        const d = new Deck()
        d.cards = this.deck.discardPile
        return d
    }
}