"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Cookies from "js-cookie"
import type { RootState } from "../../store/store"
import type { Card, Round, Color } from "@model/dist/model/interfaces"
import { connectWebSocket } from "../../api/ws"
import { gameApi } from "../../api/gameApi"
import { cardValue, canPlay } from "@model/src/round"

const colorMap: Record<string, string> = {
    RED: "#e74c3c",
    GREEN: "#2ecc71",
    BLUE: "#3498db",
    YELLOW: "#c1c100"
}

function describeCard(card: Card | undefined): string {
    if (!card) return "a card"
    const hasColor = "color" in card && (card as any).color
    const colorPart = hasColor ? `${(card as any).color} ` : ""
    if (card.type === "NUMBERED") return `${colorPart}${card.number}`
    return `${colorPart}${card.type}`
}

export default function GameRoomPage() {
    const { id } = useParams()
    const router = useRouter()
    const player = Cookies.get("player") ?? "Unknown"

    const roundState: Round | null = useSelector((state: RootState) => state.game.state)

    const [showPicker, setShowPicker] = useState(false)
    const [pendingCard, setPendingCard] = useState<{ index: number; card: Card } | null>(null)
    const [localNote, setLocalNote] = useState<string | null>(null)

    const lastEventRef = useRef<string | null>(null)
    const [hasShownWinner, setHasShownWinner] = useState(false)

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

    useEffect(() => {
        if (!roundState) return

        const {
            lastAction,
            lastPlayedBy,
            discardPile,
            hands,
            players,
            playerInTurn,
            winner
        } = roundState

        if (lastAction && typeof lastPlayedBy === "number") {
            const handSize = hands[lastPlayedBy]?.length ?? 0
            const top = discardPile[discardPile.length - 1]

            const sig = `${lastAction}-${lastPlayedBy}-${handSize}-${top?.type}-${(top as any)?.color ?? ""}-${(top as any)?.number ?? ""}`

            if (lastEventRef.current !== sig) {
                lastEventRef.current = sig

                const actor = players[lastPlayedBy]

                if (lastAction === "play") notify(`${actor} played ${describeCard(top)}`)
                if (lastAction === "draw") notify(`${actor} drew a card`)
            }
        }

        if (playerInTurn === undefined && typeof winner === "number" && !hasShownWinner) {
            const pointsPerPlayer = roundState.hands.map(hand =>
                hand.reduce((sum, c) => sum + cardValue(c), 0)
            )

            const scoreboard = roundState.players
                .map((name, idx) => ({
                    name,
                    points: pointsPerPlayer[idx]
                }))
                .sort((a, b) => b.points - a.points)

            const lines = scoreboard.map(s => `${s.name}: ${s.points} points`).join("\n")

            alert(`Winner is ${roundState.players[winner]}!\n\nScores:\n${lines}`)
            setHasShownWinner(true)
            router.push("/lobby")
        }
    }, [roundState, hasShownWinner, router])

    if (!roundState)
        return <div style={{ padding: 40 }}>Loading game...</div>

    const round = roundState
    const playerIndex = round.players.indexOf(player)
    const isMyTurn = round.playerInTurn === playerIndex
    const topCard = round.discardPile.at(-1)
    const hand = round.hands[playerIndex] ?? []
    const last = round.lastPlayedBy

    function handlePlay(i: number, card: Card) {
        if (!isMyTurn) return notify("It is not your turn!")

        const top = round.discardPile.at(-1)
        if (!canPlay(i, round)) {
            return notify("You cannot play this card!")
        }

        if (card.type === "WILD" || card.type === "WILD DRAW") {
            setPendingCard({ index: i, card })
            setShowPicker(true)
            return
        }

        gameApi.play(id, player, i)
    }

    function drawCard() {
        if (!isMyTurn) return notify("It is not your turn!")
        gameApi.draw(id, player)
    }

    function sayUnoClick() {
        if (!isMyTurn) return notify("You can only say UNO on your turn!")
        if (hand.length !== 1) return notify("You must have exactly 1 card!")
        gameApi.sayUno(id, player)
    }

    function callOutClick() {
        if (last === undefined) return notify("No player to call out!")
        const lastHand = round.hands[last]?.length ?? 0
        const lastUno = round.unoSaid[last]

        if (!(lastHand === 1 && !lastUno)) return notify("Nobody forgot UNO!")
        gameApi.callOut(id, player, round.players[last])
    }

    return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <h1>Uno Game</h1>

            <h2>Current Player: {round.players[round.playerInTurn ?? 0]}</h2>

            {/* Discard card */}
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
                {topCard?.type}{topCard?.type === "NUMBERED" && ` ${topCard.number}`}
            </div>

            <div style={{ marginBottom: 20 }}>Discard Pile</div>

            {/* Player hand */}
            <div
                style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}
            >
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

            {/* Action buttons */}
            <div style={{ marginTop: 30, display: "flex", gap: 20, justifyContent: "center" }}>
                <button
                    onClick={drawCard}
                    style={{
                        padding: "10px 30px",
                        borderRadius: 10,
                        border: "2px solid black",
                        background: "white",
                        cursor: isMyTurn ? "pointer" : "not-allowed",
                        opacity: isMyTurn ? 1 : 0.4
                    }}
                >
                    Draw Card
                </button>

                <button
                    onClick={sayUnoClick}
                    style={{
                        padding: "10px 30px",
                        borderRadius: 10,
                        border: "2px solid black",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Say UNO!
                </button>

                <button
                    onClick={callOutClick}
                    style={{
                        padding: "10px 30px",
                        borderRadius: 10,
                        border: "2px solid black",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Call Out UNO!
                </button>
            </div>

            {/* Toast */}
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

            {/* Wild picker modal */}
            {showPicker && pendingCard && (
                <div
                    onClick={() => setShowPicker(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "white",
                            padding: 20,
                            borderRadius: 10,
                            display: "flex",
                            gap: 20
                        }}
                    >
                        {Object.entries(colorMap).map(([c, hex]) => (
                            <button
                                key={c}
                                onClick={() => {
                                    gameApi.play(id, player, pendingCard.index, c as Color)
                                    setShowPicker(false)
                                    setPendingCard(null)
                                }}
                                style={{
                                    background: hex,
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