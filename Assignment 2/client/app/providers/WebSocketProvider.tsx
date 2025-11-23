"use client"

import { useEffect } from "react"
import { connectWebSocket } from "../api/ws"
import "../api/loginApi"
import "../api/lobbyApi"
import "../api/gameApi"

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        connectWebSocket()
    }, [])

    return <>{children}</>
}