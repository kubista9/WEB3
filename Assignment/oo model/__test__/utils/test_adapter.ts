import { Randomizer, Shuffler } from '../../src/utils/random_utils'
import { Deck } from '../../src/model/deck'
import { CardTypes, GameMemento, RoundMemento } from '../../src/model/interfaces'
import { Round } from '../../src/model/round'
import { Game } from '../../src/model/game'
import { standardRandomizer, standardShuffler } from '../../src/utils/random_utils'

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
  return new Round(players, dealer, shuffler, cardsPerPlayer)
}

export function createRoundFromMemento(
  memento: RoundMemento, 
  shuffler: Shuffler<CardTypes> = standardShuffler
): Round {
  return Round.fromMemento(memento, shuffler)
}

export type GameConfig = {
  players?: string[]
  targetScore?: number
  randomizer?: Randomizer
  shuffler?: Shuffler<CardTypes>
  cardsPerPlayer?: number
}

export function createGame(props: GameConfig = {}): Game {
  const players = props.players ?? ['A', 'B'];
  const targetScore = props.targetScore ?? 500;
  const shuffler = props.shuffler ?? standardShuffler;
  const randomizer = props.randomizer ?? standardRandomizer;
  const cardsPerPlayer = props.cardsPerPlayer ?? 7;
  
  return new Game(players, targetScore, shuffler, randomizer, cardsPerPlayer);
}

export function createGameFromMemento(
  memento: GameMemento, 
  shuffler: Shuffler<CardTypes> = standardShuffler
): Game {
  return Game.fromMemento(memento, shuffler, standardRandomizer)
}