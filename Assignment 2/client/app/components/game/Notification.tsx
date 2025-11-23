interface NotificationProps {
    message: string | null
}

export default function Notification({ message }: NotificationProps) {
    if (!message) return null

    return (
        <div
            style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                background: "black",
                color: "white",
                padding: "10px 16px",
                borderRadius: 6,
                fontSize: 14
            }}
        >
            {message}
        </div>
    )
}