import { PubSub } from 'apollo-server'
import { v4 as uuidv4 } from 'uuid'
import { Game } from '../model/game'

const pubsub = new PubSub()
const GAME_UPDATED = 'GAME_UPDATED'

const games: Record<string, any> = {}

export const resolvers = {
  Query: {
    games: () => Object.values(games),
    game: (_, { id }) => games[id],
  },
  Mutation: {
    createGame: (_, { playerName }) => {
      const id = uuidv4()
      const game = new Game([playerName], 500)
      games[id] = { id, players: [{ id: uuidv4(), name: playerName }], state: JSON.stringify(game.toMemento()) }
      return games[id]
    },
    joinGame: (_, { gameId, playerName }) => {
      const game = games[gameId]
      if (!game) throw new Error('Game not found')
      game.players.push({ id: uuidv4(), name: playerName })
      pubsub.publish(GAME_UPDATED, { gameUpdated: game })
      return game
    },
    playCard: (_, { gameId, playerId, cardIndex, color }) => {
      const game = games[gameId]
      // Deserialize UNO state
      const uno = Game.fromMemento(JSON.parse(game.state))
      const round = uno.currentRound()
      round?.play(cardIndex, color)
      game.state = JSON.stringify(uno.toMemento())
      pubsub.publish(GAME_UPDATED, { gameUpdated: game })
      return game
    },
    drawCard: (_, { gameId, playerId }) => {
      const game = games[gameId]
      const uno = Game.fromMemento(JSON.parse(game.state))
      const round = uno.currentRound()
      round?.draw()
      game.state = JSON.stringify(uno.toMemento())
      pubsub.publish(GAME_UPDATED, { gameUpdated: game })
      return game
    },
  },
  Subscription: {
    gameUpdated: {
      subscribe: (_, { gameId }) => pubsub.asyncIterator([GAME_UPDATED]),
    },
  },
}
