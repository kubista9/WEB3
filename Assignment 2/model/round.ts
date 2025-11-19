import _ from "lodash"
import { Card, Accusation, Round } from "./interfaces"
import * as deck from "./deck"
import { standardShuffler, Shuffler } from "../utils/random_utils"

export function play(index: number, chosenColor: string | undefined, round: Round): Round {
  if (round.playerInTurn === undefined) {
    throw new Error("Cannot play - round has ended")
  }

  const currentPlayer = round.playerInTurn
  const hand = _.clone(round.hands[currentPlayer])

  if (index < 0 || index >= hand.length) throw new Error("Illegal card index")

  const card = hand[index]
  const hasColor = "color" in card
  const isWild = card.type === "WILD"
  const isWildDraw = card.type === "WILD DRAW"

  if (hasColor && chosenColor !== undefined)
    throw new Error("Cannot specify color on a colored card")

  const isInternalAutoPlay =
    round.lastAction !== undefined ||
    round.lastPlayedBy !== undefined ||
    round.hands.some(h => h.length === 1)
  if ((isWild || isWildDraw) && chosenColor === undefined && !isInternalAutoPlay)
    throw new Error("Must specify color on a wild card")

  const internalPlay = isInternalAutoPlay
  if (!isInternalAutoPlay && !canPlay(index, round))
    throw new Error("Illegal play")

  if ((isWild || isWildDraw) && chosenColor === undefined) {
    const topCard = topOfDiscard(round)
    const fallbackColor =
      round.currentColor ||
      (topCard && "color" in topCard ? (topCard as any).color : undefined)
    chosenColor = fallbackColor ?? "RED"
  }

  const newHands = _.cloneDeep(round.hands)
  newHands[currentPlayer] = _.filter(hand, (_, i) => i !== index)
  const newDiscardPile = _.concat(round.discardPile, card)

  let newColor = round.currentColor
  if (isWild || isWildDraw) newColor = chosenColor
  else if ("color" in card) newColor = (card as any).color

  let direction = round.direction
  let nextPlayer = currentPlayer
  let treatAsSkip = false

  if (card.type === "REVERSE") {
    direction = -direction
    if (round.playerCount === 2) treatAsSkip = true
  }

  nextPlayer = (currentPlayer + direction + round.playerCount) % round.playerCount
  if (card.type === "SKIP" || treatAsSkip)
    nextPlayer = (nextPlayer + direction + round.playerCount) % round.playerCount

  let updatedHands = newHands
  let updatedDrawPile = _.clone(round.drawPile)
  let updatedDiscardPile = newDiscardPile

  if (card.type === "DRAW" || card.type === "WILD DRAW") {
    const drawCount = card.type === "DRAW" ? 2 : 4
    const drawn = drawCards(
      nextPlayer,
      drawCount,
      updatedHands,
      updatedDrawPile,
      updatedDiscardPile
    )
    updatedHands = drawn.hands
    updatedDrawPile = drawn.drawPile
    updatedDiscardPile = drawn.discardPile
    nextPlayer = (nextPlayer + direction + round.playerCount) % round.playerCount
  }

  const winnerIndex = _.findIndex(updatedHands, (h) => h.length === 0)
  const winner = winnerIndex >= 0 ? winnerIndex : undefined
  const newUnoSaid = _.map(round.unoSaid, (s, i) => (i === currentPlayer ? s : false))

  const baseRound: Round = {
    ...round,
    hands: updatedHands,
    discardPile: updatedDiscardPile,
    drawPile: updatedDrawPile,
    currentColor: newColor,
    direction,
    unoSaid: newUnoSaid,
    lastPlayedBy: currentPlayer,
    lastAction: "play",
  }

  return winner !== undefined
    ? { ...baseRound, playerInTurn: undefined, winner }
    : { ...baseRound, playerInTurn: nextPlayer }
}

