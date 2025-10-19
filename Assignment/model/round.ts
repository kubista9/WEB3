import { Card, Color, Direction, RoundMemento, colors } from './interfaces'
import { Deck } from './deck'
import { Shuffler, standardShuffler } from '../utils/random_utils'

export class Round {
  private players: string[]
  private hands: Card[][]
  private _drawPile: Deck
  private _discardPile: Deck
  private currentColor: Color
  private currentDirection: Direction
  private _dealer: number
  private _playerInTurn: number | undefined
  private shuffler: Shuffler<Card>
  private unoSaid: Set<number> = new Set()
  private unoTimestamps: Map<number, number> = new Map()
  private actionCounter = 0
  private lastPlayedPlayer: number | undefined
  private ended: boolean = false
  private endCallbacks: Array<(event: { winner: number }) => void> = []

  constructor(
    players: string[],
    dealer: number,
    shuffler: Shuffler<Card> = standardShuffler,
    cardsPerPlayer: number = 7
  ) {
    if (players.length < 2) throw new Error('At least 2 players required')
    if (players.length > 10) throw new Error('Maximum 10 players')

    this.players = players
    this._dealer = dealer
    this.shuffler = shuffler

    const deck = new Deck()
    deck.startTheGame()
    deck.shuffle(this.shuffler)

    this.hands = this.players.map(() => [])
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (let p = 0; p < this.players.length; p++) {
        const card = deck.deal()
        if (card) this.hands[p].push(card)
      }
    }

    // Set up discard pile - reshuffle if wild on top
    let topCard = deck.deal()
    while (topCard && (topCard.type === 'WILD CARD' || topCard.type === 'WILD DRAW')) {
      const newDeck = new Deck()
      newDeck.startTheGame()
      newDeck.shuffle(this.shuffler)
      this.hands = this.players.map(() => [])
      for (let i = 0; i < cardsPerPlayer; i++) {
        for (let p = 0; p < this.players.length; p++) {
          const card = newDeck.deal()
          if (card) this.hands[p].push(card)
        }
      }
      topCard = newDeck.deal()
      this._drawPile = newDeck
    }

    if (!topCard) throw new Error('Failed to initialize discard pile')

    this._discardPile = new Deck([topCard])
    this._drawPile = deck

    this.currentColor = 'color' in topCard ? topCard.color : 'BLUE'
    this.currentDirection = 'clockwise'

    let firstPlayer = (this._dealer + 1) % this.players.length
    if (topCard.type === 'REVERSE') {
      this.currentDirection = 'counterclockwise'
      firstPlayer = this._dealer === 0 ? this.players.length - 1 : this._dealer - 1
    } else if (topCard.type === 'SKIP') {
      firstPlayer = (this._dealer + 2) % this.players.length
    } else if (topCard.type === 'DRAW CARD') {
      const targetPlayer = (this._dealer + 1) % this.players.length
      this.drawCardsForPlayer(targetPlayer, 2)
      firstPlayer = (this._dealer + 2) % this.players.length
    }

