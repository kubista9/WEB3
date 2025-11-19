import { apolloClient } from './graphql'
import { gql } from '@apollo/client/core'

const GET_ACTIVE_GAME = gql`
  query GetActiveGame($id: ID!) {
    activeGame(id: $id) {
      id
      players {
        id
        username
      }
      currentPlayerIndex
      currentPlayer {
        id
        username
      }
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

const PLAY_CARD = gql`
  mutation PlayCard($input: PlayCardInput!) {
    playCard(input: $input) {
      id
      currentPlayerIndex
      currentPlayer {
        id
        username
      }
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

const DRAW_CARD = gql`
  mutation DrawCard($gameId: ID!) {
    drawCard(gameId: $gameId) {
      id
      currentPlayerIndex
      currentPlayer {
        id
        username
      }
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

const GAME_SUBSCRIPTION = gql`
  subscription OnGameUpdated($gameId: ID!) {
    gameUpdated(gameId: $gameId) {
      id
      players {
        id
        username
      }
      currentPlayerIndex
      currentPlayer {
        id
        username
      }
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

export const gameService = {
  async fetchGame(gameId: string) {
    const { data } = await apolloClient.query({
      query: GET_ACTIVE_GAME,
      variables: { id: gameId },
      fetchPolicy: 'network-only'
    })
    return data.activeGame
  },

  async playCard(gameId: string, cardIndex: number, saidUno: boolean, chosenColor?: string) {
    const { data } = await apolloClient.mutate({
      mutation: PLAY_CARD,
      variables: {
        input: {
          gameId,
          cardIndex,
          saidUno,
          chosenColor: chosenColor || null
        }
      },
      fetchPolicy: 'no-cache'
    })
    return data.playCard
  },

  async drawCard(gameId: string) {
    const { data } = await apolloClient.mutate({
      mutation: DRAW_CARD,
      variables: { gameId }
    })
    return data.drawCard
  },

  subscribeToGame(gameId: string, callback: (game: any) => void) {
    return apolloClient
      .subscribe({
        query: GAME_SUBSCRIPTION,
        variables: { gameId }
      })
      .subscribe({
        next: ({ data }: any) => {
          if (data.gameUpdated) {
            callback(data.gameUpdated)
          }
        },
        error: (err: any) => console.error('Subscription error:', err)
      })
  }
}