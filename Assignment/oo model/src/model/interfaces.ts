export const colors = ['BLUE', 'GREEN', 'RED', 'YELLOW'] as const;
export type Color = typeof colors[number];

export type Type =
  | 'NUMBERED'
  | 'SKIP'
  | 'REVERSE'
  | 'DRAW CARD'
  | 'WILD CARD'
  | 'WILD DRAW';

export type NumberedCard = {
  type: 'NUMBERED';
  color: Color;
  number: number;
};

export type SkipCard = {
  type: 'SKIP';
  color: Color;
};

export type ReverseCard = {
  type: 'REVERSE';
  color: Color;
};

export type DrawCard = {
  type: 'DRAW CARD';
  color: Color;
};

export type WildCard = {
  type: 'WILD CARD';
};

export type WildDrawCard = {
  type: 'WILD DRAW';
};

export type ColoredCard = NumberedCard | SkipCard | ReverseCard | DrawCard;
export type WildCards = WildCard | WildDrawCard;
export type Card = ColoredCard | WildCards;
export type CardTypes = Card;

export type TypedCard<T extends Type> =
  T extends 'NUMBERED' ? NumberedCard :
  T extends 'SKIP' ? SkipCard :
  T extends 'REVERSE' ? ReverseCard :
  T extends 'DRAW CARD' ? DrawCard :
  T extends 'WILD CARD' ? WildCard :
  T extends 'WILD DRAW' ? WildDrawCard :
  never;

export type Direction = 'clockwise' | 'counterclockwise';

export interface RoundMemento {
  players: string[];
  hands: Record<string, string | number>[][];
  drawPile: Record<string, string | number>[];
  discardPile: Record<string, string | number>[];
  currentColor: string;
  currentDirection: Direction;
  dealer: number;
  playerInTurn?: number;
}

export interface GameMemento {
  players: string[];
  targetScore: number;
  scores: number[];
  currentRound?: RoundMemento;
  cardsPerPlayer: number;
}