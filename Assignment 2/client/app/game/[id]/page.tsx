"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Cookies from "js-cookie"
import type { RootState } from "../../store/store"
import type { Card, Round } from "../../../../model/dist/model/interfaces"
import connectWebSocket, { sendAction } from "../../utils/gameApi"

const COLORS = ["RED", "GREEN", "BLUE", "YELLOW"]
const colorMap: Record<string, string> = {
    RED: "#e74c3c",
    GREEN: "#2ecc71",
    BLUE: "#3498db",
    YELLOW: "#f1c40f"
}

export default function GameRoomPage() {
    const { id } = useParams()
    const router = useRouter()

    const player = Cookies.get("player") ?? "Unknown"
    const round: Round | null = useSelector((state: RootState) => state.game.state)
    const [showPicker, setShowPicker] = useState(false)
    const [pendingCard, setPendingCard] = useState<{ index: number; card: Card } | null>(null)
    const [localNote, setLocalNote] = useState<string | null>(null)
    function notify(msg: string) {
        setLocalNote(msg)
        setTimeout(() => setLocalNote(null), 2000)
    }

    useEffect(() => {
        connectWebSocket()
    }, [])

    useEffect(() => {
        if (!id) router.push("/lobby")
    }, [id, router])

    if (!round) {
        return <div style={{ padding: 40 }}>Loading game...</div>
    }

    const playerIndex = round.players.indexOf(player)
    const isMyTurn = round.playerInTurn === playerIndex
    const topCard = round.discardPile.at(-1)
    const hand = round.hands[playerIndex] ?? []

    function handlePlay(i: number, card: Card) {
        if (!isMyTurn) {
            notify("❌ It is not your turn!")
            return
        }

        if (card.type === "WILD" || card.type === "WILD DRAW") {
            setPendingCard({ index: i, card })
            setShowPicker(true)
            return
        }

        sendAction({
            type: "PLAY",
            payload: {
                gameId: id,
                player,
                index: i
            }
        })
    }

    function drawCard() {
        if (!isMyTurn) {
            notify("❌ It is not your turn!")
            return
        }

        sendAction({
            type: "DRAW",
            payload: { gameId: id, player }
        })
    }

    return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <h1>Uno Game</h1>

            <h2>Current Player: {round.players[round.playerInTurn ?? 0]}</h2>

            {/* DISCARD PILE */}
            <div
                style={{
                    margin: "25px auto",
                    width: 140,
                    height: 140,
                    borderRadius: 12,
                    background: round.currentColor ? colorMap[round.currentColor] : "#eee",
                    border: "3px solid black",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "white"
                }}
            >
                {topCard?.type}
                {topCard?.type === "NUMBERED" && ` ${topCard.number}`}
            </div>


            <div style={{ marginBottom: 20 }}>Discard Pile</div>

            {/* PLAYER HAND */}
            <div style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap"
            }}>
                {hand.map((card, i) => {
                    const bg =
                        "color" in card && card.color
                            ? card.color.toLowerCase()
                            : "#555"

                    return (
                        <button
                            key={i}
                            onClick={() => handlePlay(i, card)}
                            style={{
                                cursor: "pointer",
                                padding: "18px 12px",
                                minWidth: 80,
                                borderRadius: 10,
                                border: "2px solid black",
                                background: bg,
                                color: "white",
                                textAlign: "center",
                                fontWeight: "bold",
                                opacity: isMyTurn ? 1 : 0.4
                            }}
                        >
                            {card.type}
                            {card.type === "NUMBERED" && ` ${card.number}`}
                        </button>
                    )
                })}
            </div>

            {/* DRAW BUTTON */}
            <button
                onClick={drawCard}
                style={{
                    marginTop: 30,
                    padding: "10px 30px",
                    borderRadius: 10,
                    border: "2px solid black",
                    background: "white",
                    cursor: "pointer",
                    opacity: isMyTurn ? 1 : 0.4
                }}
            >
                Draw Card
            </button>

            {/* LOCAL NOTIFICATION (NOT TURN) */}
            {localNote && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        background: "black",
                        color: "white",
                        padding: "10px 16px",
                        borderRadius: 6,
                        fontSize: 14
                    }}
                >
                    {localNote}
                </div>
            )}

            {/* WILD COLOR PICKER */}
            {showPicker && pendingCard && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onClick={() => setShowPicker(false)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: 20,
                            borderRadius: 10,
                            display: "flex",
                            gap: 20,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => {
                                    sendAction({
                                        type: "PLAY",
                                        payload: {
                                            index: pendingCard.index,
                                            gameId: id,
                                            player,
                                            color: c
                                        }
                                    })
                                    setShowPicker(false)
                                    setPendingCard(null)
                                }}
                                style={{
                                    background: c.toLowerCase(),
                                    color: "white",
                                    padding: 20,
                                    borderRadius: 10,
                                    fontWeight: "bold"
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}