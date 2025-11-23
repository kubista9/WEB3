interface Props {
    player: string
}

export default function PlayerHeader({ player }: Props) {
    return <p>You are logged in as: {player}</p>
}