"use client"

import { registerHandler, send } from "./ws"
import { push } from "../features/notificationSlice"

let onLoginSuccess: (() => void) | null = null

export function setOnLoginSuccess(cb: () => void) {
    onLoginSuccess = cb
}

registerHandler("REGISTER_RESULT", (msg: any) => {
    push(msg.ok ? "Registered successfully" : "Username exists")
}, "login")

registerHandler("LOGIN_RESULT", (msg: any) => {
    if (msg.ok) {
        push("Login successful")
        onLoginSuccess?.()
    } else {
        push("Invalid login")
    }
}, "login")

export function apiLogin(username: string, password: string) {
    send({ type: "LOGIN", payload: { username, password } })
}

export function apiRegister(username: string, password: string) {
    send({ type: "REGISTER", payload: { username, password } })
}