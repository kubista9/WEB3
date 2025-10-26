import { GameMemento, GameState, RoundState } from './interfaces';
import {
  createRound,
  toMemento as roundToMemento,
  fromMemento as roundFromMemento,
} from './round';



export const createGame = (
  players: string[],
  targetScore: number,
  cardsPerPlayer = 7
): GameState => {
  if (players.length < 2) throw new Error('At least 2 players required');
  return Object.freeze({
    players,
    scores: Object.freeze(Array(players.length).fill(0)),
    targetScore,
    currentRound: createRound(players, 0, cardsPerPlayer),
    cardsPerPlayer,
  });
};

export const updateRound = (game: GameState, newRound: RoundState): GameState =>
  Object.freeze({
    ...game,
    currentRound: newRound,
  });

export const endRound = (game: GameState, winner: number, score: number): GameState => {
  const newScores = game.scores.map((s, i) => (i === winner ? s + score : s));
  const gameWinner = newScores[winner] >= game.targetScore ? winner : undefined;
  return Object.freeze({
    ...game,
    scores: newScores,
    winner: gameWinner,
    currentRound: gameWinner ? null : createRound(game.players, winner, game.cardsPerPlayer),
  });
};

export const toMemento = (game: GameState): GameMemento => ({
  players: game.players,
  targetScore: game.targetScore,
  scores: [...game.scores],
  currentRound: game.currentRound ? roundToMemento(game.currentRound) : undefined,
  cardsPerPlayer: game.cardsPerPlayer,
});

export const fromMemento = (m: GameMemento): GameState =>
  Object.freeze({
    players: m.players,
    scores: Object.freeze([...m.scores]),
    targetScore: m.targetScore,
    currentRound: m.currentRound ? roundFromMemento(m.currentRound) : null,
    cardsPerPlayer: m.cardsPerPlayer,
    winner: undefined,
  });