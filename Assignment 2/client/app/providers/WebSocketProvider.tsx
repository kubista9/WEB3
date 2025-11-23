"use client"

import connectWebSocket from "../api/gameApi"
import { useEffect } from "react"

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        connectWebSocket()
    }, [])

    return <>{children}</>
}