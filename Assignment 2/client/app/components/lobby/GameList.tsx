import type { LobbyGame } from "../../api/lobbyApi"
import GameListItem from "./Game"

interface Props {
    lobby: LobbyGame[]
    player: string
}

export default function GameList({ lobby, player }: Props) {
    return (
        <>
            <h2>Available Games</h2>

            {lobby.length === 0 && <p>No games available.</p>}

            {lobby.map((game) => (
                <GameListItem key={game.id} game={game} player={player} />
            ))}
        </>
    )
}