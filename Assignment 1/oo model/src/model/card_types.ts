export const ValidColors = ["Red", "Green", "Blue", "Yellow"] as const;
export const ValidNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const ValidActions = ["Skip", "Reverse", "Draw Two"] as const;

export type Color = typeof ValidColors[number];
export type NumberValue = typeof ValidNumbers[number];
export type Action = typeof ValidActions[number];

export interface NumberCard {
    readonly type: "Numbered";
    readonly color: Color;
    readonly value: NumberValue;
}

export interface ActionCard {
    readonly type: Action;
    readonly color: Color;
}

export interface WildCard {
    readonly type: "Wild";
}
export interface WildDrawFourCard {
    readonly type: "Wild Draw Four";
}

export type Card = NumberCard | ActionCard | WildCard | WildDrawFourCard;
