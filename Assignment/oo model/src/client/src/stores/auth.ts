import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{ id: string; username: string } | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(username: string, password: string) {
    const response = await authService.login(username, password)
    user.value = response.user
    token.value = response.token
    localStorage.setItem('token', response.token)
  }

  async function register(username: string, password: string) {
    const response = await authService.register(username, password)
    user.value = response.user
    token.value = response.token
    localStorage.setItem('token', response.token)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isAuthenticated, login, register, logout }
})