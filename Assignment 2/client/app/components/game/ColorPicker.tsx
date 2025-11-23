import type { Card, Color } from "@model/dist/model/interfaces"

interface ColorPickerProps {
    show: boolean
    pending: { index: number; card: Card } | null
    colorMap: Record<string, string>
    onPick: (color: Color) => void
    onClose: () => void
}

export default function ColorPicker({
    show,
    pending,
    colorMap,
    onPick,
    onClose
}: ColorPickerProps) {
    if (!show || !pending) return null

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 10,
                    display: "flex",
                    gap: 20
                }}
            >
                {Object.entries(colorMap).map(([c, hex]) => (
                    <button
                        key={c}
                        onClick={() => onPick(c as Color)}
                        style={{
                            background: hex,
                            color: "white",
                            padding: 20,
                            borderRadius: 10,
                            fontWeight: "bold"
                        }}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>
    )
}
