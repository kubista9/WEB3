<template>
  <div class="lobby-view">
    <div class="lobby-header">
      <h1 class="lobby-title">Game Lobby</h1>
      <div class="user-info">
        <span class="username">{{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </div>

    <div class="lobby-content">
      <!-- Create Game Section -->
      <div class="section create-game-section">
        <h2 class="section-title">Create New Game</h2>
        <div class="create-game-form">
          <div class="form-group">
            <label class="form-label">Game Name</label>
            <input
              v-model="newGame.name"
              type="text"
              class="form-input"
              placeholder="Enter game name"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Max Players</label>
            <select v-model.number="newGame.maxPlayers" class="form-select">
              <option :value="2">2 Players</option>
              <option :value="3">3 Players</option>
              <option :value="4">4 Players</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Target Score</label>
            <input
              v-model.number="newGame.targetScore"
              type="number"
              class="form-input"
              placeholder="500"
              min="100"
              step="50"
            />
          </div>
          <button
            @click="createGame"
            class="btn btn-primary"
            :disabled="!canCreateGame"
          >
            <span class="btn-icon">🎮</span>
            <span>Create Game</span>
          </button>
        </div>
      </div>

      <!-- Available Games Section -->
      <div class="section available-games-section">
        <div class="section-header">
          <h2 class="section-title">Available Games</h2>
          <button @click="refreshGames" class="btn-refresh" :disabled="refreshing">
            <span :class="{ spinning: refreshing }">🔄</span>
          </button>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner-large"></div>
          <p>Loading games...</p>
        </div>

        <div v-else-if="availableGames.length === 0" class="empty-state">
          <div class="empty-icon">🎴</div>
          <p>No games available</p>
          <p class="empty-subtitle">Create a new game to get started!</p>
        </div>

        <div v-else class="games-grid">
          <div
            v-for="game in availableGames"
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

            <!-- Action buttons -->
            <div class="game-actions">
              <!-- Host (creator) -->
              <template v-if="isHost(game)">
                <button
                  v-if="game.players.length >= 2"
                  @click="handleStartGame(game.id)"
                  class="btn btn-primary"
                  :disabled="isStarting"
                >
                  <span v-if="isStarting">Starting...</span>
                  <span v-else>Start Game ({{ game.players.length }}/{{ game.maxPlayers }})</span>
                </button>
                <div v-else class="waiting-text">
                  Waiting for players to join ({{ game.players.length }}/{{
                    game.maxPlayers
                  }})...
                </div>
              </template>

              <!-- Non-hosts -->
              <template v-else>
                <!-- Already in the game -->
                <div v-if="isInGame(game)" class="waiting-text">
                  Waiting for host to start...
                </div>
                <!-- Can join the game -->
                <button
                  v-else-if="canJoin(game)"
                  @click="joinGame(game.id)"
                  class="btn btn-join"
                >
                  Join Game
                </button>
                <!-- Game is full -->
                <div v-else class="waiting-text">Game is full</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLobbyStore } from '@/stores/lobby'
import { useGameStore } from '@/stores/game'

let pendingSub: any = null
const router = useRouter()
const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
const gameStore = useGameStore()

const newGame = ref({
  name: '',
  maxPlayers: 4,
  targetScore: 500,
})

const loading = ref(false)
const refreshing = ref(false)
const isStarting = ref(false)
const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null)

const availableGames = computed(() => lobbyStore.availableGames)

const canCreateGame = computed(() => {
  return (
    newGame.value.name.trim().length > 0 &&
    newGame.value.maxPlayers >= 2 &&
    newGame.value.targetScore >= 100
  )
})

onMounted(async () => {
  loading.value = true
  await refreshGames()
  loading.value = false
  refreshInterval.value = setInterval(refreshGames, 5000)

  pendingSub = lobbyStore.subscribeToPendingGames(async (updatedGame) => {
    console.log('🛰️ [LOBBY] pendingGameUpdated received:', updatedGame)
    const myUsername = authStore.user?.username
    if (updatedGame === null) {
      console.log('🚀 [LOBBY] Game removed (probably started). Checking participation...')
      const myGame = availableGames.value.find((g) =>
        g.players.some((p: any) => p.username === myUsername)
      )
      if (myGame) {
        console.log('➡️ [LOBBY] Redirecting to active game:', myGame.id)
        await router.push(`/game/${myGame.id}`)
      }
    }
  })
})

onUnmounted(() => {
  if (refreshInterval.value) clearInterval(refreshInterval.value)
  if (pendingSub) pendingSub.unsubscribe()
})

async function refreshGames() {
  refreshing.value = true
  try {
    await lobbyStore.fetchGames()
  } finally {
    refreshing.value = false
  }
}

async function createGame() {
  if (!canCreateGame.value) return
  try {
    const game = await lobbyStore.createGame(
      newGame.value.name,
      newGame.value.maxPlayers
    )
  } catch (error: any) {
    console.error('Failed to create game:', error)
    alert('Failed to create game: ' + error.message)
  }
}

async function joinGame(gameId: string) {
  try {
    await lobbyStore.joinGame(gameId)
    await refreshGames()
  } catch (error: any) {
    console.error('Failed to join game:', error)
    alert('Failed to join game: ' + error.message)
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

async function handleStartGame(gameId: string) {
  if (isStarting.value) {
    console.log('Already starting game, ignoring...')
    return
  }
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }

  isStarting.value = true

  try {
    console.log('Starting game:', gameId)
    const result = await lobbyStore.startGame(gameId)
    console.log('Game started, result:', result)
    gameStore.setGame(result)

    await router.push(`/game/${result.id}`)
  } catch (error: any) {
    console.error('Failed to start game:', error)
    alert('Failed to start game: ' + error.message)
    refreshInterval.value = setInterval(refreshGames, 5000)
  } finally {
    isStarting.value = false
  }
}

function isHost(game: any) {
  return game?.creatorUsername === authStore.user?.username
}

function isInGame(game: any) {
  return !!game?.players?.some((p: any) => p.username === authStore.user?.username)
}

function canJoin(game: any) {
  return !isInGame(game) && game.players.length < game.maxPlayers
}
</script>

<style scoped>
.lobby-view {
  min-height: 100vh;
  background: black;
  padding: 2rem;
}

.lobby-header {
  max-width: 1400px;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem 2rem;
  border-radius: 1rem;
}

.lobby-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.lobby-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
}

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

.create-game-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon {
  font-size: 1.5rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-subtitle {
  margin-top: 0.5rem;
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

.game-status.playing {
  background: #dcfce7;
  color: #166534;
}

.game-status.finished {
  background: #f3f4f6;
  color: #6b7280;
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

.btn-join {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-size: 1rem;
}

.btn-join:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

</style>