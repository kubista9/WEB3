import { apolloClient } from './graphql'
import { gql } from '@apollo/client/core'

const GET_PENDING_GAMES = gql`
  query GetPendingGames {
    pendingGames {
      id
      creatorId
      creatorUsername
      players {
        id
        username
      }
      maxPlayers
      createdAt
    }
  }
`

const CREATE_GAME = gql`
  mutation CreateGame($input: CreateGameInput!) {
    createGame(input: $input) {
      id
      creatorUsername
      players {
        id
        username
      }
      maxPlayers
    }
  }
`

const JOIN_GAME = gql`
  mutation JoinGame($input: JoinGameInput!) {
    joinGame(input: $input) {
      id
      players {
        id
        username
      }
    }
  }
`

const START_GAME = gql`
  mutation StartGame($input: StartGameInput!) {
    startGame(input: $input) {
      id
      players {
        id
        username
      }
      currentPlayerIndex
      discardPile {
        type
        color
        number
      }
      drawPileSize
      playerHands {
        playerId
        username
        cardCount
        hand {
          type
          color
          number
        }
      }
      gameStatus
    }
  }
`

const PENDING_GAME_UPDATED = gql`
  subscription OnPendingGameUpdated {
    pendingGameUpdated {
      id
      creatorUsername
      players {
        username
      }
      maxPlayers
    }
  }
`

export const lobbyService = {
  async getPendingGames() {
    const { data } = await apolloClient.query({
      query: GET_PENDING_GAMES,
      fetchPolicy: 'network-only'
    })
    return data.pendingGames
  },

  async createGame(maxPlayers: number) {
    const { data } = await apolloClient.mutate({
      mutation: CREATE_GAME,
      variables: { input: { maxPlayers } }
    })
    return data.createGame
  },

  async joinGame(gameId: string) {
    const { data } = await apolloClient.mutate({
      mutation: JOIN_GAME,
      variables: { input: { gameId } }
    })
    return data.joinGame
  },

  async startGame(gameId: string) {
    const { data } = await apolloClient.mutate({
      mutation: START_GAME,
      variables: { input: { gameId } }
    })
    return data.startGame
  },

  subscribeToPendingGames(callback: (game: any | null) => void) {
    return apolloClient
      .subscribe({ query: PENDING_GAME_UPDATED })
      .subscribe({
        next: ({ data }: any) => callback(data?.pendingGameUpdated ?? null),
        error: (err) => console.error('Subscription error:', err)
      })
  }
}