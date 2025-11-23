"use client"

import { registerHandler, send, ServerMessage } from "./ws"
import { push } from "../features/notificationSlice"
import { setState } from "../features/gameSlice"
import { store } from "../store/store"

registerHandler("GAME_STATE", (msg: ServerMessage) => {
    store.dispatch(setState({ gameId: msg.gameId, state: msg.state }))
}, "game")

registerHandler("UNO_CALLED", (msg: ServerMessage) => {
    store.dispatch(push(msg.text ?? "UNO!"))
}, "game")

registerHandler("UNO_PENALTY", (msg: ServerMessage) => {
    store.dispatch(push(msg.text ?? "UNO penalty applied"))
}, "game")

export const gameApi = {
    play(gameId: any, player: string, index: number, color?: string) {
        send({ type: "PLAY", payload: { gameId, player, index, color } })
    },

    draw(gameId: any, player: string) {
        send({ type: "DRAW", payload: { gameId, player } })
    },

    sayUno(gameId: any, player: string) {
        send({ type: "SAY_UNO", payload: { gameId, player } })
    },

    callOut(gameId: any, accuser: string, accused: string) {
        send({ type: "CALL_OUT", payload: { gameId, accuser, accused } })
    }
}