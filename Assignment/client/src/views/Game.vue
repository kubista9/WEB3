<template>
  <div class="game-view">
    <!-- Loading State -->
    <div v-if="gameStore.loading" class="loading-overlay">
      <div class="spinner-large"></div>
      <p>Loading game...</p>
    </div>

    <!-- Game Content -->
    <div v-else-if="gameStore.game" class="game-content">
      <!-- Notifications -->
      <TransitionGroup name="notification" tag="div" class="notifications">
        <div
          v-for="(notification, index) in notifications"
          :key="index"
          class="notification"
        >
          {{ notification }}
        </div>
      </TransitionGroup>

      <!-- Game Header -->
      <div class="game-header">
        <h1>UNO Game</h1>
        <div class="header-info">
          <div>
            <span class="label">Current Player:</span>
            <span class="value">{{ currentPlayerName }}</span>
          </div>
          <div>
            <span class="label">Your Cards:</span>
            <span class="value">{{ myHand.length }}</span>
          </div>
        </div>
        <button @click="leaveGame" class="btn-danger">Leave Game</button>
      </div>

      <!-- Other Players -->
      <div class="other-players">
        <div
          v-for="player in otherPlayers"
          :key="player"
          class="player-card"
          :class="{ current: isCurrentPlayer(player) }"
        >
          <div class="player-name">{{ player }}</div>
          <div class="card-count">🃏 {{ getPlayerCardCount(player) }}</div>
        </div>
      </div>

      <!-- Game Board -->
      <div class="game-board">
        <!-- Draw Pile -->
        <div class="pile">
          <div 
            class="card-back" 
            @click="handleDrawCard"
            :class="{ disabled: !isMyTurn }"
          >
            <span class="pile-label">Draw</span>
            <span class="card-count">{{ drawPileCount }}</span>
          </div>
        </div>

        <!-- Discard Pile -->
        <div class="pile">
          <div
            v-if="topCard"
            class="card discard-card"
            :class="getCardColorClass(topCard)"
          >
            <div class="card-display">{{ getCardDisplay(topCard) }}</div>
          </div>
          
          <div v-else class="empty-pile">No cards</div>
        </div>
      </div>

      <!-- Player Hand -->
      <div class="player-hand-section">
        <h3>Your Hand</h3>
        <div class="player-hand">
          <div
            v-for="(card, index) in myHand"
            :key="index"
            class="card-wrapper"
            :class="{ 
              selected: selectedCardIndex === index,
              disabled: !isMyTurn
            }"
            @click="selectCard(index)"
          >
            <div
              class="card"
              :class="getCardColorClass(card)"
            >
              <div class="card-display">{{ getCardDisplay(card) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game Controls -->
      <div class="game-controls">
        <button
          @click="handlePlayCard"
          class="btn btn-play"
          :disabled="selectedCardIndex === null || !isMyTurn"
        >
          Play Card
        </button>
        <button 
          @click="handleDrawCard" 
          class="btn btn-draw" 
          :disabled="!isMyTurn"
        >
          Draw Card
        </button>
        <button
          @click="handleSayUno"
          class="btn btn-uno"
          :disabled="!canSayUno"
        >
          UNO!
        </button>
      </div>

      <!-- Color Picker Modal -->
      <div
        v-if="showColorPicker"
        class="color-picker-overlay"
        @click="showColorPicker = false"
      >
        <div class="color-picker" @click.stop>
          <h3>Choose a color</h3>
          <div class="colors">
            <button
              @click="handleColorSelection('RED')"
              class="color-button RED"
            >
              Red
            </button>
            <button
              @click="handleColorSelection('BLUE')"
              class="color-button BLUE"
            >
              Blue
            </button>
            <button
              @click="handleColorSelection('GREEN')"
              class="color-button GREEN"
            >
              Green
            </button>
            <button
              @click="handleColorSelection('YELLOW')"
              class="color-button YELLOW"
            >
              Yellow
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'
import { apolloClient } from '@/services/graphql'
import { gql } from '@apollo/client/core'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()
const gameId = route.params.id as string

const selectedCardIndex = ref<number | null>(null)
const notifications = ref<string[]>([])
const showColorPicker = ref(false)
const pendingCardIndex = ref<number | null>(null)
let subscription: any = null

// GraphQL Operations
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

// Computed properties
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

const otherPlayers = computed(() => {
  const game = gameStore.game
  if (!game || !game.players) return []
  const myUsername = authStore.user?.username
  return game.players
    .filter((p: any) => p.username !== myUsername)
    .map((p: any) => p.username)
})

const drawPileCount = computed(() => {
  const game = gameStore.game
  if (!game) return 0
  return game.drawPileSize || 0
})

const canSayUno = computed(() => {
  return isMyTurn.value && myHand.value.length === 2
})

function getCardColorClass(card: any) {
  if (!card || !card.color) return 'WILD'
  return card.color.toUpperCase()
}

function getCardDisplay(card: any) {
  if (!card) return '?'
  if (card.type === 'NUMBER' && card.number !== undefined && card.number !== null) {
    return card.number.toString()
  }
  
  switch(card.type) {
    case 'SKIP': return 'SKIP'
    case 'REVERSE': return '⇄'
    case 'DRAW_TWO': return '+2'
    case 'WILD': return 'WILD'
    case 'WILD_DRAW_FOUR': return '+4'
    default: return card.type || '?'
  }
}

function setupSubscription() {
  console.log('Setting up subscription for game:', gameId)
  subscription = apolloClient
    .subscribe({
      query: GAME_SUBSCRIPTION,
      variables: { gameId }
    })
    .subscribe({
      next: ({ data }: any) => {
        console.log('Game updated via subscription:', data)
        if (data.gameUpdated) {
          gameStore.setGame(data.gameUpdated)
        }
      },
      error: (err: any) => {
        console.error('Subscription error:', err)
      }
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
    pendingCardIndex.value = selectedCardIndex.value
    showColorPicker.value = true
  } else {
    await playCard(selectedCardIndex.value)
  }
}

async function handleColorSelection(color: string) {
  if (pendingCardIndex.value === null) return
  await playCard(pendingCardIndex.value, color)
  showColorPicker.value = false
  pendingCardIndex.value = null
}

async function playCard(cardIndex: number, chosenColor?: string) {
  try {
    const result = await apolloClient.mutate({
  mutation: PLAY_CARD,
  variables: {
    input: {
      gameId,
      cardIndex,
      saidUno: myHand.value.length === 2,
      chosenColor: chosenColor || null
    }
  },
  fetchPolicy: 'no-cache'
})

if (result.data?.playCard) {
  gameStore.setGame(JSON.parse(JSON.stringify(result.data.playCard)))
  addNotification('Card played!')
}

selectedCardIndex.value = null


    if (result.data?.playCard) {
      gameStore.setGame(result.data.playCard)
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
    console.log('Drawing card for game:', gameId)
    
    const result = await apolloClient.mutate({
      mutation: DRAW_CARD,
      variables: { gameId }
    })
    
    // Update local game state immediately
    if (result.data?.drawCard) {
      gameStore.setGame(result.data.drawCard)
      addNotification('Card drawn!')
    }
  } catch (error: any) {
    console.error('Draw card error:', error)
    addNotification('Failed to draw card: ' + error.message)
  }
}

async function handleSayUno() {
  if (!canSayUno.value) return
  
  try {
    const myPlayerIndex = gameStore.game?.players.findIndex(
      (p: any) => p.username === authStore.user?.username
    )
    if (myPlayerIndex === undefined || myPlayerIndex === -1) return
    
    addNotification('UNO!')
  } catch (error: any) {
    addNotification('Failed: ' + error.message)
  }
}

function addNotification(message: string) {
  notifications.value.push(message)
  setTimeout(() => {
    notifications.value.shift()
  }, 3000)
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
  console.log('Game component mounted, gameId:', gameId)
  await gameStore.fetchGame(gameId)
  console.log('Game loaded:', gameStore.game)
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.notification {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  color: white;
}

.game-header h1 {
  margin: 0;
  font-size: 2rem;
}

.header-info {
  display: flex;
  gap: 2rem;
}

.label {
  font-size: 0.875rem;
  opacity: 0.8;
  display: block;
}

.value {
  font-size: 1.25rem;
  font-weight: bold;
  display: block;
}

.other-players {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.player-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 0.5rem;
  color: white;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.player-card.current {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}

.player-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.card-count {
  font-size: 0.875rem;
  opacity: 0.8;
}

.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  margin: 3rem 0;
}

.pile {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-back {
  width: 120px;
  height: 180px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s;
  color: white;
}

.card-back:not(.disabled):hover {
  transform: scale(1.05);
}

.card-back.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pile-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.empty-pile {
  width: 120px;
  height: 180px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0.5;
}

.card {
  width: 120px;
  height: 180px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  font-weight: bold;
  color: white;
  font-size: 2rem;
}

.card.RED {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.card.BLUE {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.card.GREEN {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.card.YELLOW {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1f2937;
}

.card.WILD {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.card-display {
  font-size: 1.5rem;
  text-align: center;
}

.player-hand-section {
  text-align: center;
  margin: 3rem 0;
}

.player-hand-section h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.player-hand {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.card-wrapper {
  cursor: pointer;
  transition: transform 0.2s;
}

.card-wrapper:not(.disabled):hover {
  transform: translateY(-10px);
}

.card-wrapper.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.card-wrapper.selected {
  transform: translateY(-20px);
}

.card-wrapper.selected .card {
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-play {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-play:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-draw {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-draw:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-uno {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-uno:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
}

.color-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.color-picker {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.color-picker h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.colors {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.color-button {
  width: 100px;
  height: 100px;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: transform 0.2s;
  font-size: 1rem;
}

.color-button:hover {
  transform: scale(1.1);
}

.color-button.RED {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.color-button.BLUE {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.color-button.GREEN {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.color-button.YELLOW {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #1f2937;
}
</style>