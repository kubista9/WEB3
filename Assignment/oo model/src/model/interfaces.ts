export const colors = ["BLUE", "GREEN", "RED", "YELLOW"]
export const ValidNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export const ValidActions = ["SKIP", "REVERSE", "DRAW"] as const

export type Direction = "clockwise" | "counterclockwise"
export type Color = typeof colors[number]
export type NumberValue = typeof ValidNumbers[number]
export type Action = typeof ValidActions[number]

// Requirement 1 & 2
export type CardTypes = NUMBERED | SKIP | REVERSE | DRAW_CARD | WILD_CARD | WILD_DRAW

export interface NUMBERED {
    readonly type: "NUMBERED"
    readonly color: Color
    readonly number: NumberValue
}

export interface SKIP {
    readonly type: "SKIP"
    readonly color: Color
}

export interface REVERSE {
    readonly type: "REVERSE";
    readonly color: Color;
}

export interface DRAW_CARD {
    readonly type: "DRAW CARD"
    readonly color: Color
}

export interface ACTION {
    readonly type: Action
    readonly color: Color
}

export interface WILD_CARD {
    readonly type: "WILD CARD"
}

export interface WILD_DRAW {
    readonly type: "WILD DRAW"
}

export interface BLANK {
    readonly type: "BLANK"
}

// Requirement 3
export type CardType =
  | { type: "NUMBERED"; color: "RED" | "GREEN" | "BLUE" | "YELLOW"; number: number }
  | { type: "SKIP"; color: "RED" | "GREEN" | "BLUE" | "YELLOW" }
  | { type: "REVERSE"; color: "RED" | "GREEN" | "BLUE" | "YELLOW" }
  | { type: "DRAW CARD"; color: "RED" | "GREEN" | "BLUE" | "YELLOW" }
  | { type: "WILD CARD" }
  | { type: "WILD DRAW" }

// Requirement 4
export type TypedCard<T extends CardType> = Extract<CardTypes, { type: T }>;

// Requirement 5 1/2
export interface UnoDeck {
    cards: CardTypes[]
    discardPile: CardTypes[]
    startTheGame(): void
    shuffle(): void
    drawFromDeck(): CardTypes | undefined
    getDeckSize(): number
    drawCards(number: number): CardTypes[]
    discardCard(card: CardTypes): void
}

// Requirement 6 1/2
export interface UnoPlayer {
    playerCards: CardTypes[]
    playCard(index: number): CardTypes | undefined
    takeCard(card: CardTypes): void
    showHand(): CardTypes[]
    getHandSize(): number
    yellUno(): void
}

// Requirement 7 1/2
export interface UnoRound {
  // players & hands
  player(index: number): string
  playerHand(index: number): CardTypes[]
  playerCount: number

  // piles
  drawPile(): { deal(): CardTypes | undefined; size: number }
  discardPile(): { top(): CardTypes | undefined; size: number }

  // round state
  dealer: number
  playerInTurn(): number | undefined
  canPlay(index: number): boolean
  canPlayAny(): boolean

  // gameplay
  play(index: number, chosenColor?: string): void
  sayUno(index: number): void
  catchUnoFailure(args: { accuser: number; accused: number }): boolean

  // lifecycle
  hasEnded(): boolean
  winner(): number | undefined
  score(): number | undefined
  onEnd(callback: (e: { winner: number }) => void): void

  // memento
  toMemento(): RoundMemento
}

// Optional 
export interface UnoGame {
    startGame(playerNames: string[]): void
}

export interface RoundMemento {
    players: string[]
    hands: CardTypes[][]
    drawPile: CardTypes[]
    discardPile: CardTypes[]
    currentColor: string
    currentDirection: Direction
    dealer: number
    playerInTurn: number
}

export interface GameMemento {
    players: string[]
    scores: number[]
    roundsPlayed: number
    targetScore: number
    currentRound?: RoundMemento
    cardsPerPlayer: number,
}