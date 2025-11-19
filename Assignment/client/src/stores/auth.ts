import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../api/authService'
import { jwtDecode } from 'jwt-decode'

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

  function loadUserFromToken() {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return
    try {
      const decoded: any = jwtDecode(storedToken)
      user.value = { id: decoded.username, username: decoded.username }
      token.value = storedToken
      console.log('AUTH Restored user from token:', user.value)
    } catch (err) {
      console.error('AUTH Failed to decode token:', err)
      logout()
    }
  }

  return { user, token, isAuthenticated, login, register, logout, loadUserFromToken }
})