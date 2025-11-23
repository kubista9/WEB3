"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import type { RootState } from "../store/store"
import type { LobbyGame } from "../api/lobbyApi"
import { connectWebSocket } from "../api/ws"
import { lobbyApi, setOnGameStart } from "../api/lobbyApi"

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

            <p>You are logged in as: {player}</p>

            {/* CREATE GAME */}
            <div style={{ marginBottom: 20 }}>
                <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                </select>

                <button
                    onClick={() =>
                        lobbyApi.createGame(player, maxPlayers)
                    }
                    style={{ marginLeft: 10 }}
                >
                    Create Game
                </button>
            </div>

            {/* LIST OF GAMES */}
            <h2>Available Games</h2>

            {lobby.length === 0 && <p>No games available.</p>}

            {lobby.map((g: LobbyGame) => {
                const alreadyJoined = g.players.includes(player)
                const isHost = g.host === player

                return (
                    <div key={g.id} style={{ marginBottom: 10 }}>
                        <strong>{g.name}</strong>
                        <span> ({g.players.length}/{g.maxPlayers})</span>

                        {isHost && alreadyJoined && (
                            <button
                                onClick={() => lobbyApi.startGame(g.id)}
                                style={{ marginLeft: 10 }}
                            >
                                Start Game
                            </button>
                        )}

                        {!isHost && alreadyJoined && (
                            <span style={{ marginLeft: 10 }}>
                                Waiting for host to start…
                            </span>
                        )}

                        {!alreadyJoined && g.players.length < g.maxPlayers && (
                            <button
                                onClick={() => lobbyApi.joinGame(g.id, player)}
                                style={{ marginLeft: 10 }}
                            >
                                Join
                            </button>
                        )}

                        {!alreadyJoined && g.players.length >= g.maxPlayers && (
                            <button disabled style={{ marginLeft: 10 }}>
                                Full
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
