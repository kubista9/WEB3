import { lobbyApi } from "./../../api/lobbyApi"

interface CreateGameProps {
    player: string
    maxPlayers: number
    setMaxPlayers: (n: number) => void
}

export default function CreateGame({ player, maxPlayers, setMaxPlayers }: CreateGameProps) {
    return (
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
                onClick={() => lobbyApi.createGame(player, maxPlayers)}
                style={{ marginLeft: 10 }}
            >
                Create Game
            </button>
        </div>
    )
}