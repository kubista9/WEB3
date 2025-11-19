import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Player {
    id: ID!
    username: String!
  }

  type GameCard {
    type: String!
    color: String
    number: Int
  }

  type PlayerHand {
    playerId: ID!
    username: String!
    cardCount: Int!
    hand: [GameCard!]!
  }

  type PlayerInfo {
    id: ID!
    username: String!
  }

  type Score {
    playerId: ID!
    username: String!
    score: Int!
  }

  type PendingGame {
    id: ID!
    creatorId: ID!
    creatorUsername: String!
    players: [Player!]!
    maxPlayers: Int!
    createdAt: String!
  }

  type ActiveGame {
    id: ID!
    players: [PlayerInfo!]!
    currentPlayerIndex: Int!
    currentPlayer: PlayerInfo!
    dealer: PlayerInfo!
    direction: Int!
    discardPile: [GameCard!]!
    drawPileSize: Int!
    playerHands: [PlayerHand!]!
    gameStatus: String!
    hasEnded: Boolean!
    winner: PlayerInfo
    createdAt: String!
    updatedAt: String!
  }

  type RoundResult {
    winnerId: String!
    winnerUsername: String!
    score: Int!
  }

  type GameHistory {
    id: ID!
    gameId: ID!
    players: [PlayerInfo!]!
    winnerId: String!
    scores: [Score!]!
    completedAt: String!
  }

  type Query {
    me: Player
    pendingGames: [PendingGame!]!
    pendingGame(id: ID!): PendingGame
    activeGame(id: ID!): ActiveGame
    playerGames: [PendingGame!]!
  }

  input JoinGameInput {
    gameId: ID!
  }

  input StartGameInput {
    gameId: ID!
  }

  input PlayCardInput {
    gameId: ID!
    cardIndex: Int!
    saidUno: Boolean!
    chosenColor: String
  }

  input CreateGameInput {
    maxPlayers: Int!
  }

  input CatchUnoInput {
    gameId: ID!
    accuser: Int!
    accused: Int!
  }

  type Mutation {
    createGame(input: CreateGameInput!): PendingGame!
    joinGame(input: JoinGameInput!): PendingGame!
    startGame(input: StartGameInput!): ActiveGame!
    playCard(input: PlayCardInput!): ActiveGame!
    drawCard(gameId: ID!): ActiveGame!
    callUno(gameId: ID!, playerIndex: Int!): ActiveGame!
    catchUnoFailure(input: CatchUnoInput!): ActiveGame!
    leaveGame(gameId: ID!): Boolean!
  }

  type Subscription {
    gameUpdated(gameId: ID!): ActiveGame!
    pendingGameUpdated(gameId: ID!): PendingGame!
    gameFinished(gameId: ID!): RoundResult!
  }

    type AuthPayload {
    token: String!
    user: Player!
  }

  extend type Mutation {
    register(username: String!, password: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
  }
`;