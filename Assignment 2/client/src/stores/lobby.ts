import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apolloClient } from '@/api/graphql'
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

export const useLobbyStore = defineStore('lobby', () => {
  const availableGames = ref<any[]>([])
  const loading = ref(false)

  async function fetchGames() {
    try {
      const { data } = await apolloClient.query({
        query: GET_PENDING_GAMES,
        fetchPolicy: 'network-only',
      })
      availableGames.value = data.pendingGames || []
    } catch (error) {
      console.error('Failed to fetch games:', error)
      throw error
    }
  }

  async function createGame(name: string, maxPlayers: number) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_GAME,
        variables: { input: { maxPlayers } },
      })
      await fetchGames()
      return data.createGame
    } catch (error) {
      console.error('Failed to create game:', error)
      throw error
    }
  }

  async function joinGame(gameId: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: JOIN_GAME,
        variables: { input: { gameId } },
      })
      await fetchGames()
      return data.joinGame
    } catch (error) {
      console.error('Failed to join game:', error)
      throw error
    }
  }

  async function startGame(gameId: string) {
    try {
      console.log('Starting game with ID:', gameId)
      const { data } = await apolloClient.mutate({
        mutation: START_GAME,
        variables: { input: { gameId } },
      })
      console.log('Game started, received data:', data.startGame)
      return data.startGame
    } catch (error) {
      console.error('Failed to start game:', error)
      throw error
    }
  }

  function subscribeToPendingGames(callback: (game: any | null) => void) {
    console.log('LOBBY Subscribing to pending games...')
    return apolloClient
      .subscribe({ query: PENDING_GAME_UPDATED })
      .subscribe({
        next: ({ data }: any) => {
          console.log('LOBBY Subscription event:', data)
          callback(data?.pendingGameUpdated ?? null)
        },
        error: (err) => {
          console.error('LOBBY Subscription error:', err)
        },
      })
  }

  return {
    availableGames,
    loading,
    fetchGames,
    createGame,
    joinGame,
    startGame,
    subscribeToPendingGames,
  }
})