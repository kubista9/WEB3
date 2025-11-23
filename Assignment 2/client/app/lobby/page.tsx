"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import connectWebSocket, { sendAction, setOnGameStart } from "../api/gameApi"
import type { LobbyGame } from "../api/gameApi"
import type { RootState } from "../store/store"

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
        sendAction({ type: "GET_LOBBY" })

        setOnGameStart((id) => router.push(`/game/${id}`))
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
                        sendAction({
                            type: "CREATE_GAME",
                            payload: { host: player, maxPlayers },
                        })
                    }
                    style={{ marginLeft: 10 }}
                >
                    Create Game
                </button>
            </div>

            {/* LOBBY LIST */}
            <h2>Available Games</h2>

            {lobby.length === 0 && <p>No games available.</p>}

            {lobby.map((g: LobbyGame) => {
                const alreadyJoined = g.players.includes(player)
                const isHost = g.host === player

                return (
                    <div key={g.id} style={{ marginBottom: 10 }}>
                        <strong>{g.name}</strong>
                        <span> ({g.players.length}/{g.maxPlayers})</span>

                        {/* HOST VIEW */}
                        {isHost && alreadyJoined && (
                            <button
                                onClick={() =>
                                    sendAction({
                                        type: "START_GAME",
                                        payload: { id: g.id },
                                    })
                                }
                                style={{ marginLeft: 10 }}
                            >
                                Start Game
                            </button>
                        )}

                        {/* GUEST VIEW */}
                        {!isHost && alreadyJoined && (
                            <span style={{ marginLeft: 10 }}>
                                Waiting for host to start…
                            </span>
                        )}

                        {/* JOIN BUTTON */}
                        {!alreadyJoined && g.players.length < g.maxPlayers && (
                            <button
                                onClick={() =>
                                    sendAction({
                                        type: "JOIN_GAME",
                                        payload: { id: g.id, player },
                                    })
                                }
                                style={{ marginLeft: 10 }}
                            >
                                Join
                            </button>
                        )}

                        {/* FULL GAME */}
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