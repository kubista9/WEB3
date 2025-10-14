<template>
  <main class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-3xl font-bold mb-4">UNO Multiplayer</h1>
    <input
      v-model="name"
      placeholder="Enter your name"
      class="border px-4 py-2 rounded mb-4"
    />
    <button @click="login" class="bg-blue-500 text-white px-4 py-2 rounded">
      Enter Lobby
    </button>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game'

const name = ref('')
const router = useRouter()
const store = useGameStore()

function login() {
  if (!name.value.trim()) return
  store.setPlayer(name.value)
  router.push('/lobby')
}
</script>
