<template>
  <div class="section available-games-section">
    <div class="section-header">
      <h2 class="section-title">Available Games</h2>
      <button
        @click="$emit('refresh')"
        class="btn-refresh"
        :disabled="refreshing"
      >
        <span :class="{ spinning: refreshing }">🔄</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-large"></div>
      <p>Loading games...</p>
    </div>

    <div v-else-if="games.length === 0" class="empty-state">
      <div class="empty-icon">🎴</div>
      <p>No games available</p>
      <p class="empty-subtitle">Create a new game to get started!</p>
    </div>

    <div v-else class="games-grid">
      <div
        v-for="game in games"
        :key="game.id"
        class="game-card"
        :class="{ full: game.players.length >= game.maxPlayers }"
      >
        <div class="game-card-header">
          <h3 class="game-name">{{ game.creatorUsername }}'s Game</h3>
          <span class="game-status waiting">waiting</span>
        </div>

        <div class="game-info">
          <div class="info-item">
            <span class="info-label">Players:</span>
            <span class="info-value"
              >{{ game.players.length }} / {{ game.maxPlayers }}</span
            >
          </div>
          <div class="info-item">
            <span class="info-label">Host:</span>
            <span class="info-value">{{ game.creatorUsername }}</span>
          </div>
        </div>

        <div class="game-actions">
          <template v-if="game.isHost">
            <button
              v-if="game.players.length >= 2"
              @click="$emit('start', game.id)"
              class="btn btn-primary"
              :disabled="isStarting"
            >
              <span v-if="isStarting">Starting...</span>
              <span v-else
                >Start Game ({{ game.players.length }}/{{
                  game.maxPlayers
                }})</span
              >
            </button>
            <div v-else class="waiting-text">
              Waiting for players to join ({{ game.players.length }}/{{
                game.maxPlayers
              }})...
            </div>
          </template>

          <template v-else>
            <div v-if="game.isInGame" class="waiting-text">
              Waiting for host to start...
            </div>
            <button
              v-else-if="game.canJoin"
              @click="$emit('join', game.id)"
              class="btn btn-join"
            >
              Join Game
            </button>
            <div v-else class="waiting-text">Game is full</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface GameInfo {
  id: string
  creatorUsername: string
  players: any[]
  maxPlayers: number
  isHost: boolean
  isInGame: boolean
  canJoin: boolean
}

defineProps<{
  games: GameInfo[]
  loading: boolean
  refreshing: boolean
  isStarting: boolean
}>()

defineEmits<{
  refresh: []
  join: [gameId: string]
  start: [gameId: string]
}>()
</script>

<style scoped>
.section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-refresh {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.btn-refresh:hover:not(:disabled) {
  transform: scale(1.1);
}

.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-subtitle {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.game-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s;
}

.game-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.game-card.full {
  opacity: 0.6;
}

.game-card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.game-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.game-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.game-status.waiting {
  background: #dbeafe;
  color: #1e40af;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
}

.info-label {
  color: #6b7280;
}

.info-value {
  color: #1f2937;
  font-weight: 600;
}

.game-actions {
  margin-top: 1rem;
}

.waiting-text {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 0.5rem;
}

.btn {
  width: 100%;
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

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-join {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-join:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
}
</style>