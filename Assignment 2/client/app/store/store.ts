import { configureStore } from "@reduxjs/toolkit"
import gameReducer from "../features/game/gameSlice"
import lobbyReducer from "../features/lobby/lobbySlice"
import notificationReducer from "../features/notifications/notificationSlice"

export const store = configureStore({
    reducer: {
        game: gameReducer,
        lobby: lobbyReducer,
        notifications: notificationReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch