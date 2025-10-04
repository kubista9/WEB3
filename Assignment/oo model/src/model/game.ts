import { UnoGame, GameMemento } from "./interfaces"
import { Round } from "./round"
import { standardShuffler } from "../utils/random_utils"

export class Game implements UnoGame {
    players: string[]
    scores: number[]
    targetScore: number
    _currentRound?: Round
    roundsPlayed: number
    cardsPerPlayer: number
    originalMemento?: GameMemento

    constructor(players: string[], targetScore: number) {
        this.players = players
        this.scores = []
        this.targetScore = targetScore
        this.roundsPlayed = 0
        this.cardsPerPlayer = 0
    }

    startGame(playerNames: string[]): void {
        const shuffler = standardShuffler
        while (!this.winner()) {
            const newRound = new Round(playerNames, 1, shuffler, 7)
            newRound.play(1)
        }
    }

    winner(): boolean {
        return this.scores.some(s => s >= this.targetScore)
    }

    player(index: number): string {
        return null as any
    }

    toMemento(): GameMemento {
        if (this.originalMemento) return this.originalMemento
        return {
            players: [...this.players],
            scores: [...this.scores],
            roundsPlayed: this.roundsPlayed,
            targetScore: this.targetScore,
            currentRound: this.winner() !== undefined ? undefined : this._currentRound?.toMemento(),
            cardsPerPlayer: this.cardsPerPlayer,
        }
    }

    static fromMemento(memento: GameMemento): Game {
        if (memento.players.length !== memento.scores.length) {
            throw new Error("Memento is corrupted: players and scores length mismatch")
        }
        const game = new Game(memento.players, memento.targetScore)
        game.scores = [...memento.scores]
        game.roundsPlayed = memento.roundsPlayed
        if (memento.currentRound) {
            game._currentRound = Round.fromMemento(memento.currentRound, null)
        }
        return game
    }

    playerCount(): number {
        return this.players.length
    }

    score(index: number): number {
        if (index < 0 || index >= this.players.length) throw new Error("Player index out of bounds")
        return this.scores[index]
    }

    currentRound(): Round | undefined {
        return this._currentRound
    }
}