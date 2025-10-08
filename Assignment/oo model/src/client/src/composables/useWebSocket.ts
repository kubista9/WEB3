import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { gameService } from '@/services/api'

export function useGameSubscription(gameId: string) {
  const gameStore = useGameStore()
  let subscription: any

  onMounted(() => {
    subscription = gameService.subscribeToGame(gameId, (data) => {
      // Update local state from server
      gameStore.updateFromServer(data.gameState)
      
      if (data.message) {
        gameStore.addNotification(data.message)
      }
    })
  })

  onUnmounted(() => {
    if (subscription) {
      subscription.unsubscribe()
    }
  })
}