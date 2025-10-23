<template>
  <div class="game-view">
    <!-- Loading State -->
    <div v-if="gameStore.loading" class="loading-overlay">
      <div class="spinner-large"></div>
      <p>Loading game...</p>
    </div>

    <!-- Game Content -->
    <div v-else-if="gameStore.game" class="game-content">
      <GameNotification ref="notificationRef" />
      
      <GameHeader
        :current-player-name="currentPlayerName"
        :card-count="myHand.length"
        @leave="leaveGame"
      />

      <OtherPlayers :players="otherPlayersData" />

      <GameBoard :top-card="topCard" />

      <PlayerHand
        :cards="myHand"
        :selected-index="selectedCardIndex"
        :is-my-turn="isMyTurn"
        @select="selectCard"
      />

      <GameControls
        :can-play="selectedCardIndex !== null && isMyTurn"
        :is-my-turn="isMyTurn"
        :can-say-uno="canSayUno"
        @play="handlePlayCard"
        @draw="handleDrawCard"
        @uno="handleSayUno"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import { gameService } from '@/api/gameService'
import GameNotification from '@/components/game/Notification.vue'
import GameHeader from '@/components/game/GameHeader.vue'
import OtherPlayers from '@/components/game/OtherPlayers.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import PlayerHand from '@/components/game/PlayerHand.vue'
import GameControls from '@/components/game/GameControls.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()
const gameId = route.params.id as string

const selectedCardIndex = ref<number | null>(null)
const notificationRef = ref<InstanceType<typeof GameNotification> | null>(null)

let subscription: any = null

const myHand = computed(() => {
  const game = gameStore.game
  if (!game || !game.playerHands) return []
  const username = authStore.user?.username
  const myHandData = game.playerHands.find((ph: any) => ph.username === username)
  return myHandData?.hand || []
})

const topCard = computed(() => {
  const game = gameStore.game
  if (!game || !game.discardPile?.length) return null
  return game.discardPile[0]
})

const isMyTurn = computed(() => {
  const game = gameStore.game
  if (!game) return false
  const username = authStore.user?.username
  return game.currentPlayer?.username === username
})

const currentPlayerName = computed(() => {
  const game = gameStore.game
  if (!game || !game.currentPlayer) return 'Unknown'
  return game.currentPlayer.username
})

const otherPlayersData = computed(() => {
  const game = gameStore.game
  if (!game || !game.players) return []
  const myUsername = authStore.user?.username
  
  return game.players
    .filter((p: any) => p.username !== myUsername)
    .map((p: any) => ({
      username: p.username,
      cardCount: getPlayerCardCount(p.username),
      isCurrent: isCurrentPlayer(p.username)
    }))
})

const canSayUno = computed(() => {
  return isMyTurn.value && myHand.value.length === 2
})

function setupSubscription() {
  subscription = gameService.subscribeToGame(gameId, (game) => {
    gameStore.setGame(game)
  })
}

function selectCard(index: number) {
  if (!isMyTurn.value) {
    addNotification("It's not your turn!")
    return
  }
  selectedCardIndex.value = selectedCardIndex.value === index ? null : index
}

async function handlePlayCard() {
  if (selectedCardIndex.value === null || !isMyTurn.value) return

  const card = myHand.value[selectedCardIndex.value]
  
  if (card.type === 'WILD' || card.type === 'WILD_DRAW_FOUR') {
    await playCard(selectedCardIndex.value, 'RED')
  } else {
    await playCard(selectedCardIndex.value)
  }
}

async function playCard(cardIndex: number, chosenColor?: string) {
  try {
    const result = await gameService.playCard(
      gameId,
      cardIndex,
      myHand.value.length === 2,
      chosenColor
    )
    
    if (result) {
      gameStore.setGame(result)
      addNotification('Card played!')
    }
    selectedCardIndex.value = null
  } catch (error: any) {
    console.error('Play card error:', error)
    addNotification('Failed to play card: ' + error.message)
  }
}

async function handleDrawCard() {
  if (!isMyTurn.value) {
    addNotification("It's not your turn!")
    return
  }

  try {
    const result = await gameService.drawCard(gameId)
    if (result) {
      gameStore.setGame(result)
      addNotification('Card drawn!')
    }
  } catch (error: any) {
    console.error('Draw card error:', error)
    addNotification('Failed to draw card: ' + error.message)
  }
}

async function handleSayUno() {
  if (!canSayUno.value) return
  addNotification('UNO!')
}

function addNotification(message: string) {
  notificationRef.value?.addNotification(message)
}

function getPlayerCardCount(username: string) {
  const game = gameStore.game
  if (!game || !game.playerHands) return 0
  const handData = game.playerHands.find((ph: any) => ph.username === username)
  return handData?.cardCount || 0
}

function isCurrentPlayer(username: string) {
  const game = gameStore.game
  if (!game) return false
  return username === game.currentPlayer?.username
}

function leaveGame() {
  if (subscription) {
    subscription.unsubscribe()
  }
  gameStore.clearGame()
  router.push('/lobby')
}

onMounted(async () => {
  await gameStore.fetchGame(gameId)
  setupSubscription()
})

onBeforeUnmount(() => {
  if (subscription) {
    subscription.unsubscribe()
  }
})
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  padding: 2rem;
  background: black;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: white;
}

.spinner-large {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>