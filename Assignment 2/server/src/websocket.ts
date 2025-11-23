import { WebSocketServer, WebSocket } from "ws"
import { handleMessage } from "./handlers"

export function startWebSocketServer(server: any) {
    const wss = new WebSocketServer({ server })
    wss.on("connection", (ws: WebSocket) => {
        ws.on("message", (msg) => {
            try {
                handleMessage(ws, msg.toString(), wss)
            } catch (e) {
                console.error("WS message error:", e)
            }
        })
    })

    return wss
}