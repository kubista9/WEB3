import { Round, } from './interfaces'
import { createRound, score } from './round'
import { GameProps, Game } from './interfaces'
import _ from "lodash"

export function createGame(props: GameProps): Game {
  const players = props.players ?? ["A", "B"]
  const targetScore = props.targetScore ?? 500
  const cardsPerPlayer = props.cardsPerPlayer ?? 7
  const randomizer = props.randomizer
  const shuffler = props.shuffler

  if (players.length < 2) throw new Error("Game requires at least 2 players")
  if (targetScore <= 0) throw new Error("Target score must be greater than 0")

  const scores = _.fill(Array(players.length), 0)
  const dealer = randomizer ? randomizer() : 0

  return {
    playerCount: players.length,
    players,
    targetScore,
    scores,
    currentRound: createRound(players, dealer, shuffler, cardsPerPlayer),
    randomizer,
    shuffler,
    cardsPerPlayer,
  }
}

export function play(roundAction: (r: Round) => Round, game: Game): Game {
  if (game.winner !== undefined || !game.currentRound) return game

  const updatedRound = roundAction(game.currentRound)

  if (updatedRound.winner === undefined) {
    return { ...game, currentRound: updatedRound }
  }
  const roundTotal = score(updatedRound) ?? 0
  const roundWinner = updatedRound.winner!

  const newScores = _.map(game.scores, (s, i) =>
    i === roundWinner ? s + roundTotal : s
  )

  const gameWinner = _.findIndex(newScores, (s) => s >= game.targetScore)

  if (gameWinner !== -1) {
    return {
      ...game,
      scores: newScores,
      winner: gameWinner,
      currentRound: undefined,
    }
  }

  const nextDealer = roundWinner
  const newRound = createRound(
    game.players,
    nextDealer,
    game.shuffler,
    game.cardsPerPlayer
  )

  return {
    ...game,
    scores: newScores,
    currentRound: newRound,
  }
}

export function winner(game: Game): number | undefined {
    return game.winner
}

export default {
    createGame,
    play,
    winner
}