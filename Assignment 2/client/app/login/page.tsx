"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import connectWebSocket, { sendAction, setOnLoginSuccess } from "../utils/gameApi"

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [repeat, setRepeat] = useState("")
    const [mode, setMode] = useState<"login" | "register">("login")

    useEffect(() => {
        connectWebSocket()
        setOnLoginSuccess(() => {
            Cookies.set("player", username)
            router.push("/lobby")
        })
    }, [username, router])

    function doLogin() {
        sendAction({
            type: "LOGIN",
            payload: { username, password },
        })
    }

    function doRegister() {
        if (password !== repeat) {
            alert("Passwords do not match")
            return
        }

        sendAction({
            type: "REGISTER",
            payload: { username, password },
        })
    }

    return (
        <div style={{ padding: 40 }}>
            <h1>{mode === "login" ? "Login" : "Register"}</h1>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginRight: 10 }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ marginRight: 10 }}
            />

            {mode === "register" && (
                <input
                    type="password"
                    placeholder="Repeat Password"
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value)}
                    style={{ marginRight: 10 }}
                />
            )}

            <button onClick={mode === "login" ? doLogin : doRegister}>
                {mode === "login" ? "Login" : "Register"}
            </button>

            <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
                Switch to {mode === "login" ? "Register" : "Login"}
            </button>
        </div>
    )
}
