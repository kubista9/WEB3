import type { Card } from "@model/dist/model/interfaces"

interface HandProps {
    hand: Card[]
    isMyTurn: boolean
    onPlay: (index: number, card: Card) => void
}

export default function Hand({ hand, isMyTurn, onPlay }: HandProps) {
    return (
        <div
            style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap"
            }}
        >
            {hand.map((card, i) => {
                const bg = "color" in card && card.color ? card.color.toLowerCase() : "#555"

                return (
                    <button
                        key={i}
                        onClick={() => onPlay(i, card)}
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
    )
}