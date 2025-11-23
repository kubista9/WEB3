"use client"

import { registerHandler, send, ServerMessage } from "./ws"
import { push } from "../features/notificationSlice"
import { setLobby } from "../features/lobbySlice"
import { store } from "../store/store"

export interface LobbyGame {
    id: string
    host: string
    name: string
    players: string[]
    maxPlayers: number
}

let onGameStart: ((id: string) => void) | null = null

export function setOnGameStart(cb: (id: string) => void) {
    onGameStart = cb
}

registerHandler("LOBBY_UPDATE", (msg: ServerMessage) => {
    if (msg.lobby) store.dispatch(setLobby(msg.lobby))
}, "lobby")

registerHandler("PLAYER_JOINED", () => {
    store.dispatch(push("A player joined the lobby"))
}, "lobby")

registerHandler("GAME_STARTED", (msg: ServerMessage) => {
    onGameStart?.(msg.id)
}, "lobby")

export const lobbyApi = {
    getLobby() {
        send({ type: "GET_LOBBY" })
    },

    createGame(host: string, maxPlayers: number) {
        send({ type: "CREATE_GAME", payload: { host, maxPlayers } })
    },

    joinGame(id: string, player: string) {
        send({ type: "JOIN_GAME", payload: { id, player } })
    },

    startGame(id: string) {
        send({ type: "START_GAME", payload: { id } })
    }
}