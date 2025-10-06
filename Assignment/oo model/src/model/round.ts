import { Card, Color, Direction, RoundMemento, colors } from './interfaces';
import { Deck, hasColor } from './deck';
import { Shuffler, standardShuffler } from '../utils/random_utils';

export class Round {
  private players: string[];
  private hands: Card[][];
  private _drawPile: Deck;
  private _discardPile: Deck;
  private currentColor: Color;
  private currentDirection: Direction;
  private _dealer: number;
  private _playerInTurn: number | undefined;
  private shuffler: Shuffler<Card>;
  private unoSaid: Set<number> = new Set();
  private lastPlayedPlayer: number | undefined;
  private ended: boolean = false;
  private endCallbacks: Array<(event: { winner: number }) => void> = [];

  constructor(
    players: string[],
    dealer: number,
    shuffler: Shuffler<Card> = standardShuffler,
    cardsPerPlayer: number = 7
  ) {
    if (players.length < 2) throw new Error('At least 2 players required');
    if (players.length > 10) throw new Error('Maximum 10 players');

    this.players = players;
    this._dealer = dealer;
    this.shuffler = shuffler;
    
    // Initialize deck
    const deck = new Deck();
    deck.startTheGame();
    deck.shuffle(this.shuffler);
    
    // Deal cards
    this.hands = this.players.map(() => []);
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let p = 0; p < this.players.length; p++) {
        const card = deck.deal();
        if (card) this.hands[p].push(card);
      }
    }
    
    // Set up discard pile - reshuffle if wild card on top
    let topCard = deck.deal();
    while (topCard && (topCard.type === 'WILD CARD' || topCard.type === 'WILD DRAW')) {
      const newDeck = new Deck();
      newDeck.startTheGame();
      newDeck.shuffle(this.shuffler);
      
      this.hands = this.players.map(() => []);
      for (let i = 0; i < cardsPerPlayer; i++) {
        for (let p = 0; p < this.players.length; p++) {
          const card = newDeck.deal();
          if (card) this.hands[p].push(card);
        }
      }
      topCard = newDeck.deal();
      this._drawPile = newDeck;
    }
    
    if (!topCard) throw new Error('Failed to initialize discard pile');
    
    this._discardPile = new Deck([topCard]);
    this._drawPile = deck;
    
    this.currentColor = 'color' in topCard ? topCard.color : 'BLUE';
    this.currentDirection = 'clockwise';
    
    // Determine first player based on top card
    let firstPlayer = (this._dealer + 1) % this.players.length;
    
    if (topCard.type === 'REVERSE') {
      this.currentDirection = 'counterclockwise';
      firstPlayer = this._dealer === 0 ? this.players.length - 1 : this._dealer - 1;
    } else if (topCard.type === 'SKIP') {
      firstPlayer = (this._dealer + 2) % this.players.length;
    } else if (topCard.type === 'DRAW CARD') {
      const targetPlayer = (this._dealer + 1) % this.players.length;
      this.drawCardsForPlayer(targetPlayer, 2);
      firstPlayer = (this._dealer + 2) % this.players.length;
    }
    
    this._playerInTurn = firstPlayer;
  }

  get playerCount(): number {
    return this.players.length;
  }

  get dealer(): number {
    return this._dealer;
  }

  player(index: number): string {
    if (index < 0 || index >= this.players.length) {
      throw new Error('Player index out of bounds');
    }
    return this.players[index];
  }

  playerHand(index: number): readonly Card[] {
    return this.hands[index];
  }

  playerInTurn(): number | undefined {
    return this._playerInTurn;
  }

  drawPile(): Deck {
    return this._drawPile;
  }

  discardPile(): Deck {
    return this._discardPile;
  }

  canPlay(cardIndex: number): boolean {
    if (cardIndex < 0 || this._playerInTurn === undefined) return false;
    const hand = this.hands[this._playerInTurn];
    if (cardIndex >= hand.length) return false;
    
    const card = hand[cardIndex];
    const topCard = this._discardPile.top();
    
    // Wild card can always be played
    if (card.type === 'WILD CARD') return true;
    
    // Wild Draw 4: can only play if no card of current color in hand
    if (card.type === 'WILD DRAW') {
      return !hand.some(c => 'color' in c && c.color === this.currentColor);
    }
    
    // Colored cards
    if ('color' in card) {
      // Matching color
      if (card.color === this.currentColor) return true;
      
      // Matching number
      if (card.type === 'NUMBERED' && topCard.type === 'NUMBERED' && card.number === topCard.number) {
        return true;
      }
      
      // Matching type (for special cards)
      if (card.type === topCard.type && card.type !== 'NUMBERED') {
        return true;
      }
    }
    
    return false;
  }

  canPlayAny(): boolean {
    if (this._playerInTurn === undefined) return false;
    const hand = this.hands[this._playerInTurn];
    return hand.some((_, i) => this.canPlay(i));
  }

  play(cardIndex: number, chosenColor?: Color): Card {
    if (this.ended) throw new Error('Round has ended');
    if (this._playerInTurn === undefined) throw new Error('No player in turn');
    if (!this.canPlay(cardIndex)) throw new Error('Illegal play');
    
    const hand = this.hands[this._playerInTurn];
    const card = hand[cardIndex];
    
    // Validate color choice
    if (card.type === 'WILD CARD' || card.type === 'WILD DRAW') {
      if (!chosenColor) throw new Error('Must choose a color for wild card');
    } else {
      if (chosenColor) throw new Error('Cannot choose color for non-wild card');
    }
    
    // Remove card from hand
    hand.splice(cardIndex, 1);
    
    // Add to discard pile
    const discardMem = this._discardPile.toMemento();
    discardMem.unshift({ ...card });
    this._discardPile = Deck.fromMemento(discardMem);
    
    // Update current color
    if (chosenColor) {
      this.currentColor = chosenColor;
    } else if ('color' in card) {
      this.currentColor = card.color;
    }
    
    this.lastPlayedPlayer = this._playerInTurn;
    // Don't delete UNO said status here - it should persist until caught or new card played
    
    // Check if player won
    if (hand.length === 0) {
      this.ended = true;
      this._playerInTurn = undefined;
      this.endCallbacks.forEach(cb => cb({ winner: this.lastPlayedPlayer! }));
      return card;
    }
    
    // Handle special cards
    let nextPlayer = this.getNextPlayer(this._playerInTurn);
    
    if (card.type === 'SKIP') {
      nextPlayer = this.getNextPlayer(nextPlayer);
    } else if (card.type === 'REVERSE') {
      if (this.players.length === 2) {
        nextPlayer = this._playerInTurn;
      } else {
        this.currentDirection = this.currentDirection === 'clockwise' ? 'counterclockwise' : 'clockwise';
        nextPlayer = this.getNextPlayer(this._playerInTurn);
      }
    } else if (card.type === 'DRAW CARD') {
      this.drawCardsForPlayer(nextPlayer, 2);
      nextPlayer = this.getNextPlayer(nextPlayer);
    } else if (card.type === 'WILD DRAW') {
      this.drawCardsForPlayer(nextPlayer, 4);
      nextPlayer = this.getNextPlayer(nextPlayer);
    }
    
    this._playerInTurn = nextPlayer;
    return card;
  }

  draw(): void {
    if (this.ended) throw new Error('Round has ended');
    if (this._playerInTurn === undefined) throw new Error('No player in turn');
    
    const card = this.drawCard();
    if (card) {
      this.hands[this._playerInTurn].push(card);
      
      const cardIndex = this.hands[this._playerInTurn].length - 1;
      if (!this.canPlay(cardIndex)) {
        this._playerInTurn = this.getNextPlayer(this._playerInTurn);
      }
    }
  }

  sayUno(playerIndex: number): void {
    if (this.ended) throw new Error('Round has ended');
    if (playerIndex < 0 || playerIndex >= this.players.length) {
      throw new Error('Player index out of bounds');
    }
    this.unoSaid.add(playerIndex);
  }

  catchUnoFailure(params: { accuser: number; accused: number }): boolean {
    if (params.accused < 0 || params.accused >= this.players.length) {
      throw new Error('Accused player index out of bounds');
    }
    
    if (this.lastPlayedPlayer !== params.accused) return false;
    if (this.hands[params.accused].length !== 1) return false;
    
    // Check if it's still the accusation window (before next player acts)
    const nextPlayer = this.getNextPlayer(params.accused);
    if (this._playerInTurn !== nextPlayer) return false;
    
    // Check if UNO was said before OR after playing (before next action)
    if (this.unoSaid.has(params.accused)) return false;
    
    // Add 4 cards as penalty and clear the catch window
    this.drawCardsForPlayer(params.accused, 4);
    // After catching, prevent re-catching
    this.unoSaid.add(params.accused);
    return true;
  }

  hasEnded(): boolean {
    return this.ended;
  }

  winner(): number | undefined {
    if (!this.ended) return undefined;
    return this.lastPlayedPlayer;
  }

  score(): number | undefined {
    if (!this.ended) return undefined;
    
    let total = 0;
    for (let i = 0; i < this.players.length; i++) {
      if (i === this.lastPlayedPlayer) continue;
      for (const card of this.hands[i]) {
        if (card.type === 'NUMBERED') {
          total += card.number;
        } else if (card.type === 'WILD CARD' || card.type === 'WILD DRAW') {
          total += 50;
        } else {
          total += 20;
        }
      }
    }
    return total;
  }

  onEnd(callback: (event: { winner: number }) => void): void {
    this.endCallbacks.push(callback);
  }

  toMemento(): RoundMemento {
    return {
      players: this.players,
      hands: this.hands.map(hand => hand.map(card => ({ ...card }))),
      drawPile: this._drawPile.toMemento(),
      discardPile: this._discardPile.toMemento(),
      currentColor: this.currentColor,
      currentDirection: this.currentDirection,
      dealer: this._dealer,
      playerInTurn: this._playerInTurn
    };
  }

  static fromMemento(memento: RoundMemento, shuffler: Shuffler<Card> = standardShuffler): Round {
    if (memento.players.length < 2) throw new Error('At least 2 players required');
    if (memento.players.length !== memento.hands.length) throw new Error('Mismatched players and hands');
    if (memento.discardPile.length === 0) throw new Error('Empty discard pile');
    if (memento.dealer < 0 || memento.dealer >= memento.players.length) throw new Error('Invalid dealer');
    
    const emptyHands = memento.hands.filter(h => h.length === 0).length;
    if (emptyHands > 1) throw new Error('Multiple winners');
    if (emptyHands === 0 && memento.playerInTurn === undefined) throw new Error('Missing playerInTurn');
    if (memento.playerInTurn !== undefined && (memento.playerInTurn < 0 || memento.playerInTurn >= memento.players.length)) {
      throw new Error('Invalid playerInTurn');
    }
    
    if (!colors.includes(memento.currentColor as Color)) throw new Error('Invalid currentColor');
    
    const topCard = memento.discardPile[0];
    if ('color' in topCard && topCard.color !== memento.currentColor) {
      if (topCard.type !== 'WILD CARD' && topCard.type !== 'WILD DRAW' && topCard.type !== 'WILD') {
        throw new Error('Inconsistent currentColor');
      }
    }
    
    const round = Object.create(Round.prototype);
    round.players = memento.players;
    round.hands = memento.hands.map(hand => 
      hand.map(c => Deck.fromMemento([c]).deal()!)
    );
    round._drawPile = Deck.fromMemento(memento.drawPile);
    round._discardPile = Deck.fromMemento(memento.discardPile);
    round.currentColor = memento.currentColor as Color;
    round.currentDirection = memento.currentDirection;
    round._dealer = memento.dealer;
    round._playerInTurn = memento.playerInTurn;
    round.shuffler = shuffler;
    round.unoSaid = new Set();
    round.ended = emptyHands === 1;
    round.endCallbacks = [];
    round.lastPlayedPlayer = emptyHands === 1 ? memento.hands.findIndex(h => h.length === 0) : undefined;
    
    return round;
  }

  private getNextPlayer(current: number): number {
    if (this.currentDirection === 'clockwise') {
      return (current + 1) % this.players.length;
    } else {
      return current === 0 ? this.players.length - 1 : current - 1;
    }
  }

  private drawCard(): Card | undefined {
    let card = this._drawPile.deal();
    
    if (!card && this._discardPile.size > 1) {
      const discardMem = this._discardPile.toMemento();
      const topCard = discardMem.shift()!;
      
      // Create new draw pile from remaining discard cards
      const cardsToShuffle = discardMem.map(c => Deck.fromMemento([c]).deal()!);
      this.shuffler(cardsToShuffle);
      this._drawPile = new Deck(cardsToShuffle);
      this._discardPile = Deck.fromMemento([topCard]);
      
      card = this._drawPile.deal();
    }
    
    return card;
  }

  private drawCardsForPlayer(playerIndex: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      if (card) {
        this.hands[playerIndex].push(card);
      }
    }
  }
}