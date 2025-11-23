"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Cookies from "js-cookie"
import type { RootState } from "../../store/store"
import type { Card, Round } from "../../../../model/dist/model/interfaces"
import connectWebSocket, { sendAction } from "../../utils/gameApi"

const COLORS = ["RED", "GREEN", "BLUE", "YELLOW"] as const
const colorMap: Record<string, string> = {
    RED: "#e74c3c",
    GREEN: "#2ecc71",
    BLUE: "#3498db",
    YELLOW: "#c1c100"
}

function cardPoints(card: Card): number {
    switch (card.type) {
        case "NUMBERED":
            return card.number
        case "DRAW":
        case "REVERSE":
        case "SKIP":
            return 20
        case "WILD":
        case "WILD DRAW":
            return 50
        default:
            return 0
    }
}

function describeCard(card: Card | undefined): string {
    if (!card) return "a card"
    const hasColor = "color" in card && (card as any).color
    const colorPart = hasColor ? `${(card as any).color} ` : ""
    if (card.type === "NUMBERED") {
        return `${colorPart}${card.number}`
    }
    return `${colorPart}${card.type}`
}

function clientCanPlay(
    card: Card,
    top: Card | undefined,
    currentColor: string | undefined
): boolean {
    if (card.type === "WILD" || card.type === "WILD DRAW") return true

    const cardColor = "color" in card ? (card as any).color : undefined
    const topColor = top && "color" in top ? (top as any).color : undefined
    const activeColor = currentColor ?? topColor

    if (card.type === "NUMBERED" && top?.type === "NUMBERED") {
        if (card.number === (top as any).number) return true
    }

    if (activeColor && cardColor === activeColor) return true

    if (
        (card.type === "SKIP" && top?.type === "SKIP") ||
        (card.type === "DRAW" && top?.type === "DRAW") ||
        (card.type === "REVERSE" && top?.type === "REVERSE")
    ) {
        return true
    }

    if (top && (top.type === "WILD" || top.type === "WILD DRAW")) {
        if (activeColor && cardColor === activeColor) return true
    }

    return false
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

        if (lastAction && lastPlayedBy !== undefined && lastPlayedBy >= 0) {
            const handSize = hands[lastPlayedBy]?.length ?? 0
            const top = discardPile[discardPile.length - 1]

            const topSig = top
                ? `${top.type}-${"color" in top ? (top as any).color ?? "" : ""}-${top.type === "NUMBERED" ? (top as any).number ?? "" : ""
                }`
                : "none"

            const eventId = `${lastAction}-${lastPlayedBy}-${handSize}-${topSig}`

            if (lastEventRef.current !== eventId) {
                lastEventRef.current = eventId
                const actor = players[lastPlayedBy]

                if (lastAction === "play") {
                    notify(`${actor} played ${describeCard(top)}`)
                } else if (lastAction === "draw") {
                    notify(`${actor} drew a card`)
                }
            }
        }
        if (playerInTurn === undefined && typeof winner === "number" && !hasShownWinner) {
            const pointsPerPlayer = roundState.hands.map(hand =>
                hand.reduce((sum, c) => sum + cardPoints(c), 0)
            )

            const scoreboard = roundState.players
                .map((name, idx) => ({
                    name,
                    points: pointsPerPlayer[idx]
                }))
                .sort((a, b) => b.points - a.points)

            const lines = scoreboard
                .map(s => `${s.name}: ${s.points} points`)
                .join("\n")

            alert(`Winner is ${roundState.players[winner]}!\n\nScores:\n${lines}`)
            setHasShownWinner(true)
            router.push("/lobby")
        }
    }, [roundState, hasShownWinner, router])

    if (!roundState) {
        return <div style={{ padding: 40 }}>Loading game...</div>
    }

    const round = roundState
    const playerIndex = round.players.indexOf(player)
    const isMyTurn = round.playerInTurn === playerIndex
    const topCard = round.discardPile.at(-1)
    const hand = round.hands[playerIndex] ?? []
    const last = round.lastPlayedBy

    function handlePlay(i: number, card: Card) {
        if (!isMyTurn) {
            notify("It is not your turn!")
            return
        }

        const top = round.discardPile.at(-1)
        if (!clientCanPlay(card, top, round.currentColor)) {
            notify("You cannot play this card!")
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
            notify("It is not your turn!")
            return
        }

        sendAction({
            type: "DRAW",
            payload: { gameId: id, player }
        })
    }

    function sayUnoClick() {
        const handSize = hand.length

        if (!isMyTurn) {
            notify("You can only say UNO on your turn!")
            return
        }

        if (handSize !== 1) {
            notify("You can only say UNO when you have exactly 1 card!")
            return
        }

        sendAction({
            type: "SAY_UNO",
            payload: { gameId: id, player }
        })
    }

    function callOutClick() {
        if (last === undefined) {
            notify("No player to call out!")
            return
        }

        const lastHandSize = round.hands[last]?.length ?? 0
        const lastUnoSaid = round.unoSaid[last]

        if (!(lastHandSize === 1 && !lastUnoSaid)) {
            notify("Nobody forgot to say UNO!")
            return
        }

        sendAction({
            type: "CALL_OUT",
            payload: {
                gameId: id,
                accuser: player,
                accused: round.players[last]
            }
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

            {/* ACTION BUTTONS */}
            <div style={{ marginTop: 30, display: "flex", gap: 20, justifyContent: "center" }}>
                {/* DRAW BUTTON */}
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

                {/* SAY UNO – ALWAYS VISIBLE */}
                <button
                    onClick={sayUnoClick}
                    style={{
                        padding: "10px 30px",
                        borderRadius: 10,
                        border: "2px solid black",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Say UNO!
                </button>

                {/* CALL OUT – ALWAYS VISIBLE */}
                <button
                    onClick={callOutClick}
                    style={{
                        padding: "10px 30px",
                        borderRadius: 10,
                        border: "2px solid black",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                >
                    Call Out UNO!
                </button>
            </div>

            {/* LOCAL NOTIFICATION TOAST */}
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