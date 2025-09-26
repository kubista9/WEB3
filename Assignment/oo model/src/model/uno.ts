import { CardTypes, UnoGame } from "./requirements"
import { Round } from "./round"
import { GameMemento } from "./requirements"
import { Randomizer, Shuffler, standardRandomizer, standardShuffler } from "../utils/random_utils"

export class Uno implements UnoGame {
    players: string[]
    scores: Record<string, number>
    roundsPlayed: number
    targetScore: number
    currentRoundInstance?: Round

    constructor(
        players: string[] = [],
        targetScore: number = 500,
        initialMemento?: GameMemento
    ) {
        this.players = players
        this.scores = {}
        this.roundsPlayed = 0
        this.targetScore = targetScore
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
        return Object.values(this.scores).some(score => score >= this.targetScore)
    }

    getWinner(): string | null {
        return Object.entries(this.scores).find(([_, score]) => score >= 500)?.[0] || null // _ means ignore playerName
    }

    playRound(): void {
        this.currentRoundInstance = new Round(this.players, this.roundsPlayed % this.players.length, undefined, 7)
        this.currentRoundInstance.startRound()

        // first player with no card wins
        let winner = this.currentRoundInstance.unoPlayers.find(p => p.getHandSize() === 0)
        if (winner) {
            const points = this.calculatePoints(this.currentRoundInstance, winner.playerName)
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

    toMemento(): object {
        return {
            players: this.players,
            scores: this.players.map(p => this.scores[p]),
            roundsPlayed: this.roundsPlayed,
            targetScore: this.targetScore,
            currentRound: this.hasWinner() ? undefined : this.currentRoundInstance?.toMemento()
        }
    }

    static fromMemento(
        memento: GameMemento,
        randomizer: Randomizer = standardRandomizer,
        shuffler: Shuffler<CardTypes> = standardShuffler
    ): Uno {

        const game = new Uno(memento.players, memento.targetScore, memento)
        // rebuild scores
        game.scores = {}
        memento.players.forEach((p, i) => game.scores[p] = memento.scores[i])
        return game
    }

    player(index: number): string {
        return this.players[index]
    }

    currentRound(): Round | undefined {
        return this.currentRoundInstance
    }

    score(index: number): number {
        return this.scores[this.players[index]]
    }

    winner(): number {
        return this.players.findIndex(p => this.scores[p] >= this.targetScore)
    }
}