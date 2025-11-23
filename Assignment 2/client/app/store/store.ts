import notificationReducer from "../features/notificationSlice"
import { configureStore } from "@reduxjs/toolkit"
import lobbyReducer from "../features/lobbySlice"
import gameReducer from "../features/gameSlice"

export const store = configureStore({
    reducer: {
        game: gameReducer,
        lobby: lobbyReducer,
        notifications: notificationReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch