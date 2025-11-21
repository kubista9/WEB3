"use client"

import { webSocket, WebSocketSubject } from "rxjs/webSocket"
import { store } from "../store/store"
import { setLobby } from "../features/lobby/lobbySlice"
import { setState, setGameId, setConnected } from "../features/game/gameSlice"
import { push } from "../features/notifications/notifycationSlice"

export interface LobbyGame {
    id: string
    host: string
    name: string
    players: string[]
    maxPlayers: number
}

interface ServerMessage {
    type:
    | "LOBBY_UPDATE"
    | "PLAYER_JOINED"
    | "REGISTER_RESULT"
    | "LOGIN_RESULT"
    | "GAME_STARTED"
    | "GAME_STATE"
    lobby?: LobbyGame[]
    ok?: boolean
    id?: string
    state?: any
    gameId?: string
}

export interface ClientAction {
    type: string
    payload?: Record<string, unknown>
}

const WS_URL = "ws://localhost:4000"
let socket$: WebSocketSubject<any> | null = null
let onLoginSuccess: (() => void) | null = null
let onGameStart: ((id: string) => void) | null = null

export function setOnLoginSuccess(cb: () => void) {
    onLoginSuccess = cb
}

export function setOnGameStart(cb: (id: string) => void) {
    onGameStart = cb
}

let isConnecting = false

export default function connectWebSocket() {
    if (socket$ || isConnecting) return socket$
    isConnecting = true

    socket$ = webSocket({ url: WS_URL })

    socket$.subscribe({
        next: (msg: ServerMessage) => {
            console.log("RAW MESSAGE FROM SERVER:", msg)
            console.log("WS -> client received:", msg)
            switch (msg.type) {
                case "LOBBY_UPDATE":
                    if (msg.lobby) {
                        store.dispatch(setLobby(msg.lobby))
                    }
                    break

                case "PLAYER_JOINED":
                    store.dispatch(push("A player joined the lobby"))
                    break

                case "REGISTER_RESULT":
                    msg.ok
                        ? store.dispatch(push("Registered successfully"))
                        : store.dispatch(push("Username already exists"))
                    break

                case "LOGIN_RESULT":
                    if (msg.ok) {
                        store.dispatch(push("Logged in successfully"))
                        if (onLoginSuccess) onLoginSuccess()
                    } else {
                        store.dispatch(push("Invalid login"))
                    }
                    break

                case "GAME_STARTED":
                    if (msg.id) {
                        store.dispatch(setGameId(msg.id))
                        if (onGameStart) onGameStart(msg.id)
                    }
                    break

                case "GAME_STATE":
                    if (msg.state && msg.gameId) {
                        store.dispatch(setState({
                            gameId: msg.gameId,
                            state: msg.state
                        }))
                    }
                    break

            }
        },
        error: (err) => {
            console.error("WS error:", err)
            store.dispatch(setConnected(false))
        },
        complete: () => {
            console.warn("WS completed")
            store.dispatch(setConnected(false))
            socket$ = null
        }
    })

    store.dispatch(setConnected(true))
    return socket$
}

export function sendAction(action: ClientAction) {
    console.log("CLIENT -> WS sending:", action)
    if (!socket$) {
        console.warn("Trying to send over WS before connection exists")
        return
    }
    socket$.next(action)
}