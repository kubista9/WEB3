"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import type { RootState } from "../store/store"
import { connectWebSocket } from "../api/ws"
import { lobbyApi, setOnGameStart } from "../api/lobbyApi"
import PlayerHeader from "../components/lobby/PlayerHeader"
import CreateGameForm from "../components/lobby/CreateGame"
import GameList from "../components/lobby/GameList"

export default function LobbyPage() {
    const router = useRouter()
    const [player, setPlayer] = useState<string | null>(null)
    const lobby = useSelector((state: RootState) => state.lobby)
    const [maxPlayers, setMaxPlayers] = useState(4)

    useEffect(() => {
        const p = Cookies.get("player")
        if (!p) {
            router.push("/login")
            return
        }
        setPlayer(p)
    }, [router])

    useEffect(() => {
        connectWebSocket()
        lobbyApi.getLobby()

        setOnGameStart((gameId) => router.push(`/game/${gameId}`))
    }, [player])

    if (!player)
        return <div style={{ padding: 40 }}>Loading...</div>

    return (
        <div style={{ padding: 40 }}>
            <h1>Lobby</h1>

            <PlayerHeader player={player} />

            <CreateGameForm
                player={player}
                maxPlayers={maxPlayers}
                setMaxPlayers={setMaxPlayers}
            />

            <GameList lobby={lobby} player={player} />
        </div>
    )
}