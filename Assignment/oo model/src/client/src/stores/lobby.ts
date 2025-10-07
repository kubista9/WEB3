import { defineStore } from 'pinia'
import { ref } from 'vue'
import { lobbyService } from '@/services/api'

export const useLobbyStore = defineStore('lobby', () => {
  const availableGames = ref<any[]>([])
  const currentGame = ref<any | null>(null)

  async function fetchGames() {
    availableGames.value = await lobbyService.getGames()
  }

  async function createGame(name: string, maxPlayers: number) {
    const game = await lobbyService.createGame(name, maxPlayers)
    currentGame.value = game
    return game
  }

  async function joinGame(gameId: string) {
    const game = await lobbyService.joinGame(gameId)
    currentGame.value = game
    return game
  }

  return {
    availableGames,
    currentGame,
    fetchGames,
    createGame,
    joinGame
  }
})