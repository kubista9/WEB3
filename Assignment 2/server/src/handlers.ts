import { WebSocket, WebSocketServer } from "ws"
import { v4 as uuid } from "uuid"
import { register, login } from "./database"

import { createGame } from "../../model/dist/model/uno"
import {
    play as playRound,
    draw as drawRound,
} from "../../model/dist/model/round"

import type { Game, Round } from "../../model/dist/model/interfaces"

/* -----------------------------------------------------
   TYPES
----------------------------------------------------- */

export interface LobbyGame {
    id: string
    host: string
    name: string
    players: string[]
    maxPlayers: number
}

/* -----------------------------------------------------
   GLOBAL STATE
----------------------------------------------------- */

// lobby games (not started yet)
export const lobby = new Map<string, LobbyGame>()

// running games keyed by gameId
export const runningGames = new Map<string, Game>()

/* -----------------------------------------------------
   BROADCAST HELPERS
----------------------------------------------------- */

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

/* -----------------------------------------------------
   MAIN HANDLER
----------------------------------------------------- */

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
        /* ---------------------------------------------
           REGISTER
        --------------------------------------------- */
        case "REGISTER": {
            const ok = register(action.payload.username, action.payload.password)
            ws.send(JSON.stringify({ type: "REGISTER_RESULT", ok }))
            break
        }

        /* ---------------------------------------------
           LOGIN
        --------------------------------------------- */
        case "LOGIN": {
            const ok = login(action.payload.username, action.payload.password)
            ws.send(JSON.stringify({ type: "LOGIN_RESULT", ok }))
            break
        }

        /* ---------------------------------------------
           GET LOBBY
        --------------------------------------------- */
        case "GET_LOBBY": {
            ws.send(
                JSON.stringify({
                    type: "LOBBY_UPDATE",
                    lobby: Array.from(lobby.values()),
                })
            )
            break
        }

        /* ---------------------------------------------
           CREATE GAME
        --------------------------------------------- */
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

        /* ---------------------------------------------
           JOIN GAME
        --------------------------------------------- */
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

            // notify lobby clients
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

        /* ---------------------------------------------
           START GAME
        --------------------------------------------- */
        case "START_GAME": {
            const gameId: string =
                action.payload.id ?? action.payload.gameId ?? ""
            const gameLobby = lobby.get(gameId)
            if (!gameLobby) break

            // create actual Uno Game (your model)
            const unoGame: Game = createGame({
                players: gameLobby.players,
                // other props (targetScore, cardsPerPlayer) use defaults
            })

            runningGames.set(gameId, unoGame)
            lobby.delete(gameId)

            // update lobby for everyone
            broadcastLobby(wss)

            // tell clients to navigate to /game/[id]
            const startedMsg = JSON.stringify({
                type: "GAME_STARTED",
                id: gameId,
            })

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(startedMsg)
                }
            })

            // initial round state
            broadcastGameState(wss, gameId, unoGame)
            break
        }

        /* ---------------------------------------------
           PLAY CARD (with player identity + turn enforcement)
        --------------------------------------------- */
        case "PLAY": {
            const { gameId, player, index, color } = action.payload
            const game = runningGames.get(gameId)
            if (!game) break
            const round = game.currentRound
            if (!round) break

            const playerIndex = game.players.indexOf(player)
            if (playerIndex === -1) break

            // turn enforcement
            if (round.playerInTurn !== playerIndex) {
                console.log(
                    `IGNORED PLAY from ${player} — not their turn (currentTurn = ${round.playerInTurn})`
                )
                break
            }

            let newRound: Round
            try {
                // your model signature: play(index, chosenColor, round)
                newRound = playRound(index, color, round)
            } catch (err) {
                console.warn("Illegal PLAY:", (err as Error).message)
                break
            }

            const newGame: Game = { ...game, currentRound: newRound }
            runningGames.set(gameId, newGame)

            broadcastGameState(wss, gameId, newGame)
            break
        }

        /* ---------------------------------------------
           DRAW CARD (with player identity + turn enforcement)
        --------------------------------------------- */
        case "DRAW": {
            const { gameId, player } = action.payload
            const game = runningGames.get(gameId)
            if (!game) break
            const round = game.currentRound
            if (!round) break

            const playerIndex = game.players.indexOf(player)
            if (playerIndex === -1) break

            // turn enforcement
            if (round.playerInTurn !== playerIndex) {
                console.log(
                    `IGNORED DRAW from ${player} — not their turn (currentTurn = ${round.playerInTurn})`
                )
                break
            }

            let newRound: Round
            try {
                // your model signature: draw(round)
                newRound = drawRound(round)
            } catch (err) {
                console.warn("Illegal DRAW:", (err as Error).message)
                break
            }

            const newGame: Game = { ...game, currentRound: newRound }
            runningGames.set(gameId, newGame)

            broadcastGameState(wss, gameId, newGame)
            break
        }

        default:
            console.warn("⚠ Unknown WS action:", action)
    }
}
