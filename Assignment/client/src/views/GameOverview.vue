<template>
  <div class="game-over-view">
    <div class="game-over-card">
      <div class="trophy-animation">
        <div class="trophy-icon">🏆</div>
        <div class="confetti" v-for="i in 20" :key="i" :style="confettiStyle(i)"></div>
      </div>

      <h1 class="game-over-title">Game Over!</h1>
      <h2 class="winner-announcement">
        {{ winnerName }} Wins!
      </h2>

      <div class="final-scores">
        <h3 class="scores-title">Final Scores</h3>
        <div class="scores-list">
          <div
            v-for="(player, index) in sortedPlayers"
            :key="index"
            class="score-item"
            :class="{ winner: index === 0 }"
          >
            <div class="player-rank">
              <span class="rank-number">{{ index + 1 }}</span>
              <span class="rank-medal">{{ getMedal(index) }}</span>
            </div>
            <div class="player-name">{{ player.name }}</div>
            <div class="player-score">{{ player.score }}</div>
          </div>
        </div>
      </div>

      <div class="game-stats">
        <div class="stat-card">
          <div class="stat-value">{{ roundsPlayed }}</div>
          <div class="stat-label">Rounds Played</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalCardsPlayed }}</div>
          <div class="stat-label">Cards Played</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ gameDuration }}</div>
          <div class="stat-label">Duration</div>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="playAgain" class="btn btn-primary">
          <span class="btn-icon">🔄</span>
          <span>Play Again</span>
        </button>
        <button @click="backToLobby" class="btn btn-secondary">
          <span class="btn-icon">🏠</span>
          <span>Back to Lobby</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const gameStore = useGameStore()
const authStore = useAuthStore()

const players = ref([
  { name: 'Player 1', score: 500 },
  { name: 'Player 2', score: 375 },
  { name: 'Player 3', score: 250 },
  { name: 'Player 4', score: 180 }
])

const roundsPlayed = ref(8)
const totalCardsPlayed = ref(342)
const gameDuration = ref('24:35')

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => b.score - a.score)
})

const winnerName = computed(() => sortedPlayers.value[0]?.name || 'Unknown')

onMounted(() => {
  // Load game results from store
  if (gameStore.game) {
    // Update with actual game data
    players.value = gameStore.players.map((name, index) => ({
      name,
      score: gameStore.game?.score(index) || 0
    }))
  }
})

function getMedal(index: number): string {
  const medals = ['🥇', '🥈', '🥉', '']
  return medals[index] || ''
}

function confettiStyle(index: number) {
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
  const left = Math.random() * 100
  const delay = Math.random() * 2
  const duration = 3 + Math.random() * 2
  
  return {
    left: `${left}%`,
    backgroundColor: colors[index % colors.length],
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

function playAgain() {
  router.push('/lobby')
}

function backToLobby() {
  router.push('/lobby')
}
</script>

<style scoped>
.game-over-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.game-over-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
  padding: 3rem;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.trophy-animation {
  position: relative;
  text-align: center;
  margin-bottom: 2rem;
  height: 120px;
}

.trophy-icon {
  font-size: 6rem;
  animation: trophy-bounce 1s ease-in-out infinite;
  display: inline-block;
}

@keyframes trophy-bounce {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: confetti-fall linear infinite;
  top: -20px;
}

@keyframes confetti-fall {
  to {
    transform: translateY(600px) rotate(360deg);
    opacity: 0;
  }
}

.game-over-title {
  text-align: center;
  font-size: 3rem;
  font-weight: 900;
  color: #1f2937;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.winner-announcement {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-text-fill-color: transparent;
  margin: 0 0 3rem 0;
}

.final-scores {
  margin-bottom: 2rem;
}

.scores-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.scores-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.score-item.winner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.player-rank {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 60px;
}

.rank-number {
  width: 30px;
  height: 30px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.score-item.winner .rank-number {
  background: #f59e0b;
}

.rank-medal {
  font-size: 1.5rem;
}

.player-name {
  flex: 1;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.player-score {
  font-size: 1.5rem;
  font-weight: 800;
  color: #667eea;
}

.score-item.winner .player-score {
  color: #f59e0b;
}

.game-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem 0;
  border-top: 2px solid #e5e7eb;
  border-bottom: 2px solid #e5e7eb;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-icon {
  font-size: 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

@media (max-width: 640px) {
  .game-over-card {
    padding: 2rem;
  }
  
  .game-over-title {
    font-size: 2rem;
  }
  
  .winner-announcement {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .game-stats {
    grid-template-columns: 1fr;
  }
}
</style>