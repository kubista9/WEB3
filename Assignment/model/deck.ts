import { Card, Color, colors, CardTypes } from './interfaces';

export function hasColor(card: Card, color: Color): boolean {
  return 'color' in card && card.color === color;
}

export function hasNumber(card: Card, number: number): boolean {
  return card.type === 'NUMBERED' && card.number === number;
}

export class Deck {
  private cards: Card[];

  constructor(cards: Card[] = []) {
    this.cards = [...cards];
  }

  get size(): number {
    return this.cards.length;
  }

  startTheGame(): void {
    this.cards = [];

    // Numbered cards
    for (const color of colors) {
      this.cards.push({ type: 'NUMBERED', color, number: 0 });
      for (let number = 1; number <= 9; number++) {
        this.cards.push({ type: 'NUMBERED', color, number });
        this.cards.push({ type: 'NUMBERED', color, number });
      }
    }

    // Special colored cards
    for (const color of colors) {
      this.cards.push({ type: 'SKIP', color });
      this.cards.push({ type: 'SKIP', color });
      this.cards.push({ type: 'REVERSE', color });
      this.cards.push({ type: 'REVERSE', color });
      this.cards.push({ type: 'DRAW CARD', color });
      this.cards.push({ type: 'DRAW CARD', color });
    }

    // Wild cards
    for (let i = 0; i < 4; i++) {
      this.cards.push({ type: 'WILD CARD' });
      this.cards.push({ type: 'WILD DRAW' });
    }
  }

  shuffle<T>(shuffler: (cards: T[]) => void): void {
    shuffler(this.cards as any);
  }

  deal(): Card | undefined {
    return this.cards.shift();
  }

  peek(): Card | undefined {
    return this.cards[0];
  }

  top(): Card {
    if (this.cards.length === 0) {
      throw new Error('Deck is empty');
    }
    return this.cards[0];
  }

  filter(predicate: (card: Card) => boolean): Deck {
    return new Deck(this.cards.filter(predicate));
  }

  toMemento(): Record<string, string | number>[] {
    return this.cards.map(card => ({ ...card }));
  }

  static fromMemento(memento: Record<string, string | number>[]): Deck {
    const cards: Card[] = memento.map(cardData => {
      const type = cardData.type as string;

      if (type === 'NUMBERED') {
        if (!('color' in cardData) || !('number' in cardData)) {
          throw new Error('Invalid numbered card');
        }
        return { type: 'NUMBERED', color: cardData.color as Color, number: cardData.number as number };
      }
      if (type === 'SKIP') {
        if (!('color' in cardData)) throw new Error('Invalid skip card');
        return { type: 'SKIP', color: cardData.color as Color };
      }
      if (type === 'REVERSE') {
        if (!('color' in cardData)) throw new Error('Invalid reverse card');
        return { type: 'REVERSE', color: cardData.color as Color };
      }
      if (type === 'DRAW CARD') {
        if (!('color' in cardData)) throw new Error('Invalid draw card');
        return { type: 'DRAW CARD', color: cardData.color as Color };
      }
      if (type === 'WILD CARD') {
        return { type: 'WILD CARD' };
      }
      if (type === 'WILD DRAW') {
        return { type: 'WILD DRAW' };
      }

      throw new Error(`Invalid card type: ${type}`);
    });

    return new Deck(cards);
  }
}
