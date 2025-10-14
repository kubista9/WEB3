import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { Round } from '../../../model/round'
import { Game } from '../../../model/game'
import { Card, Color } from '../../../model/interfaces'

export const useGameStore = defineStore('game', () => {

  // State
  const gameId = ref<string | null>(null)
  const game = ref<Game | null>(null)
  const currentRound = ref<Round | null>(null)
  const players = ref<string[]>([])
  const currentPlayerId = ref<number | null>(null)
  const selectedCardIndex = ref<number | null>(null)
  const showColorPicker = ref(false)
  const notifications = ref<string[]>([])


  // Computed
  const myHand = computed(() => {
    if (!currentRound.value || currentPlayerId.value === null) return []
    return currentRound.value.playerHand(currentPlayerId.value)
  })

  const topCard = computed(() => {
    return currentRound.value?.discardPile().top()
  })

  const isMyTurn = computed(() => {
    return currentRound.value?.playerInTurn() === currentPlayerId.value
  })

  const canSayUno = computed(() => {
    return myHand.value.length === 2
  })



  // Actions
  function initializeGame(gameData: any) {
    gameId.value = gameData.id
    players.value = gameData.players
    currentPlayerId.value = gameData.myPlayerIndex

    if (gameData.gameState) {
      game.value = Game.fromMemento(gameData.gameState)
      currentRound.value = game.value.currentRound() || null

      // Observer pattern: subscribe to round events
      if (currentRound.value) {
        currentRound.value.onEnd((event) => {
          addNotification(`Player ${event.winner + 1} wins this round!`)
        })
      }
    }
  }


  function playCard(cardIndex: number, chosenColor?: Color) {
    if (!currentRound.value || !isMyTurn.value) return false

    try {
      const card = currentRound.value.play(cardIndex, chosenColor)
      selectedCardIndex.value = null
      showColorPicker.value = false

      addNotification(`You played ${card.type}`)

      if (myHand.value.length === 0) {
        addNotification('You won!')
      }

      return true
    } catch (error) {
      addNotification(`Cannot play that card: ${error.message}`)
      return false
    }
  }

  function drawCard() {
    if (!currentRound.value || !isMyTurn.value) return

    try {
      currentRound.value.draw()
      addNotification('Drew a card')
    } catch (error) {
      addNotification(`Error: ${error.message}`)
    }
  }

  function sayUno() {
    if (!currentRound.value || currentPlayerId.value === null) return

    try {
      currentRound.value.sayUno(currentPlayerId.value)
      addNotification('UNO!')
    } catch (error) {
      addNotification(`Error: ${error.message}`)
    }
  }

  function catchUnoFailure(accusedPlayerIndex: number) {
    if (!currentRound.value || currentPlayerId.value === null) return

    const success = currentRound.value.catchUnoFailure({
      accuser: currentPlayerId.value,
      accused: accusedPlayerIndex
    })

    if (success) {
      addNotification(`You caught Player ${accusedPlayerIndex + 1}! They draw 4 cards.`)
    } else {
      addNotification('Invalid UNO catch attempt')
    }
  }

  function selectCard(index: number) {
    if (!isMyTurn.value) return

    selectedCardIndex.value = index
    const card = myHand.value[index]

    if (card.type === 'WILD CARD' || card.type === 'WILD DRAW') {
      showColorPicker.value = true
    }
  }

  function addNotification(message: string) {
    notifications.value.push(message)
    setTimeout(() => {
      notifications.value.shift()
    }, 3000)
  }

  function updateFromServer(serverState: any) {
    // Update game state from GraphQL subscription
    if (serverState.currentRound) {
      currentRound.value = Round.fromMemento(serverState.currentRound)
    }
  }

  function setPlayer(playerName: string) {
    // If single player:
    players.value = [playerName]

    // If multiplayer setup:
    const index = players.value.findIndex(p => p === playerName)
    if (index === -1) {
      players.value.push(playerName)
    }

    currentPlayerId.value = players.value.indexOf(playerName)
  }

  // Watch for round changes (Observer pattern)
  watch(currentRound, (newRound) => {
    if (newRound && newRound.hasEnded()) {
      addNotification('Round ended!')
    }
  })

  return {
    // State
    gameId,
    game,
    currentRound,
    players,
    currentPlayerId,
    selectedCardIndex,
    showColorPicker,
    notifications,
    setPlayer,

    // Computed
    myHand,
    topCard,
    isMyTurn,
    canSayUno,

    // Actions
    initializeGame,
    playCard,
    drawCard,
    sayUno,
    catchUnoFailure,
    selectCard,
    addNotification,
    updateFromServer
  }
})