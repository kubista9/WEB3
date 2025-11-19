"use client"

import { useEffect } from "react"
import connectWebSocket from "../utils/gameApi"

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        connectWebSocket()
    }, [])

    return <>{children}</>
}