<template>
  <div class="other-players">
    <div
      v-for="player in players"
      :key="player.username"
      class="player-card"
      :class="{ current: player.isCurrent }"
    >
      <div class="player-name">{{ player.username }}</div>
      <div class="card-count">🃏 {{ player.cardCount }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface PlayerInfo {
  username: string
  cardCount: number
  isCurrent: boolean
}

defineProps<{
  players: PlayerInfo[]
}>()
</script>

<style scoped>
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
</style>