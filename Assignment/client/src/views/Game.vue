<template>
  <div class="game-view">
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
        v-for="(player, index) in otherPlayers"
        :key="index"
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
        <div class="card-back" @click="handleDrawCard">
          <span class="pile-label">Draw</span>
          <span class="card-count">{{ drawPileCount }}</span>
        </div>
      </div>

      <!-- Discard Pile -->
      <div class="pile">
        <div
          v-if="topCard"
          class="card"
          :class="{ [(topCard as any).color || '']: true }"
        >
          <div class="card-type">{{ topCard.type }}</div>
          <div
            v-if="(topCard as any).number !== undefined"
            class="card-number"
          >
            {{ (topCard as any).number }}
          </div>
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
          :class="{ selected: selectedCardIndex === index }"
          @click="selectCard(index)"
        >
          <div class="card" :class="{ [(card as any).color || '']: true }">
            <div class="card-type">{{ card.type }}</div>
            <div
              v-if="(card as any).number !== undefined"
              class="card-number"
            >
              {{ (card as any).number }}
            </div>
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
      <button @click="handleDrawCard" class="btn btn-draw" :disabled="!isMyTurn">
        Draw Card
      </button>
      <button @click="handleSayUno" class="btn btn-uno" :disabled="!canSayUno">
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
</template>

// SCRIPT:
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()
const gameId = route.params.id as string

const selectedCardIndex = ref<number | null>(null)
const notifications = ref<string[]>([])
const showColorPicker = ref(false)
const pendingCardIndex = ref<number | null>(null)

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
  if (!game || !game.discardPile || game.discardPile.length === 0) return null
  return game.discardPile[0]
})

const isMyTurn = computed(() => {
  const game = gameStore.game
  if (!game) return false

  const username = authStore.user?.username
  return game.currentPlayer?.username === username
})

const players = computed(() => {
  const game = gameStore.game
  if (!game || !game.players) return []
  return game.players.map((p: any) => p.username)
})

const currentPlayerName = computed(() => {
  const game = gameStore.game
  if (!game || !game.currentPlayer) return ''
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
  return isMyTurn.value && myHand.value.length === 1
})

// Methods
function selectCard(index: number) {
  if (!isMyTurn.value) return
  selectedCardIndex.value = index
}

async function handlePlayCard() {
  if (selectedCardIndex.value === null || !isMyTurn.value) return

  const card = myHand.value[selectedCardIndex.value]

  // Check if it's a wild card that needs color selection
  if (card.type === 'WILD CARD' || card.type === 'DRAW CARD') {
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

async function playCard(cardIndex: number, color?: string) {
  try {
    // Call your game service to play the card
    // await gameService.playCard(gameId, cardIndex, color)
    addNotification('Card played!')
    selectedCardIndex.value = null
  } catch (error: any) {
    addNotification('Failed to play card: ' + error.message)
  }
}

async function handleDrawCard() {
  if (!isMyTurn.value) return
  try {
    // await gameService.drawCard(gameId)
    addNotification('Card drawn!')
  } catch (error: any) {
    addNotification('Failed to draw card: ' + error.message)
  }
}

async function handleSayUno() {
  if (!canSayUno.value) return
  try {
    // await gameService.sayUno(gameId)
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
  gameStore.clearGame()
  router.push('/lobby')
}

onMounted(async () => {
  try {
    // If game is not already loaded, fetch it
    if (!gameStore.game) {
      await gameStore.fetchGame(gameId)
    }
  } catch (error) {
    console.error('Failed to load game:', error)
    alert('Failed to load game')
    router.push('/lobby')
  }
})
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
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
}

.player-card.current {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
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

.card-back:hover {
  transform: scale(1.05);
}

.pile-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.empty-pile {
  color: white;
  opacity: 0.5;
}

.card {
  width: 120px;
  height: 180px;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  font-weight: bold;
  color: white;
}

.card.RED {
  background: #ef4444;
}

.card.BLUE {
  background: #3b82f6;
}

.card.GREEN {
  background: #10b981;
}

.card.YELLOW {
  background: #eab308;
  color: #1f2937;
}

.card-type {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.card-number {
  font-size: 2rem;
  margin-top: 0.5rem;
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

.card-wrapper:hover {
  transform: translateY(-10px);
}

.card-wrapper.selected .card {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-play {
  background: #10b981;
  color: white;
}

.btn-play:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.btn-draw {
  background: #3b82f6;
  color: white;
}

.btn-draw:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-uno {
  background: #f59e0b;
  color: white;
}

.btn-uno:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-2px);
}

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
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
}

.colors {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.color-button {
  width: 80px;
  height: 80px;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: bold;
  color: white;
  transition: transform 0.2s;
}

.color-button:hover {
  transform: scale(1.1);
}

.color-button.RED {
  background: #ef4444;
}

.color-button.BLUE {
  background: #3b82f6;
}

.color-button.GREEN {
  background: #10b981;
}

.color-button.YELLOW {
  background: #eab308;
  color: #1f2937;
}
</style>