    this._playerInTurn = firstPlayer
  }

  get playerCount(): number {
    return this.players.length
  }
  get dealer(): number {
    return this._dealer
  }
  player(index: number): string {
    if (index < 0 || index >= this.players.length) throw new Error('Player index out of bounds')
    return this.players[index]
  }
  playerHand(index: number): readonly Card[] {
    return this.hands[index]
  }
  playerInTurn(): number | undefined {
    return this._playerInTurn
  }
  drawPile(): Deck {
    return this._drawPile
  }
  discardPile(): Deck {
    return this._discardPile
  }

  canPlay(cardIndex: number): boolean {
    if (cardIndex < 0 || this._playerInTurn === undefined) return false
    const hand = this.hands[this._playerInTurn]
    if (cardIndex >= hand.length) return false

    const card = hand[cardIndex]
    const topCard = this._discardPile.top()
    if (card.type === 'WILD CARD') return true
    if (card.type === 'WILD DRAW')
      return !hand.some(c => 'color' in c && c.color === this.currentColor)

    if ('color' in card) {
      if (card.color === this.currentColor) return true
      if (card.type === 'NUMBERED' && topCard.type === 'NUMBERED' && card.number === topCard.number)
        return true
      if (card.type === topCard.type && card.type !== 'NUMBERED') return true
    }
    return false
  }

  canPlayAny(): boolean {
    if (this._playerInTurn === undefined) return false
    const hand = this.hands[this._playerInTurn]
    return hand.some((_, i) => this.canPlay(i))
  }

  play(cardIndex: number, chosenColor?: Color): Card {
    if (this.ended) throw new Error('Round has ended')
    if (this._playerInTurn === undefined) throw new Error('No player in turn')
    if (!this.canPlay(cardIndex)) throw new Error('Illegal play')

    this.actionCounter++

    const hand = this.hands[this._playerInTurn]
    const card = hand[cardIndex]

    if (card.type === 'WILD CARD' || card.type === 'WILD DRAW') {
      if (!chosenColor) throw new Error('Must choose a color for wild card')
    } else if (chosenColor) {
      throw new Error('Cannot choose color for non-wild card')
    }

    hand.splice(cardIndex, 1)

    const discardMem = this._discardPile.toMemento()
    discardMem.unshift({ ...card })
    this._discardPile = Deck.fromMemento(discardMem)

    if (chosenColor) this.currentColor = chosenColor
    else if ('color' in card) this.currentColor = card.color

    this.lastPlayedPlayer = this._playerInTurn

    // --- handle special before ending ---
    let nextPlayer = this.getNextPlayer(this._playerInTurn)
    if (card.type === 'SKIP') {
      nextPlayer = this.getNextPlayer(nextPlayer)
    } else if (card.type === 'REVERSE') {
      if (this.players.length === 2) {
        nextPlayer = this._playerInTurn
      } else {
        this.currentDirection =
          this.currentDirection === 'clockwise' ? 'counterclockwise' : 'clockwise'
        nextPlayer = this.getNextPlayer(this._playerInTurn)
      }
    } else if (card.type === 'DRAW CARD') {
      this.drawCardsForPlayer(nextPlayer, 2)
      nextPlayer = this.getNextPlayer(nextPlayer)
    } else if (card.type === 'WILD DRAW') {
      this.drawCardsForPlayer(nextPlayer, 4)
      nextPlayer = this.getNextPlayer(nextPlayer)
    }

    // --- check winner AFTER effects ---
    if (hand.length === 0) {
      this.ended = true
      this._playerInTurn = undefined
      this.endCallbacks.forEach(cb => cb({ winner: this.lastPlayedPlayer! }))
      return card
    }

    this._playerInTurn = nextPlayer
    return card
  }

  draw(): void {
    if (this.ended) throw new Error('Round has ended')
    if (this._playerInTurn === undefined) throw new Error('No player in turn')

    this.actionCounter++

    const card = this.drawCard()
    if (card) {
      this.hands[this._playerInTurn].push(card)
      const cardIndex = this.hands[this._playerInTurn].length - 1
      if (!this.canPlay(cardIndex)) this._playerInTurn = this.getNextPlayer(this._playerInTurn)
    }
  }

  sayUno(playerIndex: number): void {
    if (this.ended) throw new Error('Round has ended')
    if (playerIndex < 0 || playerIndex >= this.players.length)
      throw new Error('Player index out of bounds')

    this.unoSaid.add(playerIndex)
    this.unoTimestamps.set(playerIndex, this.actionCounter)
  }

  catchUnoFailure(params: { accuser: number; accused: number }): boolean {
    const { accuser, accused } = params
    if (accused < 0 || accused >= this.players.length)
      throw new Error('Accused player index out of bounds')
    if (accuser < 0 || accuser >= this.players.length)
      throw new Error('Accuser index out of bounds')

    if (this.lastPlayedPlayer !== accused) return false
    if (this.hands[accused].length !== 1) return false

    const nextPlayer = this.getNextPlayer(accused)
    if (this._playerInTurn !== nextPlayer) return false

    const unoTime = this.unoTimestamps.get(accused)
    if (unoTime !== undefined && unoTime >= this.actionCounter) return false

    if (this.unoSaid.has(accused) && !this.unoTimestamps.has(accused)) return false

    this.drawCardsForPlayer(accused, 4)
    this.unoSaid.add(accused)
    this.unoTimestamps.delete(accused)
    return true
  }

  hasEnded(): boolean {
    return this.ended
  }

  winner(): number | undefined {
    return this.ended ? this.lastPlayedPlayer : undefined
  }

  score(): number | undefined {
    if (!this.ended) return undefined
    let total = 0
    for (let i = 0; i < this.players.length; i++) {
      if (i === this.lastPlayedPlayer) continue
      for (const card of this.hands[i]) {
        if (card.type === 'NUMBERED') total += card.number
        else if (card.type === 'WILD CARD' || card.type === 'WILD DRAW') total += 50
        else total += 20
      }
    }
    return total
  }

  onEnd(callback: (event: { winner: number }) => void): void {
    this.endCallbacks.push(callback)
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
      playerInTurn: this._playerInTurn,
    }
  }

  static fromMemento(m: RoundMemento, shuffler: Shuffler<Card> = standardShuffler): Round {
    if (m.players.length < 2) throw new Error('At least 2 players required')
    if (m.players.length !== m.hands.length) throw new Error('Mismatched players and hands')
    if (m.discardPile.length === 0) throw new Error('Empty discard pile')
    if (m.dealer < 0 || m.dealer >= m.players.length) throw new Error('Invalid dealer')

    const emptyHands = m.hands.filter(h => h.length === 0).length
    if (emptyHands > 1) throw new Error('Multiple winners')
    if (emptyHands === 0 && m.playerInTurn === undefined)
      throw new Error('Missing playerInTurn')
    if (
      m.playerInTurn !== undefined &&
      (m.playerInTurn < 0 || m.playerInTurn >= m.players.length)
    )
      throw new Error('Invalid playerInTurn')

    if (!colors.includes(m.currentColor as Color)) throw new Error('Invalid currentColor')

    const topCard = m.discardPile[0]
    if ('color' in topCard && topCard.color !== m.currentColor) {
      if (topCard.type !== 'WILD CARD' && topCard.type !== 'WILD DRAW' && topCard.type !== 'WILD')
        throw new Error('Inconsistent currentColor')
    }

    const round = Object.create(Round.prototype)
    round.players = m.players
    round.hands = m.hands.map(hand => hand.map(c => Deck.fromMemento([c]).deal()!))
    round._drawPile = Deck.fromMemento(m.drawPile)
    round._discardPile = Deck.fromMemento(m.discardPile)
    round.currentColor = m.currentColor as Color
    round.currentDirection = m.currentDirection
    round._dealer = m.dealer
    round._playerInTurn = m.playerInTurn
    round.shuffler = shuffler
    round.unoSaid = new Set()
    round.unoTimestamps = new Map()
    round.actionCounter = 0
    round.ended = emptyHands === 1
    round.endCallbacks = []
    round.lastPlayedPlayer =
      emptyHands === 1 ? m.hands.findIndex(h => h.length === 0) : undefined
    return round
  }

  getNextPlayer(current: number): number {
    return this.currentDirection === 'clockwise'
      ? (current + 1) % this.players.length
      : current === 0
        ? this.players.length - 1
        : current - 1
  }

  drawCard(): Card | undefined {
    let card = this._drawPile.deal()
    if (!card && this._discardPile.size > 1) {
      const discardMem = this._discardPile.toMemento()
      const topCard = discardMem.shift()!
      const cardsToShuffle = discardMem.map(c => Deck.fromMemento([c]).deal()!)
      this.shuffler(cardsToShuffle)
      this._drawPile = new Deck(cardsToShuffle)
      this._discardPile = Deck.fromMemento([topCard])
      card = this._drawPile.deal()
    }
    return card
  }

  drawCardsForPlayer(playerIndex: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const card = this.drawCard()
      if (card) this.hands[playerIndex].push(card)
    }
  }
}
