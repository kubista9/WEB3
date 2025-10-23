import { Deck } from './deck'

export const colors = ['BLUE', 'GREEN', 'RED', 'YELLOW'] as const;
export type Color = typeof colors[number];

export type Type =
  | 'NUMBERED'
  | 'SKIP'
  | 'REVERSE'
  | 'DRAW CARD'
  | 'WILD CARD'
  | 'WILD DRAW';

export type NumberedCard = Readonly<{
  type: 'NUMBERED';
  color: Color;
  number: number;
}>;

export type SkipCard = Readonly<{
  type: 'SKIP';
  color: Color;
}>;

export type ReverseCard = Readonly<{
  type: 'REVERSE';
  color: Color;
}>;

export type DrawCard = Readonly<{
  type: 'DRAW CARD';
  color: Color;
}>;

export type WildCard = Readonly<{
  type: 'WILD CARD';
}>;

export type WildDrawCard = Readonly<{
  type: 'WILD DRAW';
}>;

export type ColoredCard = NumberedCard | SkipCard | ReverseCard | DrawCard;
export type WildCards = WildCard | WildDrawCard;
export type Card = ColoredCard | WildCards;
export type CardTypes = Card;

export type TypedCard<T extends Type> = // conditional if statements
  T extends 'NUMBERED' ? NumberedCard :
  T extends 'SKIP' ? SkipCard :
  T extends 'REVERSE' ? ReverseCard :
  T extends 'DRAW CARD' ? DrawCard :
  T extends 'WILD CARD' ? WildCard :
  T extends 'WILD DRAW' ? WildDrawCard :
  never;

export type Direction = 'clockwise' | 'counterclockwise';

export interface RoundMemento {
  readonly players: string[];
  readonly hands: Record<string, string | number>[][];
  readonly drawPile: Record<string, string | number>[];
  readonly discardPile: Record<string, string | number>[];
  readonly currentColor: string;
  readonly currentDirection: Direction;
  readonly dealer: number;
  readonly playerInTurn?: number;
}

export interface GameMemento {
  readonly players: string[];
  readonly targetScore: number;
  readonly scores: number[];
  readonly currentRound?: RoundMemento;
  readonly cardsPerPlayer: number;
}

export interface GameState {
  readonly players: string[];
  readonly targetScore: number;
  readonly scores: number[];
  readonly currentRound?: RoundState;
  readonly cardsPerPlayer: number;
  readonly winner?: number;
}

export interface RoundState {
  readonly players: string[];
  readonly hands: Card[][];
  readonly drawPile: Deck;
  readonly discardPile: Deck;
  readonly currentColor: Color;
  readonly currentDirection: Direction;
  readonly dealer: number;
  readonly playerInTurn: number;
  readonly ended: boolean;
}