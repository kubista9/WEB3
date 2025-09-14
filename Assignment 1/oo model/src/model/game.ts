import { Deck } from "./deck_implementation"
import { Hand } from "./player_hand_implementation"
import { UnoRound, CardTypes, UnoGame } from "./requirements"

export class Game implements UnoGame {
    players: string[]
    scores: Record<string, number>
    roundsPlayed: number;

    constructor() {
        this.players = []
        this.scores = {}
        this.roundsPlayed = 0
    }

    startGame(playerNames: string[]): void {
        this.players = playerNames
        //this.scores = Object.fromEntries(playerNames.map(p => [p, 0]));
        this.scores = {};
        for (const p of playerNames) {
            this.scores[p] = 0;
        }
        this.roundsPlayed = 0
    }
}