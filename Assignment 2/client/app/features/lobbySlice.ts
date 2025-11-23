import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface LobbyGame {
    id: string
    host: string
    name: string
    players: string[]
    maxPlayers: number
}

const initialState: LobbyGame[] = []

export const lobbySlice = createSlice({
    name: "lobby",
    initialState,
    reducers: {
        setLobby(_, action: PayloadAction<LobbyGame[]>) {
            return action.payload
        },
        addGame(state, action: PayloadAction<LobbyGame>) {
            state.push(action.payload)
        },
        updateGame(state, action: PayloadAction<LobbyGame>) {
            const index = state.findIndex(g => g.id === action.payload.id)
            if (index !== -1) state[index] = action.payload
        }
    }
})

export const { setLobby, addGame, updateGame } = lobbySlice.actions
export default lobbySlice.reducer