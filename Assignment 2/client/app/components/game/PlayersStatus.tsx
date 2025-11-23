interface Props {
    players: string[]
    hands: any[]
    currentPlayerIndex: number | undefined
    me: string
}

export default function PlayersStatus({
    players,
    hands,
    currentPlayerIndex,
    me
}: Props) {
    return (
        <div style={{ marginBottom: 30 }}>
            <h3>Players</h3>

            <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                {players.map((p, i) => {
                    if (p === me) return null

                    const isTurn = currentPlayerIndex === i
                    const cardCount = hands[i]?.length ?? 0

                    return (
                        <div
                            key={p}
                            style={{
                                padding: "10px 15px",
                                border: "2px solid black",
                                borderRadius: 10,
                                background: isTurn ? "#ffeaa7" : "#dfe6e9"
                            }}
                        >
                            <strong>{p}</strong>
                            <div>{cardCount} cards</div>
                            {isTurn && (
                                <div style={{ color: "green", fontWeight: "bold" }}>
                                    Playing...
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}