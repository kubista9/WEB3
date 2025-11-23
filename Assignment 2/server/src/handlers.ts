import { WebSocket, WebSocketServer } from "ws"
import { v4 as uuid } from "uuid"
import { register, login } from "./database"
import { createGame } from "../../model/dist/model/uno"
import { play, draw, catchUnoFailure, checkUnoFailure, sayUno } from "../../model/dist/model/round"
import type { Game, Round } from "../../model/dist/model/interfaces"

export const lobby = new Map<string, LobbyGame>()
export const runningGames = new Map<string, Game>()

export interface LobbyGame {
    id: string
    host: string
    name: string
    players: string[]
    maxPlayers: number
}

export function broadcastLobby(wss: WebSocketServer) {
    const json = JSON.stringify({
        type: "LOBBY_UPDATE",
        lobby: Array.from(lobby.values()),
    })

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json)
        }
    })
}

function broadcastGameState(wss: WebSocketServer, gameId: string, game: Game) {
    const round: Round | undefined = game.currentRound
    if (!round) return

    const json = JSON.stringify({
        type: "GAME_STATE",
        gameId,
        state: round,
    })

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json)
        }
    })
}

export function handleMessage(
    ws: WebSocket,
    raw: string,
    wss: WebSocketServer
) {
    let action: any
    try {
        action = JSON.parse(raw)
    } catch {
        console.warn("Invalid WS message:", raw)
        return
    }

    console.log("WS ACTION =>", action)

    switch (action.type) {
        case "REGISTER": {
            const ok = register(action.payload.username, action.payload.password)
            ws.send(JSON.stringify({ type: "REGISTER_RESULT", ok }))
            break
        }

        case "LOGIN": {
            const ok = login(action.payload.username, action.payload.password)
            ws.send(JSON.stringify({ type: "LOGIN_RESULT", ok }))
            break
        }

        case "GET_LOBBY": {
            ws.send(
                JSON.stringify({
                    type: "LOBBY_UPDATE",
                    lobby: Array.from(lobby.values()),
                })
            )
            break
        }

        case "CREATE_GAME": {
            const id = uuid()
            const host: string = action.payload.host ?? action.payload.player

            const game: LobbyGame = {
                id,
                host,
                name: `${host}'s Game`,
                players: [host],
                maxPlayers: action.payload.maxPlayers ?? 4,
            }

            lobby.set(id, game)
            broadcastLobby(wss)
            break
        }

        case "JOIN_GAME": {
            const gameId: string =
                action.payload.id ?? action.payload.gameId ?? ""

            const player: string = action.payload.player
            const game = lobby.get(gameId)
            if (!game) break

            if (
                !game.players.includes(player) &&
                game.players.length < game.maxPlayers
            ) {
                game.players.push(player)
            }

            const msg = JSON.stringify({
                type: "PLAYER_JOINED",
                id: game.id,
                players: game.players,
            })

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(msg)
                }
            })

            broadcastLobby(wss)
            break
        }

        case "START_GAME": {
            const gameId: string =
                action.payload.id ?? action.payload.gameId ?? ""
            const gameLobby = lobby.get(gameId)
            if (!gameLobby) break

            const unoGame: Game = createGame({
                players: gameLobby.players,
            })

            runningGames.set(gameId, unoGame)
            lobby.delete(gameId)

            broadcastLobby(wss)

            const startedMsg = JSON.stringify({
                type: "GAME_STARTED",
                id: gameId,
            })

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(startedMsg)
                }
            })
            broadcastGameState(wss, gameId, unoGame)
            break
        }

        case "PLAY": {
            const { gameId, player, index, color } = action.payload
            const game = runningGames.get(gameId)
            if (!game) break
            const round = game.currentRound
            if (!round) break

            const playerIndex = game.players.indexOf(player)
            if (playerIndex === -1) break

            if (round.playerInTurn !== playerIndex) {
                console.log(
                    `IGNORED PLAY from ${player} — not their turn (currentTurn = ${round.playerInTurn})`
                )
                break
            }

            let newRound: Round
            try {
                newRound = play(index, color, round)
            } catch (err) {
                console.warn("Illegal PLAY:", (err as Error).message)
                break
            }

            const newGame: Game = { ...game, currentRound: newRound }
            runningGames.set(gameId, newGame)

            broadcastGameState(wss, gameId, newGame)
            break
        }

        case "DRAW": {
            const { gameId, player } = action.payload
            const game = runningGames.get(gameId)
            if (!game) break
            const round = game.currentRound
            if (!round) break

            const playerIndex = game.players.indexOf(player)
            if (playerIndex === -1) break

            if (round.playerInTurn !== playerIndex) {
                console.log(
                    `IGNORED DRAW from ${player} — not their turn (currentTurn = ${round.playerInTurn})`
                )
                break
            }

            let newRound: Round
            try {
                newRound = draw(round)
            } catch (err) {
                console.warn("Illegal DRAW:", (err as Error).message)
                break
            }

            const newGame: Game = { ...game, currentRound: newRound }
            runningGames.set(gameId, newGame)

            broadcastGameState(wss, gameId, newGame)
            break
        }

        case "SAY_UNO": {
            const { gameId, player } = action.payload
            const game = runningGames.get(gameId)
            if (!game) break

            const round = game.currentRound
            if (!round) break

            const playerIndex = game.players.indexOf(player)
            if (playerIndex === -1) break
            
            const cardsInHand = round.hands[playerIndex]?.length ?? 0
            if (cardsInHand > 2) {
                console.log(`IGNORED SAY_UNO from ${player} — has ${cardsInHand} cards`)
                break
            }

            const newRound = sayUno(playerIndex, round)
            const newGame = { ...game, currentRound: newRound }
            runningGames.set(gameId, newGame)

            const msg = JSON.stringify({
                type: "UNO_CALLED",
                text: `${player} said UNO!`
            })

            wss.clients.forEach(c => {
                if (c.readyState === WebSocket.OPEN) c.send(msg)
            })

            broadcastGameState(wss, gameId, newGame)
            break
        }

        case "CALL_OUT": {
            const { gameId, accuser, accused } = action.payload
            const game = runningGames.get(gameId)
            if (!game) break

            const round = game.currentRound
            if (!round) break

            const accuserIndex = game.players.indexOf(accuser)
            const accusedIndex = game.players.indexOf(accused)
            if (accuserIndex === -1 || accusedIndex === -1) break

            const failure = checkUnoFailure(
                { accuser: accuserIndex, accused: accusedIndex },
                round
            )

            if (failure) {
                const penalized = catchUnoFailure(
                    { accuser: accuserIndex, accused: accusedIndex },
                    round
                )

                const newGame = { ...game, currentRound: penalized }
                runningGames.set(gameId, newGame)

                const msg = JSON.stringify({
                    type: "UNO_PENALTY",
                    text: `${accused} forgot to say UNO and draws 4 cards!`
                })
                wss.clients.forEach(c => {
                    if (c.readyState === WebSocket.OPEN) c.send(msg)
                })

                broadcastGameState(wss, gameId, newGame)
            } else {
                ws.send(JSON.stringify({
                    type: "UNO_PENALTY",
                    text: `Invalid call — no UNO penalty applies`
                }))
            }
            break
        }

        default:
            console.warn("⚠ Unknown WS action:", action)
    }
}