import { UnoGame, GameMemento } from "./interfaces"
import { Round } from "./round"

export class Game implements UnoGame {
    players: string[]
    scores: number[]
    targetScore: number
    currentRound?: Round
    roundsPlayed: number

    constructor(players: string[], targetScore: number) {
        this.players = players
        this.scores = []
        this.targetScore = targetScore
        this.roundsPlayed = 0
    }

    // to do
    startGame(playerNames: string[]): void {
        while (!this.hasWinner()) {
            const newRound = new Round(playerNames, null, null, 7)
            newRound.play(1)
        }
    }

    hasWinner(): boolean {
        return this.scores.some(s => s >= this.targetScore)
    }

    player(index: number): string {
        return null as any
    }

    toMemento(): GameMemento {
        return {
            players: this.players,
            scores: [...this.scores],
            roundsPlayed: this.roundsPlayed,
            targetScore: this.targetScore,
            currentRound: this.currentRound,
            cardsPerPlayer: 7
        }
    }

    static fromMemento(memento: GameMemento): Game {
        const game = new Game(memento.players, memento.targetScore)
        game.scores = [...memento.scores]
        game.roundsPlayed = memento.roundsPlayed
        if (memento.currentRound) {
            game.currentRound = Round.fromMemento(memento.currentRound, null)
        }
        return game
    }
}