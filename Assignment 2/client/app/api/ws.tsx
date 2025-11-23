"use client"

import { webSocket, WebSocketSubject } from "rxjs/webSocket"
import { setConnected } from "../features/gameSlice"
import { store } from "../store/store"

export interface ServerMessage {
    type: string
    [key: string]: any
}

const WS_URL = "ws://localhost:4000"
let socket$: WebSocketSubject<any> | null = null
let isConnecting = false

const loginHandlers = new Map<string, Function>()
const lobbyHandlers = new Map<string, Function>()
const gameHandlers = new Map<string, Function>()

export function registerHandler(type: string, fn: Function, scope: "login" | "lobby" | "game") {
    if (scope === "login") loginHandlers.set(type, fn)
    else if (scope === "lobby") lobbyHandlers.set(type, fn)
    else gameHandlers.set(type, fn)
}

export function send(action: any) {
    if (!socket$) {
        console.warn("WS not connected yet")
        return
    }
    socket$.next(action)
}

export function connectWebSocket() {
    if (socket$ || isConnecting) return socket$

    isConnecting = true
    socket$ = webSocket({ url: WS_URL })

    socket$.subscribe({
        next: (msg: ServerMessage) => {
            if (loginHandlers.has(msg.type))
                loginHandlers.get(msg.type)!(msg)

            if (lobbyHandlers.has(msg.type))
                lobbyHandlers.get(msg.type)!(msg)

            if (gameHandlers.has(msg.type))
                gameHandlers.get(msg.type)!(msg)
        },

        error: (err) => {
            console.error("WS error:", err)
            store.dispatch(setConnected(false))
        },

        complete: () => {
            console.warn("WS closed")
            store.dispatch(setConnected(false))
            socket$ = null
        }
    })

    store.dispatch(setConnected(true))
    return socket$
}