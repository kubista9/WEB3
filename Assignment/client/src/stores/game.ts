import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apolloClient } from '@/api/graphql'
import { gql } from '@apollo/client/core'

export const useGameStore = defineStore('game', () => {
  const game = ref<any | null>(null)
  const loading = ref(false)

  async function fetchGame(gameId: string) {
    loading.value = true
    try {
      const { data } = await apolloClient.query({
        query: gql`
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
  `,

        variables: { id: gameId },
        fetchPolicy: 'network-only'
      })


      game.value = data.activeGame
      console.log('📦 [FRONTEND] Game fetched:', {
        id: data.activeGame.id,
        players: data.activeGame.players.map((p: any) => p.username),
        playerHands: data.activeGame.playerHands.map((h: any) => ({
          username: h.username,
          cardCount: h.cardCount,
        })),
      })
      return data.activeGame

    } catch (error) {
      console.error('Failed to fetch game:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function setGame(gameData: any) {
    game.value = gameData
  }

  function clearGame() {
    game.value = null
  }

  return {
    game,
    loading,
    fetchGame,
    setGame,
    clearGame
  }
})