import { CardTypes, UnoGame } from "./requirements"
import { Round } from "./round"
import { GameMemento } from "./requirements"
import { Randomizer, Shuffler, standardRandomizer, standardShuffler } from "../utils/random_utils"

export class Game implements UnoGame {
    players: string[]
    scores: Record<string, number>
    roundsPlayed: number

    constructor() {
        this.players = []
        this.scores = {}
        this.roundsPlayed = 0
    }

    startGame(playerNames: string[]): void {
        this.players = playerNames
        //this.scores = Object.fromEntries(playerNames.map(p => [p, 0]))
        this.scores = {}
        for (const p of playerNames) {
            this.scores[p] = 0
        }
        this.roundsPlayed = 0

        while (!this.hasWinner()) {
            this.playRound();
        }

        console.log("Winner is:", this.getWinner())
    }

    hasWinner(): boolean {
        return Object.values(this.scores).some(score => score >= 500)
    }

    getWinner(): string | null {
        return Object.entries(this.scores).find(([_, score]) => score >= 500)?.[0] || null // _ means ignore playerName
    }

    playRound(): void {
        const round = new Round(this.players, this.roundsPlayed % this.players.length, undefined, 7)
        round.startRound()

        // first player with no card wins
        let winner = round.unoPlayers.find(p => p.getHandSize() === 0)
        if (winner) {
            const points = this.calculatePoints(round, winner.playerName)
        }
        this.roundsPlayed++
    }

    calculatePoints(round: Round, winner: string): number {
        let points = 0
        for (const player of round.unoPlayers) {
            if (player.playerName !== winner) {
                for (const card of player.showHand()) {
                    points += this.cardValue(card)
                }
            }
        }
        return points
    }

    cardValue(card: CardTypes): number {
        switch (card.type) {
            case "NUMBERED": return card.number
            case "SKIP": return 20
            case "REVERSE": return 20
            case "DRAW CARD": return 20
            case "WILD CARD": return 50
            case "WILD DRAW": return 50
            default: return 0
        }
    }

    toMemento(): GameMemento {
        return null as any
    }

    static fromMemento(memento: GameMemento, randomizer: Randomizer = standardRandomizer, shuffler: Shuffler<CardTypes> = standardShuffler): Game {

        return null as any
    }
}