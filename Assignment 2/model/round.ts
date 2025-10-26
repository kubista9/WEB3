import { Card, Color, Direction, RoundMemento, RoundState } from './interfaces';
import { Deck, createDeck, shuffleDeck, dealCard } from './deck';
import * as _ from 'lodash';

export const createRound = (
  players: string[],
  dealer: number,
  cardsPerPlayer = 7
): RoundState => {
  if (players.length < 2) throw new Error('At least 2 players required');

  let deck = shuffleDeck(createDeck());

  const hands = players.map(() => {
    const [hand, rest] = _.range(cardsPerPlayer).reduce<[Card[], Deck]>(
      ([acc, d]: [Card[], Deck]) => {
        const [card, newDeck] = dealCard(d);
        return card ? [[...acc, card], newDeck] : [acc, newDeck];
      },
      [[], deck]
    );
    deck = rest;
    return Object.freeze(hand);
  });

  // Top discard card
  const [topCard, restDeck] = dealCard(deck);
  if (!topCard) throw new Error('Deck exhausted at setup');

  const discardPile = Object.freeze([topCard]);
  const currentColor = 'color' in topCard ? topCard.color : 'BLUE';
  const currentDirection: Direction = 'clockwise';
  const firstPlayer = (dealer + 1) % players.length;

  return Object.freeze({
    players,
    hands,
    drawPile: restDeck,
    discardPile,
    currentColor,
    currentDirection,
    dealer,
    playerInTurn: firstPlayer,
    ended: false,
  });
};

export const canPlay = (state: RoundState, playerIndex: number, cardIndex: number): boolean => {
  const playerHand = state.hands[playerIndex];
  const card = playerHand[cardIndex];
  const topCard = state.discardPile[0];

  if (!card || !topCard) return false;

  if (card.type === 'WILD CARD' || card.type === 'WILD DRAW') return true;
  if ('color' in card && card.color === state.currentColor) return true;
  if (
    card.type === 'NUMBERED' &&
    topCard.type === 'NUMBERED' &&
    card.number === topCard.number
  )
    return true;
  if (card.type === topCard.type && card.type !== 'NUMBERED') return true;

  return false;
};

export const playCard = (
  state: RoundState,
  playerIndex: number,
  cardIndex: number,
  chosenColor?: Color
): RoundState => {
  if (state.ended) return state;
  if (!canPlay(state, playerIndex, cardIndex)) throw new Error('Illegal play');

  const card = state.hands[playerIndex][cardIndex];
  const newHands = state.hands.map((h, i) =>
    i === playerIndex ? h.filter((_, j) => j !== cardIndex) : h
  );

  const newDiscard = Object.freeze([card, ...state.discardPile]);
  const newColor =
    card.type === 'WILD CARD' || card.type === 'WILD DRAW'
      ? (chosenColor ?? 'BLUE')
      : 'color' in card
        ? card.color
        : state.currentColor;

  const winner =
    newHands[playerIndex].length === 0 ? playerIndex : undefined;
  const ended = winner !== undefined;

  const nextPlayer =
    state.currentDirection === 'clockwise'
      ? (playerIndex + 1) % state.players.length
      : (playerIndex - 1 + state.players.length) % state.players.length;

  return Object.freeze({
    ...state,
    hands: newHands,
    discardPile: newDiscard,
    currentColor: newColor,
    playerInTurn: ended ? -1 : nextPlayer,
    ended,
    winner,
  });
};

export const drawCard = (state: RoundState): RoundState => {
  if (state.ended) return state;

  const [card, newDeck] = dealCard(state.drawPile);
  if (!card) return state; // deck empty

  const hands = state.hands.map((h, i) =>
    i === state.playerInTurn ? Object.freeze([...h, card]) : h
  );

  const nextPlayer =
    state.currentDirection === 'clockwise'
      ? (state.playerInTurn + 1) % state.players.length
      : (state.playerInTurn - 1 + state.players.length) % state.players.length;

  return Object.freeze({
    ...state,
    drawPile: newDeck,
    hands,
    playerInTurn: nextPlayer,
  });
};

export const toMemento = (state: RoundState): RoundMemento => ({
  players: state.players,
  hands: state.hands.map(h => h.map(c => ({ ...c }))),
  drawPile: state.drawPile.map(c => ({ ...c })),
  discardPile: state.discardPile.map(c => ({ ...c })),
  currentColor: state.currentColor,
  currentDirection: state.currentDirection,
  dealer: state.dealer,
  playerInTurn: state.playerInTurn,
});

export const fromMemento = (m: RoundMemento): RoundState =>
  Object.freeze({
    players: m.players,
    hands: m.hands.map(hand =>
      hand.map(c => c as Card)
    ),
    drawPile: m.drawPile.map(c => c as Card),
    discardPile: m.discardPile.map(c => c as Card),
    currentColor: m.currentColor as Color,
    currentDirection: m.currentDirection,
    dealer: m.dealer,
    playerInTurn: m.playerInTurn ?? 0,
    ended: false,
  });