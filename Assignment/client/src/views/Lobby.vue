<template>
  <div class="lobby-view">
    <LobbyHeader
      :username="authStore.user?.username || ''"
      @logout="handleLogout"
    />

    <div class="lobby-content">
      <CreateGame @create="handleCreateGame" />
      
      <AvailableGames
        :games="gamesWithMeta"
        :loading="loading"
        :refreshing="refreshing"
        :is-starting="isStarting"
        @refresh="refreshGames"
        @join="handleJoinGame"
        @start="handleStartGame"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLobbyStore } from '@/stores/lobby'
import { useGameStore } from '@/stores/game'
import LobbyHeader from '@/components/lobby/LobbyHeader.vue'
import CreateGame from '@/components/lobby/CreateGame.vue'
import AvailableGames from '@/components/lobby/AvailableGames.vue'

const router = useRouter()
const authStore = useAuthStore()
const lobbyStore = useLobbyStore()
const gameStore = useGameStore()

const loading = ref(false)
const refreshing = ref(false)
const isStarting = ref(false)

let pendingSub: any = null
let refreshInterval: ReturnType<typeof setInterval> | null = null

const availableGames = computed(() => lobbyStore.availableGames)

const gamesWithMeta = computed(() => {
  const myUsername = authStore.user?.username
  return availableGames.value.map((game) => ({
    ...game,
    isHost: game.creatorUsername === myUsername,
    isInGame: game.players.some((p: any) => p.username === myUsername),
    canJoin: !game.players.some((p: any) => p.username === myUsername) && 
             game.players.length < game.maxPlayers
  }))
})

onMounted(async () => {
  loading.value = true
  await refreshGames()
  loading.value = false

  refreshInterval = setInterval(refreshGames, 5000)

  pendingSub = lobbyStore.subscribeToPendingGames(async (updatedGame) => {
    const myUsername = authStore.user?.username

    if (updatedGame === null) {
      const myGame = availableGames.value.find((g) =>
        g.players.some((p: any) => p.username === myUsername)
      )

      if (myGame) {
        await router.push(`/game/${myGame.id}`)
      }
    }
  })
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
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

async function handleCreateGame(name: string, maxPlayers: number, targetScore: number) {
  try {
    await lobbyStore.createGame(name, maxPlayers)
  } catch (error: any) {
    console.error('Failed to create game:', error)
    alert('Failed to create game: ' + error.message)
  }
}

async function handleJoinGame(gameId: string) {
  try {
    await lobbyStore.joinGame(gameId)
    await refreshGames()
  } catch (error: any) {
    console.error('Failed to join game:', error)
    alert('Failed to join game: ' + error.message)
  }
}

async function handleStartGame(gameId: string) {
  if (isStarting.value) {
    console.log('Already starting game, ignoring...')
    return
  }

  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }

  isStarting.value = true
  try {
    const result = await lobbyStore.startGame(gameId)
    gameStore.setGame(result)
    await router.push(`/game/${result.id}`)
  } catch (error: any) {
    console.error('Failed to start game:', error)
    alert('Failed to start game: ' + error.message)
    refreshInterval = setInterval(refreshGames, 5000)
  } finally {
    isStarting.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.lobby-view {
  min-height: 100vh;
  background: black;
  padding: 2rem;
}

.lobby-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .lobby-content {
    grid-template-columns: 1fr;
  }
}
</style>