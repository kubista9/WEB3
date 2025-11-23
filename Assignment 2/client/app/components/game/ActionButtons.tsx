interface ActionButtonsProps {
    isMyTurn: boolean
    onDraw: () => void
    onSayUno: () => void
    onCallOut: () => void
}

export default function ActionButtons({
    isMyTurn,
    onDraw,
    onSayUno,
    onCallOut
}: ActionButtonsProps) {
    return (
        <div style={{ marginTop: 30, display: "flex", gap: 20, justifyContent: "center" }}>
            <button
                onClick={onDraw}
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
                onClick={onSayUno}
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
                onClick={onCallOut}
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
    )
}
