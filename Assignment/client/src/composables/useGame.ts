import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { gameService } from '@/services/api'
import { Color } from '../../../model/interfaces'

export function useGame() {
    const gameStore = useGameStore()

    const handlePlayCard = async (cardIndex: number, chosenColor?: Color) => {
        if (!gameStore.gameId) return

        const success = gameStore.playCard(cardIndex, chosenColor)

        if (success) {
            // Send to server
            const result = await gameService.playCard(
                gameStore.gameId,
                cardIndex,
                chosenColor
            )

            if (!result.success) {
                gameStore.addNotification('Server rejected the play')
            }
        }
    }

    const handleDrawCard = async () => {
        if (!gameStore.gameId) return

        gameStore.drawCard()
        await gameService.drawCard(gameStore.gameId)
    }

    const handleSayUno = async () => {
        if (!gameStore.gameId) return

        gameStore.sayUno()
        await gameService.sayUno(gameStore.gameId)
    }

    const handleCatchUno = async (accusedIndex: number) => {
        if (!gameStore.gameId) return

        gameStore.catchUnoFailure(accusedIndex)
        await gameService.catchUnoFailure(gameStore.gameId, accusedIndex)
    }

    const canPlayCard = (cardIndex: number) => {
        return gameStore.currentRound?.canPlay(cardIndex) ?? false
    }

    return {
        // State
        myHand: computed(() => gameStore.myHand),
        topCard: computed(() => gameStore.topCard),
        isMyTurn: computed(() => gameStore.isMyTurn),
        canSayUno: computed(() => gameStore.canSayUno),
        notifications: computed(() => gameStore.notifications),
        players: computed(() => gameStore.players),
        currentPlayerId: computed(() => gameStore.currentPlayerId),
        selectedCardIndex: computed(() => gameStore.selectedCardIndex),
        showColorPicker: computed(() => gameStore.showColorPicker),

        // Methods
        handlePlayCard,
        handleDrawCard,
        handleSayUno,
        handleCatchUno,
        canPlayCard,
        selectCard: gameStore.selectCard
    }
}