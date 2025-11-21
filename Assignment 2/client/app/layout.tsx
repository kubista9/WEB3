import type { ReactNode } from "react"
import { WebSocketProvider } from "./providers/WebSocketProvider"
import { ReduxProvider } from "./providers/ReduxProvider"

export default function RootLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <ReduxProvider>
                    <WebSocketProvider>
                        {children}
                    </WebSocketProvider>
                </ReduxProvider>
            </body>
        </html>
    )
}