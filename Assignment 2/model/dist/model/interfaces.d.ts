import { Randomizer } from "../utils/random_utils";
export type Color = 'BLUE' | 'GREEN' | 'RED' | 'YELLOW';
export type Type = 'NUMBERED' | 'SKIP' | 'REVERSE' | 'DRAW' | 'WILD' | 'WILD DRAW';
export type SkipCard = {
    type: 'SKIP';
    color: Color;
};
export type ReverseCard = {
    type: 'REVERSE';
    color: Color;
};
export type DrawTwoCard = {
    type: 'DRAW';
    color: Color;
};
export type WildCard = {
    type: 'WILD';
};
export type WildDrawCard = {
    type: 'WILD DRAW';
};
export type Card = NumberedCard | SkipCard | ReverseCard | DrawTwoCard | WildCard | WildDrawCard;
export type NumberedCard = Readonly<{
    type: 'NUMBERED';
    color: Color;
    number: number;
}>;
export type RoundProps = Readonly<{
    players: string[];
    dealer: number;
    shuffler?: any;
    cardsPerPlayer?: number;
}>;
export type Accusation = Readonly<{
    accuser: number;
    accused: number;
}>;
export type Deck = Readonly<Card[]>;
export type Round = Readonly<{
    playerCount: number;
    players: string[];
    dealer: number;
    hands: Card[][];
    discardPile: Card[];
    drawPile: Card[];
    playerInTurn?: number;
    currentColor?: string;
    direction: number;
    unoSaid: boolean[];
    winner?: number;
    lastPlayedBy?: number;
    lastAction?: 'play' | 'draw';
    shuffler?: (cards: Card[]) => Card[] | void;
}>;
export type GameProps = Readonly<{
    players?: string[];
    targetScore?: number;
    randomizer?: () => number;
    shuffler?: any;
    cardsPerPlayer?: number;
}>;
export type Game = Readonly<{
    playerCount: number;
    players: string[];
    targetScore: number;
    scores: number[];
    winner?: number;
    currentRound?: Round;
    randomizer?: Randomizer;
    shuffler?: any;
    cardsPerPlayer: number;
}>;
