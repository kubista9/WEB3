<template>
  <div class="game-controls">
    <div class="control-panel">
      <div class="main-controls">
        <button
          @click="$emit('playCard')"
          :disabled="!isMyTurn || selectedCardIndex === null"
          class="btn btn-play"
          :class="{ disabled: !isMyTurn || selectedCardIndex === null }"
        >
          <span class="btn-icon">🎴</span>
          <div class="btn-content">
            <span class="btn-text">Play Card</span>
            <span class="btn-hint" v-if="selectedCardIndex !== null">Selected card ready</span>
          </div>
        </button>
        
        <button
          @click="$emit('drawCard')"
          :disabled="!isMyTurn"
          class="btn btn-draw"
          :class="{ disabled: !isMyTurn }"
        >
          <span class="btn-icon">📥</span>
          <div class="btn-content">
            <span class="btn-text">Draw Card</span>
            <span class="btn-hint" v-if="isMyTurn">From deck</span>
          </div>
        </button>
        
        <button
          @click="$emit('sayUno')"
          :disabled="!canSayUno"
          class="btn btn-uno"
          :class="{ 
            disabled: !canSayUno,
            'btn-uno-pulse': canSayUno 
          }"
        >
          <span class="btn-icon">🎯</span>
          <div class="btn-content">
            <span class="btn-text">Say UNO!</span>
            <span class="btn-hint" v-if="canSayUno">Required!</span>
          </div>
        </button>
      </div>

      <!-- Turn Status -->
      <div class="turn-status">
        <div v-if="isMyTurn" class="status-indicator my-turn">
          <div class="status-dot"></div>
          <span class="status-text">Your Turn</span>
        </div>
        <div v-else class="status-indicator waiting">
          <div class="spinner-small"></div>
          <span class="status-text">Waiting for other players...</span>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat">
          <span class="stat-label">Selected:</span>
          <span class="stat-value">
            {{ selectedCardIndex !== null ? 'Card ' + (selectedCardIndex + 1) : 'None' }}
          </span>
        </div>
        <div class="stat">
          <span class="stat-label">UNO Status:</span>
          <span class="stat-value" :class="{ alert: canSayUno }">
            {{ canSayUno ? 'Say UNO!' : 'Ready' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isMyTurn: boolean
  canSayUno: boolean
  selectedCardIndex: number | null
  showColorPicker: boolean
}>()

defineEmits<{
  playCard: []
  drawCard: []
  sayUno: []
}>()
</script>