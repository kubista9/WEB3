export const ValidColors = ["RED", "GREEN", "BLUE", "YELLOW"] as const
export const ValidNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export const ValidActions = ["SKIP", "REVERSE", "DRAW_TWO"] as const

export type Color = typeof ValidColors[number]
export type NumberValue = typeof ValidNumbers[number]
export type Action = typeof ValidActions[number]

// Requirement 1 & 2
export type CardTypes = NUMBERED | SKIP | REVERSE | DRAW | WILD | WILD_DRAW

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

export interface DRAW {
    readonly type: "DRAW_TWO"
    readonly color: Color
}

export interface ACTION {
    readonly type: Action
    readonly color: Color
}

export interface WILD {
    readonly type: "WILD"
}

export interface WILD_DRAW {
    readonly type: "WILD_DRAW"
}

export interface BLANK {
    readonly type: "BLANK"
}

// Requirement 3
export type CardType =
    | "NUMBERED"
    | "SKIP"
    | "REVERSE"
    | "DRAW_TWO"
    | "WILD"
    | "WILD_DRAW"

// Requirement 4
export type TypedCard<T extends CardType> = Extract<CardTypes, { type: T }>;

// Requirement 5 1/2
export interface UnoDeck {
    drawPile: CardTypes[]
    discardPile: CardTypes[]
    startTheGame(): void
    shuffle(cards: CardTypes[]): void
    drawFromDeck(): CardTypes | undefined
    getDeckSize(): number
    drawCards(number: number): CardTypes[]
    discardCard(card: CardTypes): void
}

// Requirement 6 1/2
export interface UnoPlayer {
    playerCards: CardTypes[]
    playCard(index: number): void
    takeCard(card: CardTypes): void
    showHand(): CardTypes[]
    getHandSize(): number
    yellUno(): void
}

// Requirement 7 1/2
export interface UnoRound {
    startRound(playerNames: string[]): void
    dealCards(): void
    flipOneCard(): void
    playerTurn(): string
    nextPlayer(): void
    getTopCard(): CardTypes | undefined
    advancePlayer(): void
    checkPlayedCard(cardIndex: number, chosenColor?: string): void

}

// Optional 
export interface UnoGame {
    startGame(playerNames: string[]): void
}

export interface GameMemento {
    players: string[]
    scores: Record<string, number>
    roundsPlayed: number
}