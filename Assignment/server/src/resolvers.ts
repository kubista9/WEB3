import { IResolvers } from '@graphql-tools/utils'
import { PendingGame, ActiveGame, Move, UserModel, Player } from './models'
import { pubsub } from './server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const GAME_UPDATED = 'GAME_UPDATED'
const PENDING_GAME_UPDATED = 'PENDING_GAME_UPDATED'
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'

export const resolvers: IResolvers = {
  // QUERIES
  Query: {
    pendingGames: async () => {
      try {
        return await PendingGame.find().sort({ createdAt: -1 })
      } catch (err) {
        console.error('Error fetching pending games:', err)
        throw new Error('Failed to fetch pending games')
      }
    },

    activeGame: async (_: any, { id }: { id: string }) => {
      try {
        const game = await ActiveGame.findById(id)
        if (!game) throw new Error('Game not found')
        return game
      } catch (err) {
        console.error('Error fetching active game:', err)
        throw new Error('Failed to fetch active game')
      }
    },
  },

  // MUTATIONS
  Mutation: {
    createGame: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Authentication required')
      try {
        const newGame = new PendingGame({
          creatorId: context.userId,
          creatorUsername: context.userId,
          players: [{ username: context.userId }],
          maxPlayers: input.maxPlayers,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        })
        await newGame.save()
        await pubsub.publish(PENDING_GAME_UPDATED, { pendingGameUpdated: newGame })
        return newGame
      } catch (err) {
        console.error('Error creating game:', err)
        throw new Error('Failed to create game')
      }
    },

    joinGame: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Authentication required')
      try {
        const game = await PendingGame.findById(input.gameId)
        if (!game) throw new Error('Game not found')

        const alreadyJoined = game.players.some(p => p.username === context.userId)
        if (alreadyJoined) return game

        if (game.players.length >= game.maxPlayers) {
          throw new Error('Game is full')
        }

        game.players.push({ username: context.userId })
        await game.save()

        await pubsub.publish(PENDING_GAME_UPDATED, { pendingGameUpdated: game })
        return game
      } catch (err) {
        console.error('Error joining game:', err)
        throw new Error('Failed to join game')
      }
    },

    startGame: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Authentication required')

      const pendingGame = await PendingGame.findById(input.gameId)
      if (!pendingGame) throw new Error('Pending game not found')

      if (pendingGame.creatorUsername !== context.userId) {
        throw new Error('Only the host can start the game')
      }

      const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW']
      const deck: { color: string; value: string }[] = []

      for (const color of colors) {
        for (let n = 0; n <= 9; n++) deck.push({ color, value: n.toString() })
      }

      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[deck[i], deck[j]] = [deck[j], deck[i]]
      }

      const playerHands = pendingGame.players.map(p => {
        const hand = deck.splice(0, 7)
        return { playerId: p.username, username: p.username, hand }
      })

      const discardPile = [deck.shift()!]
      const drawPile = deck

      const activeGame = new ActiveGame({
        players: pendingGame.players,
        currentPlayerIndex: 0,
        direction: 1,
        discardPile,
        drawPile,
        playerHands,
        gameStatus: 'active',
        gameMemento: {},
        pendingGameId: pendingGame._id,
        moves: [],
      })

      await activeGame.save()
      await PendingGame.findByIdAndDelete(input.gameId)
      await pubsub.publish(GAME_UPDATED, { gameUpdated: activeGame })
      await pubsub.publish(PENDING_GAME_UPDATED, { pendingGameUpdated: null })
      return activeGame
    },

    playCard: async (_: any, { input }: any, context: any) => {
      if (!context.userId) throw new Error('Authentication required')
      const { gameId, cardIndex, chosenColor } = input

      const game = await ActiveGame.findById(gameId)
      if (!game) throw new Error('Game not found')

      const playerHand = game.playerHands.find(
        (p: any) => p.username === context.userId
      )
      if (!playerHand) throw new Error('Player not found in this game')

      if (cardIndex < 0 || cardIndex >= playerHand.hand.length)
        throw new Error('Invalid card index')

      const playedCard = playerHand.hand.splice(cardIndex, 1)[0]

      if (playedCard.value === 'WILD' || playedCard.value === 'WILD_DRAW_FOUR') {
        playedCard.color = chosenColor || 'RED'
      }

      game.discardPile.unshift(playedCard)
      game.currentPlayerIndex =
        (game.currentPlayerIndex + game.direction + game.players.length) %
        game.players.length

      await game.save()
      await pubsub.publish(GAME_UPDATED, { gameUpdated: game })
      return game
    },

    drawCard: async (_: any, { gameId }: any, context: any) => {
      if (!context.userId) throw new Error('Authentication required')
      const game = await ActiveGame.findById(gameId)
      if (!game) throw new Error('Game not found')

      const playerHand = game.playerHands.find(
        (p: any) => p.username === context.userId
      )
      if (playerHand) {
        playerHand.hand.push({ color: 'BLUE', value: 'NUMBER' })
      }

      game.currentPlayerIndex =
        (game.currentPlayerIndex + game.direction + game.players.length) %
        game.players.length

      await game.save()
      await pubsub.publish(GAME_UPDATED, { gameUpdated: game })
      return game
    },

    leaveGame: async (_: any, { gameId }: any, context: any) => {
      if (!context.userId) throw new Error('Authentication required')

      const game = await PendingGame.findById(gameId)
      if (!game) throw new Error('Game not found')

      game.players = game.players.filter(p => p.username !== context.userId)

      if (game.players.length === 0) {
        await game.deleteOne()
      } else {
        await game.save()
      }

      await pubsub.publish(PENDING_GAME_UPDATED, { pendingGameUpdated: game })
      return true
    },

    register: async (_: any, { username, password }: any) => {
      try {
        const existingUser = await UserModel.findOne({ username })
        if (existingUser) throw new Error('Username already taken')
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new UserModel({ username, password: hashedPassword })
        await user.save()
        const player = new Player({ username })
        await player.save()
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
        return { token, user: { id: user._id, username: user.username } }
      } catch (err) {
        console.error('Register error:', err)
        throw new Error('Registration failed')
      }
    },

    login: async (_: any, { username, password }: any) => {
      try {
        const user = await UserModel.findOne({ username })
        if (!user) throw new Error('User not found')

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error('Invalid password')

        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' })
        return { token, user: { id: user._id, username: user.username } }
      } catch (err) {
        console.error('Login error:', err)
        throw new Error('Login failed')
      }
    },
  },

  // SUBSCRIPTIONS
  Subscription: {
    gameUpdated: {
      subscribe: (_: any, { gameId }: { gameId: string }) => {
        const asyncIterator = pubsub.asyncIterator<{ gameUpdated: any }>(GAME_UPDATED)

        return {
          async next() {
            while (true) {
              const { value, done } = await asyncIterator.next()
              if (done) return { value, done }

              const updatedGame = value?.gameUpdated
              if (updatedGame && updatedGame._id?.toString() === gameId) {
                return { value, done: false }
              }
            }
          },
          return() {
            return asyncIterator.return
              ? asyncIterator.return()
              : Promise.resolve({ done: true, value: undefined })
          },
          throw(error: any) {
            return asyncIterator.throw
              ? asyncIterator.throw(error)
              : Promise.reject(error)
          },
          [Symbol.asyncIterator]() {
            return this
          },
        }
      },
    },
    pendingGameUpdated: {
      subscribe: (_: any) => pubsub.asyncIterator(PENDING_GAME_UPDATED),
    },
  },

  ActiveGame: {
    id: (game: any) => game._id?.toString(),
    players: (game: any) =>
      (game.players || []).map((p: any) => ({
        id: p.username,
        username: p.username,
      })),
    currentPlayer: (game: any) => {
      const player = game.players?.[game.currentPlayerIndex]
      return player ? { id: player.username, username: player.username } : null
    },
    discardPile: (game: any) =>
      (game.discardPile || []).map((c: any) => ({
        type: mapCardType(c.value),
        color: c.color,
        number: parseInt(c.value, 10) || null,
      })),
    drawPileSize: (game: any) =>
      Array.isArray(game.drawPile) ? game.drawPile.length : 0,
    playerHands: (game: any) =>
      (game.playerHands || []).map((h: any) => ({
        playerId: h.playerId,
        username: h.username,
        cardCount: Array.isArray(h.hand) ? h.hand.length : 0,
        hand: (h.hand || []).map((c: any) => ({
          type: mapCardType(c.value),
          color: c.color,
          number: parseInt(c.value, 10) || null,
        })),
      })),
  },
}

// HELPER
function mapCardType(value: string): string {
  if (!value) return 'UNKNOWN'
  const num = parseInt(value, 10)
  if (!isNaN(num)) return 'NUMBER'
  const special = ['SKIP', 'REVERSE', 'DRAW TWO', 'WILD', 'WILD DRAW']
  return special.includes(value.toUpperCase()) ? value.toUpperCase() : 'OTHER'
}