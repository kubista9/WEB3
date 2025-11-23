import { Shuffler, standardShuffler } from '../../utils/random_utils'
import * as deck from '../../src/deck'
import * as round from '../../src/round'
import * as uno from '../../src/uno'
import { Card, Round, Game, GameProps, Deck } from '../../src/interfaces'

export function createInitialDeck(): Deck {
  return [...deck.createInitialDeck()]
}

export type RoundProps = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<Card>
  cardsPerPlayer?: number
}

export function createRound({
  players,
  dealer,
  shuffler = standardShuffler,
  cardsPerPlayer = 7
}: RoundProps): Round {
  return round.createRound(players, dealer, shuffler, cardsPerPlayer)
}

export function createGame(props: GameProps): Game {
  return uno.createGame(props)
}