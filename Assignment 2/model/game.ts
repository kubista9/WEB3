import { GameMemento } from './interfaces';
import { Round } from './round';
import { Shuffler, Randomizer, standardShuffler, standardRandomizer } from '../utils/random_utils';
import { Card } from './interfaces';

export class Game {
  private players: string[];
  private _targetScore: number;
  private scores: number[];
  private _currentRound: Round | undefined;
  private cardsPerPlayer: number;
  private shuffler: Shuffler<Card>;
  private randomizer: Randomizer;
  private _winner: number | undefined;

  constructor(
    players: string[],
    targetScore: number,
    shuffler: Shuffler<Card> = standardShuffler,
    randomizer: Randomizer = standardRandomizer,
    cardsPerPlayer: number = 7
  ) {
    if (players.length < 2) throw new Error('At least 2 players required');
    if (targetScore <= 0) throw new Error('Target score must be positive');

    this.players = players;
    this._targetScore = targetScore;
    this.cardsPerPlayer = cardsPerPlayer;
    this.shuffler = shuffler;
    this.randomizer = randomizer;
    this.scores = new Array(this.players.length).fill(0);
    this.startNewRound();
  }

  get playerCount(): number {
    return this.players.length;
  }

  get targetScore(): number {
    return this._targetScore;
  }

  player(index: number): string {
    if (index < 0 || index >= this.players.length) {
      throw new Error('Player index out of bounds');
    }
    return this.players[index];
  }

  score(index: number): number {
    return this.scores[index];
  }

  winner(): number | undefined {
    return this._winner;
  }

  currentRound(): Round | undefined {
    return this._currentRound;
  }

  toMemento(): GameMemento {
    return {
      players: this.players,
      targetScore: this._targetScore,
      scores: [...this.scores],
      currentRound: this._currentRound?.toMemento(),
      cardsPerPlayer: this.cardsPerPlayer
    };
  }

  static fromMemento(memento: GameMemento, shuffler: Shuffler<Card> = standardShuffler, randomizer: Randomizer = standardRandomizer): Game {
    if (memento.players.length < 2) throw new Error('At least 2 players required');
    if (memento.targetScore <= 0) throw new Error('Target score must be positive');
    if (memento.scores.some(s => s < 0)) throw new Error('Negative scores not allowed');
    if (memento.scores.length !== memento.players.length) throw new Error('Mismatched scores and players');
    const winners = memento.scores.filter(s => s >= memento.targetScore).length;
    if (winners > 1) throw new Error('Multiple winners');
    if (winners === 0 && !memento.currentRound) throw new Error('Missing currentRound in unfinished game');

    const game = Object.create(Game.prototype); // const game = new Game(players, targetScore, shuffler, randomizer, cardsPerPlayer); <- kind of less advanced
    game.players = memento.players;
    game._targetScore = memento.targetScore;
    game.scores = [...memento.scores];
    game.cardsPerPlayer = memento.cardsPerPlayer || 7;
    game.shuffler = shuffler;
    game.randomizer = randomizer;
    game._winner = winners === 1 ? memento.scores.findIndex(s => s >= memento.targetScore) : undefined;

    if (memento.currentRound) {
      game._currentRound = Round.fromMemento(memento.currentRound, game.shuffler);
      game._currentRound.onEnd((event: { winner: number }) => { //   when round finishes
        const roundScore = game._currentRound!.score()!;
        game.scores[event.winner] += roundScore;

        if (game.scores[event.winner] >= game._targetScore) {
          game._winner = event.winner;
          game._currentRound = undefined;
        } else {
          game.startNewRound();
        }
      });
    } else {
      game._currentRound = undefined;
    }

    return game;
  }

  startNewRound(): void {
    const randomValue = this.randomizer(4);
    const dealer = Math.floor(randomValue * this.players.length);
    this._currentRound = new Round(
      this.players,
      dealer,
      this.shuffler,
      this.cardsPerPlayer
    );

    this._currentRound.onEnd(event => {
      const roundScore = this._currentRound!.score()!;
      this.scores[event.winner] += roundScore;

      if (this.scores[event.winner] >= this._targetScore) {
        this._winner = event.winner;
        this._currentRound = undefined;
      } else {
        this.startNewRound();
      }
    });
  }
}