import { gql } from 'apollo-server'

export const typeDefs = gql`
  type Player {
    id: ID!
    name: String!
  }

  type Game {
    id: ID!
    players: [Player!]!
    state: String!
  }

  type Query {
    games: [Game!]!
    game(id: ID!): Game
  }

  type Mutation {
    createGame(playerName: String!): Game!
    joinGame(gameId: ID!, playerName: String!): Game!
    playCard(gameId: ID!, playerId: ID!, cardIndex: Int!, color: String): Game!
    drawCard(gameId: ID!, playerId: ID!): Game!
  }

  type Subscription {
    gameUpdated(gameId: ID!): Game!
  }
`
