import type { Round } from "@model/src/interfaces"

interface Props {
    player: string
    round: Round
}

export default function GameHeader({ player, round }: Props) {
    const playerIndex = round.players.indexOf(player)
    const isMyTurn = round.playerInTurn === playerIndex

    return (
        <div style={{ marginBottom: 20 }}>
            <h1>UNO Game</h1>

            <h2>
                You are: <span style={{ fontWeight: "bold" }}>{player}</span>
            </h2>

            <h2 style={{ marginTop: 10 }}>
                {isMyTurn ? (
                    <span style={{ color: "green" }}>It is YOUR turn!</span>
                ) : (
                    <>Current Player: {round.players[round.playerInTurn ?? 0]}</>
                )}
            </h2>
        </div>
    )
}