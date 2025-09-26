import { Randomizer, Shuffler, standardRandomizer, standardShuffler } from '../../src/utils/random_utils'
import { Deck } from '../../src/model/deck'
import { CardTypes } from '../../src/model/requirements'
import { Round } from '../../src/model/round'
import { Uno } from '../../src/model/uno'

//Fill out the empty functions
export function createInitialDeck(): Deck {
  const deck = new Deck()
  deck.startTheGame()
  return deck
}

export function createDeckFromMemento(cards: Record<string, string | number>[]): Deck {
  return Deck.fromMemento(cards)
}

export type HandConfig = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<CardTypes>
  cardsPerPlayer?: number
}

export function createRound({
  players,
  dealer,
  shuffler = standardShuffler,
  cardsPerPlayer = 7
}: HandConfig): Round {
  const round = new Round(players, dealer, shuffler, cardsPerPlayer)
  return round
}

export function createRoundFromMemento(memento: any, shuffler: Shuffler<CardTypes> = standardShuffler): Round {
  return null as any
}

export type GameConfig = {
  players: string[]
  targetScore: number
  randomizer: Randomizer
  shuffler: Shuffler<CardTypes>
  cardsPerPlayer: number
}

export function createGame(props: Partial<GameConfig>): Uno {
  const game = new Uno()
  return game
}

export function createGameFromMemento(memento: any, randomizer: Randomizer = standardRandomizer, shuffler: Shuffler<CardTypes> = standardShuffler): Uno {
  return Uno.fromMemento(memento, randomizer, shuffler)
}
