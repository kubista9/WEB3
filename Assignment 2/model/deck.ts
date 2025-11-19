import _ from "lodash"
import { Card } from "./interfaces"

export function createInitialDeck(): Card[] {
    const colors = ["RED", "BLUE", "GREEN", "YELLOW"] as const

    const numbered: Card[] = _.flatMap(colors, color =>
        _.concat(
            [{ type: "NUMBERED" as const, color, number: 0 }],
            _.flatMap(_.range(1, 10), n => [
                { type: "NUMBERED" as const, color, number: n },
                { type: "NUMBERED" as const, color, number: n },
            ])
        )
    )

    const actions: Card[] = _.flatMap(colors, color => [
        { type: "SKIP" as const, color },
        { type: "SKIP" as const, color },
        { type: "REVERSE" as const, color },
        { type: "REVERSE" as const, color },
        { type: "DRAW" as const, color },
        { type: "DRAW" as const, color },
    ])

    const wilds: Card[] = _.flatMap(_.range(4), () => [
        { type: "WILD" as const },
        { type: "WILD DRAW" as const },
    ])

    return _.concat(numbered, actions, wilds) as Card[]
}