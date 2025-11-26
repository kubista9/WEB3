import type { Card, Color } from "@model/src/interfaces"

interface DiscardCardProps {
    topCard: Card | undefined
    currentColor?: Color
}

const colorMap: Record<string, string> = {
    RED: "#e74c3c",
    GREEN: "#2ecc71",
    BLUE: "#3498db",
    YELLOW: "#c1c100"
}

export default function DiscardCard({ topCard, currentColor }: DiscardCardProps) {
    return (
        <div>
            <div
                style={{
                    margin: "25px auto",
                    width: 140,
                    height: 140,
                    borderRadius: 12,
                    background: currentColor ? colorMap[currentColor] : "#eee",
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
        </div>
    )
}