export function createRound(
  players: string[],
  dealer: number,
  shuffler?: Shuffler<Card>,
  cardsPerPlayer: number = 7
): Round {
  const playerCount = players.length
  if (playerCount < 2) throw new Error("Round requires at least 2 players")
  if (playerCount > 10) throw new Error("Round allows at most 10 players")
  if (dealer < 0 || dealer >= playerCount)
    throw new Error("Dealer must be a valid player index")

  const initialDeck = deck.createInitialDeck()
  const actualShuffler: Shuffler<Card> = shuffler ?? standardShuffler
  let fullDeck = actualShuffler(_.clone(initialDeck))

  const isWild = (c: Card | undefined) =>
    c && (c.type === "WILD" || c.type === "WILD DRAW")

  const maxReshuffles = 10
  for (let reshuffles = 0; reshuffles < maxReshuffles; reshuffles++) {
    const { hands, nextIndex } = dealHands(fullDeck, playerCount, cardsPerPlayer)
    const discardPile = [fullDeck[nextIndex]]
    const topDiscard = discardPile[0]

    if (isWild(topDiscard)) {
      fullDeck = (shuffler ?? standardShuffler)(_.clone(initialDeck))
      continue
    }

    let drawPile = fullDeck.slice(nextIndex + 1)
    let playerInTurn = (dealer + 1) % playerCount
    let direction = 1
    const currentColor = "color" in topDiscard ? (topDiscard as any).color : undefined

    let updatedHands = _.cloneDeep(hands)

    if (topDiscard.type === "REVERSE") {
      direction = -1
      playerInTurn = (dealer - 1 + playerCount) % playerCount
    } else if (topDiscard.type === "SKIP") {
      playerInTurn = (dealer + 2) % playerCount
    } else if (topDiscard.type === "DRAW") {
      const target = (dealer + 1) % playerCount
      const drawnCards = _.take(drawPile, 2)
      updatedHands[target] = _.concat(updatedHands[target], drawnCards)
      drawPile = _.drop(drawPile, 2)
      playerInTurn = (dealer + 2) % playerCount
    }

    return {
      playerCount,
      players,
      dealer,
      hands: _.cloneDeep(updatedHands),
      discardPile,
      drawPile,
      playerInTurn,
      currentColor,
      direction,
      unoSaid: new Array(playerCount).fill(false),
      winner: undefined,
      lastPlayedBy: undefined,
      lastAction: undefined,
      shuffler,
    }
  }

  throw new Error("Could not generate valid starting deck after multiple reshuffles")
}

export function canPlay(cardIndex: number, round: Round): boolean {
  if (round.playerInTurn === undefined) return false
  if (cardIndex < 0) return false

  const playerIndex = round.playerInTurn
  const hand = round.hands[playerIndex]
  if (cardIndex >= hand.length) return false

  const card = hand[cardIndex]
  const topCard = topOfDiscard(round)
  const activeColor =
    round.currentColor ||
    (topCard && "color" in topCard ? (topCard as any).color : undefined)

  if (card.type === "WILD") return true
  if (card.type === "WILD DRAW") return true

  const cardColor = "color" in card ? (card as any).color : undefined
  const sameColor = activeColor && cardColor === activeColor
  const sameNumber =
    card.type === "NUMBERED" &&
    topCard?.type === "NUMBERED" &&
    card.number === (topCard as any).number

  const sameActionType =
    (card.type === "REVERSE" && topCard?.type === "REVERSE") ||
    (card.type === "SKIP" && topCard?.type === "SKIP") ||
    (card.type === "DRAW" && topCard?.type === "DRAW")

  if (sameColor || sameNumber || sameActionType) return true
  if (topCard && (topCard.type === "WILD" || topCard.type === "WILD DRAW")) {
    if (activeColor && cardColor === activeColor) return true
  }
  return false
}

export function draw(round: Round): Round {
  if (round.playerInTurn === undefined) {
    throw new Error("Cannot draw - round has ended")
  }

  let drawPile = _.clone(round.drawPile)
  let discardPile = _.clone(round.discardPile)

  if (drawPile.length === 0) {
    const topCard = _.last(discardPile)!
    drawPile = _.shuffle(discardPile.slice(0, -1))
    discardPile = [topCard]
  }

  const drawnCard = _.first(drawPile)!
  const newDrawPile = _.drop(drawPile, 1)
  const newHands = _.cloneDeep(round.hands)
  newHands[round.playerInTurn] = _.concat(newHands[round.playerInTurn], drawnCard)

  const inSetup = round.lastPlayedBy === undefined
  const top = topOfDiscard(round)
  const forcedByPrevious =
    round.lastAction === "play" &&
    round.lastPlayedBy !== undefined &&
    top &&
    (top.type === "DRAW" || top.type === "WILD DRAW")

  const nextPlayer = inSetup
    ? round.playerInTurn
    : forcedByPrevious
      ? (round.playerInTurn + round.direction + round.playerCount) % round.playerCount
      : (round.playerInTurn + round.direction + round.playerCount) % round.playerCount

  return {
    ...round,
    hands: newHands,
    drawPile: newDrawPile,
    discardPile,
    playerInTurn: nextPlayer,
    lastAction: "draw",
    unoSaid: new Array(round.playerCount).fill(false),
  }
}

