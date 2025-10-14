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
      <div class="player-info">
        <span class="label">Current Player:</span>
        <span class="value">{{ currentPlayerName }}</span>
      </div>
      <div class="score-info">
        <span class="label">Round Score:</span>
        <span class="value">{{ roundScore }}</span>
      </div>
      <button @click="leaveGame" class="btn-danger">Leave Game</button>
    </div>

    <!-- Other Players -->
    <div class="other-players">
      <PlayerInfo
        v-for="(player, index) in otherPlayers"
        :key="index"
        :player-name="player"
        :card-count="getPlayerCardCount(index)"
        :is-current="isCurrentPlayer(index)"
        @catch-uno="handleCatchUno(index)"
      />
    </div>

    <!-- Game Board -->
    <div class="game-board">
      <!-- Draw Pile -->
      <div class="draw-pile" @click="handleDrawCard">
        <div class="card-back">
          <span class="deck-count">{{ drawPileCount }}</span>
        </div>
      </div>

      <!-- Discard Pile -->
      <DiscardPile :top-card="topCard" />
    </div>

    <!-- Player Hand -->
    <div class="player-hand-section">
      <h3>Your Hand</h3>
      <PlayerHand
        :cards="myHand"
        :selected-index="selectedCardIndex"
        :can-play-card="canPlayCard"
        :is-my-turn="isMyTurn"
        @select-card="selectCard"
      />
    </div>

    <!-- Game Controls -->
    <GameControls
      :is-my-turn="isMyTurn"
      :can-say-uno="canSayUno"
      :selected-card-index="selectedCardIndex"
      :show-color-picker="showColorPicker"
      @play-card="handlePlayCardAction"
      @draw-card="handleDrawCard"
      @say-uno="handleSayUno"
    />

    <!-- Color Picker Modal -->
    <ColorPicker
      v-if="showColorPicker"
      @select-color="handleColorSelection"
      @close="showColorPicker = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGame } from '@/composables/useGame'
import { useGameSubscription } from '@/composables/useWebSocket'
import { useGameStore } from '@/stores/game'
import PlayerInfo from '@/components/PlayerInfo.vue'
import DiscardPile from '@/components/DiscardPile.vue'
import PlayerHand from '@/components/PlayerHand.vue'
import GameControls from '@/components/GameControls.vue'
import ColorPicker from '@/components/ColorPicker.vue'
import { Color } from '../../../model/interfaces'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const gameId = route.params.id as string

// Setup game subscription (Observer pattern)
useGameSubscription(gameId)

// Use game composable (MVVM ViewModel)
const {
  myHand,
  topCard,
  isMyTurn,
  canSayUno,
  notifications,
  players,
  currentPlayerId,
  selectedCardIndex,
  showColorPicker,
  handlePlayCard,
  handleDrawCard,
  handleSayUno,
  handleCatchUno,
  canPlayCard,
  selectCard
} = useGame()

// Computed properties
const currentPlayerName = computed(() => {
  const turnIndex = gameStore.currentRound?.playerInTurn()
  return turnIndex !== undefined ? players.value[turnIndex] : ''
})

const roundScore = computed(() => {
  return gameStore.currentRound?.score() ?? 0
})

const otherPlayers = computed(() => {
  return players.value.filter((_, index) => index !== currentPlayerId.value)
})

const drawPileCount = computed(() => {
  return gameStore.currentRound?.drawPile().size ?? 0
})

function getPlayerCardCount(playerIndex: number) {
  return gameStore.currentRound?.playerHand(playerIndex).length ?? 0
}

function isCurrentPlayer(playerIndex: number) {
  return gameStore.currentRound?.playerInTurn() === playerIndex
}

async function handlePlayCardAction() {
  if (selectedCardIndex.value === null) return
  
  const card = myHand.value[selectedCardIndex.value]
  
  if (card.type === 'WILD CARD' || card.type === 'WILD DRAW') {
    gameStore.showColorPicker = true
  } else {
    await handlePlayCard(selectedCardIndex.value)
  }
}

async function handleColorSelection(color: Color) {
  if (selectedCardIndex.value === null) return
  await handlePlayCard(selectedCardIndex.value, color)
  gameStore.showColorPicker = false
}

function leaveGame() {
  router.push('/lobby')
}

onMounted(() => {
  // Check if game ended
  if (gameStore.currentRound?.hasEnded()) {
    router.push('/game-over')
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
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
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
}

.player-info, .score-info {
  display: flex;
  flex-direction: column;
  color: white;
}

.label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
}

.other-players {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  margin: 3rem 0;
}

.draw-pile {
  cursor: pointer;
  transition: transform 0.2s;
}

.draw-pile:hover {
  transform: scale(1.05);
}

.card-back {
  width: 120px;
  height: 180px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  position: relative;
}

.deck-count {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #1e3a8a;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: bold;
  font-size: 0.875rem;
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

.btn-danger {
  background: #ef4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>