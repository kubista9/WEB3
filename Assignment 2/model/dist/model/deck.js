"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialDeck = createInitialDeck;
const lodash_1 = __importDefault(require("lodash"));
function createInitialDeck() {
    const colors = ["RED", "BLUE", "GREEN", "YELLOW"];
    const numbered = lodash_1.default.flatMap(colors, color => lodash_1.default.concat([{ type: "NUMBERED", color, number: 0 }], lodash_1.default.flatMap(lodash_1.default.range(1, 10), n => [
        { type: "NUMBERED", color, number: n },
        { type: "NUMBERED", color, number: n },
    ])));
    const actions = lodash_1.default.flatMap(colors, color => [
        { type: "SKIP", color },
        { type: "SKIP", color },
        { type: "REVERSE", color },
        { type: "REVERSE", color },
        { type: "DRAW", color },
        { type: "DRAW", color },
    ]);
    const wilds = lodash_1.default.flatMap(lodash_1.default.range(4), () => [
        { type: "WILD" },
        { type: "WILD DRAW" },
    ]);
    return lodash_1.default.concat(numbered, actions, wilds);
}
