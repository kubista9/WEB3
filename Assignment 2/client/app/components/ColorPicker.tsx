"use client"

const colors = ["RED", "GREEN", "BLUE", "YELLOW"] as const

export default function ColorPicker({
    onSelect,
    onCancel
}: {
    onSelect: (color: string) => void
    onCancel: () => void
}) {
    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 12,
                    display: "flex",
                    gap: 15
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {colors.map((c) => (
                    <button
                        key={c}
                        onClick={() => onSelect(c)}
                        style={{
                            padding: 20,
                            width: 80,
                            fontWeight: "bold",
                            background: c.toLowerCase(),
                            color: "white",
                            borderRadius: 8,
                            border: "2px solid black",
                            cursor: "pointer"
                        }}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>
    )
}