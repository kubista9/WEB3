export const ValidColors = ["Red", "Green", "Blue", "Yellow"] as const
export const ValidNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export const ValidActions = ["Skip", "Reverse", "Draw Two"] as const

export type Color = typeof ValidColors[number]
export type NumberValue = typeof ValidNumbers[number]
export type Action = typeof ValidActions[number]

// Requirement 1 & 2
export type CardTypes = NumberCard | SkipCard | ReverseCard | DrawTwoCard | WildCard | WildDrawFourCard

export interface NumberCard {
    readonly type: "Numbered"
    readonly color: Color
    readonly value: NumberValue
}

export interface SkipCard {
    readonly type: "Skip"
    readonly color: Color
}

export interface ReverseCard {
    readonly type: "Reverse";
    readonly color: Color;
}

export interface DrawTwoCard {
    readonly type: "Draw Two"
    readonly color: Color
}

export interface ActionCard {
    readonly type: Action
    readonly color: Color
}

export interface WildCard {
    readonly type: "Wild"
}
export interface WildDrawFourCard {
    readonly type: "Wild Draw Four"
}

export interface BlankCard {
    readonly type: "Blank"
}

// Requirement 3
export type CardType =
    | "Numbered"
    | "Skip"
    | "Reverse"
    | "Draw Two"
    | "Wild"
    | "Wild Draw Four"

// Requirement 4
export type TypedCard<T extends CardType> = Extract<CardTypes, { type: T }>;

// Requirement 5 1/2
export interface UnoDeck {
    drawPile: CardTypes[]
    discardPile: CardTypes[]
    startTheGame(): void
    shuffleDeck(): void
    drawFromDeck(): CardTypes | undefined
    getDeckSize(): number
    drawCards(number: number): CardTypes[]
    discardCard(card: CardTypes): void
}

// Requirement 6 1/2
export interface PlayerHand {
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