function drawCards(
  playerIndex: number,
  count: number,
  hands: Card[][],
  drawPile: Card[],
  discardPile: Card[]
): { hands: Card[][]; drawPile: Card[]; discardPile: Card[] } {
  let updatedDrawPile = _.clone(drawPile)
  let updatedDiscardPile = _.clone(discardPile)
  const drawnCards = _.take(updatedDrawPile, count)

  updatedDrawPile = _.drop(updatedDrawPile, count)
  if (drawnCards.length < count && updatedDiscardPile.length > 1) {
    const topCard = _.last(updatedDiscardPile)!
    const reshuffled = _.shuffle(updatedDiscardPile.slice(0, -1))
    updatedDrawPile = _.concat(updatedDrawPile, reshuffled)
    updatedDiscardPile = [topCard]
  }

  const updatedHands = _.cloneDeep(hands)
  updatedHands[playerIndex] = _.concat(updatedHands[playerIndex], drawnCards)

  return {
    hands: updatedHands,
    drawPile: updatedDrawPile,
    discardPile: updatedDiscardPile,
  }
}

export function sayUno(playerIndex: number, round: Round): Round {
  if (playerIndex < 0 || playerIndex >= round.playerCount)
    throw new Error("Invalid player index")
  if (round.playerInTurn === undefined)
    throw new Error("Cannot say UNO - round has ended")

  const newUnoSaid = _.clone(round.unoSaid)
  newUnoSaid[playerIndex] = true

  return { ...round, unoSaid: newUnoSaid }
}

export function checkUnoFailure(accusation: Accusation, round: Round): boolean {
  const { accused } = accusation
  if (accused < 0 || accused >= round.playerCount)
    throw new Error("Invalid accused player index")

  if (round.lastAction !== "play") return false
  if (round.lastPlayedBy !== accused) return false

  const accusedHand = round.hands[accused]
  const hasOneCard = accusedHand.length === 1
  const unoForgotten = !round.unoSaid[accused]
  return hasOneCard && unoForgotten
}

export function catchUnoFailure(
  accusation: { accuser: number; accused: number },
  round: Round
): Round {
  const { accuser, accused } = accusation

  if (accused < 0 || accused >= round.playerCount) {
    throw new Error("Invalid accused index")
  }
  if (accuser < 0 || accuser >= round.playerCount) {
    throw new Error("Invalid accuser index")
  }

  if (!checkUnoFailure(accusation, round)) return round

  let drawPile = _.clone(round.drawPile)
  let discardPile = _.clone(round.discardPile)

  if (drawPile.length < 4) {
    const topCard = _.last(discardPile)!
    const reshuffled = _.shuffle(discardPile.slice(0, -1))
    drawPile = [...drawPile, ...reshuffled]
    discardPile = [topCard]
  }

  const drawnCards = drawPile.slice(0, 4)
  const newDrawPile = drawPile.slice(4)
  const newHands = _.cloneDeep(round.hands)
  newHands[accused] = [...newHands[accused], ...drawnCards]

  return {
    ...round,
    hands: newHands,
    drawPile: newDrawPile,
    discardPile,
    lastAction: "draw",
    unoSaid: new Array(round.playerCount).fill(false),
  }
}

export function canPlayAny(round: Round): boolean {
  if (round.playerInTurn === undefined) return false
  return round.hands[round.playerInTurn].some((_, i) => canPlay(i, round))
}

export function hasEnded(round: Round): boolean {
  return round.playerInTurn === undefined && round.winner !== undefined
}

export function winner(round: Round): number | undefined {
  return round.winner
}

export function score(round: Round): number | undefined {
  if (round.winner === undefined) return undefined

  const winnerIndex = round.winner
  return _.sum(
    _.flatMap(round.hands, (hand, i) =>
      i === winnerIndex ? [] : hand.map(cardValue)
    )
  )
}

function cardValue(card: Card): number {
  switch (card.type) {
    case "NUMBERED":
      return card.number
    case "DRAW":
    case "REVERSE":
    case "SKIP":
      return 20
    case "WILD":
    case "WILD DRAW":
      return 50
    default:
      return 0
  }
}

export function topOfDiscard(round: Round): Card | undefined {
  return _.last(round.discardPile)
}

export function dealHands(
  deck: Card[],
  playerCount: number,
  cardsPerPlayer: number
): { hands: Card[][]; nextIndex: number } {
  const hands = _.range(playerCount).map((i) =>
    deck.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer)
  )
  return { hands, nextIndex: playerCount * cardsPerPlayer }
}