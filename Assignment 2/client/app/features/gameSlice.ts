import type { Round } from "@model/src/interfaces"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface GameState {
    state: Round | null
    connected: boolean
    gameId: string | null
}

const initialState: GameState = {
    state: null,
    connected: false,
    gameId: null
}

export const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setState(state, action) {
            state.gameId = action.payload.gameId
            state.state = action.payload.state
        },
        setConnected(state, action: PayloadAction<boolean>) {
            state.connected = action.payload
        },
        setGameId(state, action: PayloadAction<string | null>) {
            state.gameId = action.payload
        }
    }
})

export const { setState, setConnected, setGameId } = gameSlice.actions
export default gameSlice.reducer