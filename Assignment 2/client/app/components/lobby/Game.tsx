import { LobbyGame, lobbyApi } from "../../api/lobbyApi"

interface Props {
    game: LobbyGame
    player: string
}

export default function Game({ game, player }: Props) {
    const alreadyJoined = game.players.includes(player)
    const isHost = game.host === player

    return (
        <div style={{ marginBottom: 10 }}>
            <strong>{game.name}</strong>
            <span> ({game.players.length}/{game.maxPlayers})</span>

            {isHost && alreadyJoined && (
                <button
                    onClick={() => lobbyApi.startGame(game.id)}
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

            {!alreadyJoined && game.players.length < game.maxPlayers && (
                <button
                    onClick={() => lobbyApi.joinGame(game.id, player)}
                    style={{ marginLeft: 10 }}
                >
                    Join
                </button>
            )}

            {!alreadyJoined && game.players.length >= game.maxPlayers && (
                <button disabled style={{ marginLeft: 10 }}>
                    Full
                </button>
            )}
        </div>
    )
}