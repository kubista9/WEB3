import express from "express"
import http from "http"
import { startWebSocketServer } from "./websocket"

const app = express()
const server = http.createServer(app)

app.get("/", (_req, res) => {
    res.send("UNO server is running")
})

// Attach WS
startWebSocketServer(server)

// Start HTTP+WS on the same port
const PORT = 4000
server.listen(PORT, () => {
    console.log(`🔥 UNO server (HTTP + WS) listening on ${PORT}`)
})