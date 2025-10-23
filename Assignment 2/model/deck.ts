import { Card, colors } from './interfaces';
import * as  _ from 'lodash';

export type Deck = ReadonlyArray<Card>;

export const createDeck = (): Deck => {
  const numbered = colors.flatMap(color =>
    _.range(0, 10).flatMap((n: number) =>
      n === 0
        ? [{ type: 'NUMBERED', color, number: n }]
        : [
          { type: 'NUMBERED', color, number: n },
          { type: 'NUMBERED', color, number: n },
        ]
    )
  );

  const specials = colors.flatMap(color => [
    { type: 'SKIP', color },
    { type: 'SKIP', color },
    { type: 'REVERSE', color },
    { type: 'REVERSE', color },
    { type: 'DRAW CARD', color },
    { type: 'DRAW CARD', color },
  ]);

  const wilds = _.flatMap(_.range(4), () => [
    { type: 'WILD CARD' },
    { type: 'WILD DRAW' },
  ] as any);

  return Object.freeze([...numbered, ...specials, ...wilds]);
};

export const shuffleDeck = (deck: Deck): Deck => Object.freeze(_.shuffle([...deck]));

export const dealCard = (deck: Deck): [Card | undefined, Deck] =>
  deck.length === 0 ? [undefined, deck] : [deck[0], Object.freeze(deck.slice(1))];

export const peekCard = (deck: Deck): Card | undefined => deck[0];

export const toMemento = (deck: Deck): Record<string, string | number>[] =>
  deck.map(c => ({ ...c }));

export const fromMemento = (mem: Record<string, string | number>[]): Deck =>
  Object.freeze(mem.map(c => ({ ...c })) as Card[]);
