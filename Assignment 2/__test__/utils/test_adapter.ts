import { Shuffler, standardShuffler } from '../../utils/random_utils'
import * as deck from '../../model/deck'
import * as round from '../../model/round'
import * as uno from '../../model/uno'
import { Card, Round, Game, GameProps, Deck } from '../../model/interfaces'

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