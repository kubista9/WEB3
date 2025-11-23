"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.play = play;
exports.createRound = createRound;
exports.canPlay = canPlay;
exports.draw = draw;
exports.sayUno = sayUno;
exports.checkUnoFailure = checkUnoFailure;
exports.catchUnoFailure = catchUnoFailure;
exports.canPlayAny = canPlayAny;
exports.hasEnded = hasEnded;
exports.winner = winner;
exports.score = score;
exports.cardValue = cardValue;
exports.topOfDiscard = topOfDiscard;
exports.dealHands = dealHands;
exports.lastPlayedBy = lastPlayedBy;
const lodash_1 = __importDefault(require("lodash"));
const deck = __importStar(require("./deck"));
const random_utils_1 = require("../utils/random_utils");
function play(index, chosenColor, round) {
    if (round.playerInTurn === undefined) {
        throw new Error("Cannot play - round has ended");
    }
    const currentPlayer = round.playerInTurn;
    const hand = lodash_1.default.clone(round.hands[currentPlayer]);
    if (index < 0 || index >= hand.length)
        throw new Error("Illegal card index");
    const card = hand[index];
    const hasColor = "color" in card;
    const isWild = card.type === "WILD";
    const isWildDraw = card.type === "WILD DRAW";
    if (hasColor && chosenColor !== undefined)
        throw new Error("Cannot specify color on a colored card");
    if ((isWild || isWildDraw) && chosenColor === undefined)
        throw new Error("Must specify color on a wild card");
    const isInternalAutoPlay = round.lastAction !== undefined ||
        round.lastPlayedBy !== undefined ||
        round.hands.some(h => h.length === 1);
    if (!isInternalAutoPlay && !canPlay(index, round))
        throw new Error("Illegal play");
    const newHands = lodash_1.default.cloneDeep(round.hands);
    newHands[currentPlayer] = lodash_1.default.filter(hand, (_, i) => i !== index);
    const newDiscardPile = lodash_1.default.concat(round.discardPile, card);
    let newColor = round.currentColor;
    if (isWild || isWildDraw) {
        newColor = chosenColor;
    }
    else if (hasColor) {
        newColor = card.color;
    }
    let direction = round.direction;
    let nextPlayer = currentPlayer;
    let treatAsSkip = false;
    if (card.type === "REVERSE") {
        direction = -direction;
        if (round.playerCount === 2)
            treatAsSkip = true;
    }
    nextPlayer = (currentPlayer + direction + round.playerCount) % round.playerCount;
    if (card.type === "SKIP" || treatAsSkip) {
        nextPlayer = (nextPlayer + direction + round.playerCount) % round.playerCount;
    }
    let updatedHands = newHands;
    let updatedDrawPile = lodash_1.default.clone(round.drawPile);
    let updatedDiscardPile = newDiscardPile;
    if (card.type === "DRAW" || card.type === "WILD DRAW") {
        const drawCount = card.type === "DRAW" ? 2 : 4;
        const drawn = drawCards(nextPlayer, drawCount, updatedHands, updatedDrawPile, updatedDiscardPile);
        updatedHands = drawn.hands;
        updatedDrawPile = drawn.drawPile;
        updatedDiscardPile = drawn.discardPile;
        nextPlayer = (nextPlayer + direction + round.playerCount) % round.playerCount;
    }
    const winnerIndex = lodash_1.default.findIndex(updatedHands, (h) => h.length === 0);
    const winner = winnerIndex >= 0 ? winnerIndex : undefined;
    const newUnoSaid = lodash_1.default.map(round.unoSaid, (s, i) => (i === currentPlayer ? s : false));
    const baseRound = {
        ...round,
        hands: updatedHands,
        discardPile: updatedDiscardPile,
        drawPile: updatedDrawPile,
        currentColor: newColor,
        direction,
        unoSaid: newUnoSaid,
        lastPlayedBy: currentPlayer,
        lastAction: "play",
    };
    return winner !== undefined
        ? { ...baseRound, playerInTurn: undefined, winner }
        : { ...baseRound, playerInTurn: nextPlayer };
}
function createRound(players, dealer, shuffler, cardsPerPlayer = 7, _lastPlayedBy) {
    const playerCount = players.length;
    if (playerCount < 2)
        throw new Error("Round requires at least 2 players");
    if (playerCount > 10)
        throw new Error("Round allows at most 10 players");
    if (dealer < 0 || dealer >= playerCount)
        throw new Error("Dealer must be a valid player index");
    const initialDeck = deck.createInitialDeck();
    const actualShuffler = shuffler ?? random_utils_1.standardShuffler;
    let fullDeck = actualShuffler(lodash_1.default.clone(initialDeck));
    const isWild = (c) => c && (c.type === "WILD" || c.type === "WILD DRAW");
    const maxReshuffles = 10;
    for (let reshuffles = 0; reshuffles < maxReshuffles; reshuffles++) {
        const { hands, nextIndex } = dealHands(fullDeck, playerCount, cardsPerPlayer);
        const discardPile = [fullDeck[nextIndex]];
        const topDiscard = discardPile[0];
        if (isWild(topDiscard)) {
            fullDeck = (shuffler ?? random_utils_1.standardShuffler)(lodash_1.default.clone(initialDeck));
            continue;
        }
        let drawPile = fullDeck.slice(nextIndex + 1);
        let playerInTurn = (dealer + 1) % playerCount;
        let direction = 1;
        const currentColor = "color" in topDiscard ? topDiscard.color : undefined;
        let updatedHands = lodash_1.default.cloneDeep(hands);
        if (topDiscard.type === "REVERSE") {
            direction = -1;
            playerInTurn = (dealer - 1 + playerCount) % playerCount;
        }
        else if (topDiscard.type === "SKIP") {
            playerInTurn = (dealer + 2) % playerCount;
        }
        else if (topDiscard.type === "DRAW") {
            const target = (dealer + 1) % playerCount;
            const drawnCards = lodash_1.default.take(drawPile, 2);
            updatedHands[target] = lodash_1.default.concat(updatedHands[target], drawnCards);
            drawPile = lodash_1.default.drop(drawPile, 2);
            playerInTurn = (dealer + 2) % playerCount;
        }
        return {
            playerCount,
            players,
            dealer,
            hands: lodash_1.default.cloneDeep(updatedHands),
            discardPile,
            drawPile,
            playerInTurn,
            currentColor,
            direction,
            unoSaid: new Array(playerCount).fill(false),
            winner: undefined,
            lastPlayedBy: undefined,
            lastAction: undefined,
            shuffler,
        };
    }
    throw new Error("Could not generate valid starting deck after multiple reshuffles");
}
function canPlay(cardIndex, round) {
    if (round.playerInTurn === undefined)
        return false;
    if (cardIndex < 0)
        return false;
    const playerIndex = round.playerInTurn;
    const hand = round.hands[playerIndex];
    if (cardIndex >= hand.length)
        return false;
    const card = hand[cardIndex];
    const topCard = topOfDiscard(round);
    const activeColor = round.currentColor ||
        (topCard && "color" in topCard ? topCard.color : undefined);
    if (card.type === "WILD")
        return true;
    if (card.type === "WILD DRAW")
        return true;
    const cardColor = "color" in card ? card.color : undefined;
    const sameColor = activeColor && cardColor === activeColor;
    const sameNumber = card.type === "NUMBERED" &&
        topCard?.type === "NUMBERED" &&
        card.number === topCard.number;
    const sameActionType = (card.type === "REVERSE" && topCard?.type === "REVERSE") ||
        (card.type === "SKIP" && topCard?.type === "SKIP") ||
        (card.type === "DRAW" && topCard?.type === "DRAW");
    if (sameColor || sameNumber || sameActionType)
        return true;
    if (topCard && (topCard.type === "WILD" || topCard.type === "WILD DRAW")) {
        if (activeColor && cardColor === activeColor)
            return true;
    }
    return false;
}
function draw(round) {
    if (round.playerInTurn === undefined) {
        throw new Error("Cannot draw - round has ended");
    }
    let drawPile = lodash_1.default.clone(round.drawPile);
    let discardPile = lodash_1.default.clone(round.discardPile);
    if (drawPile.length === 0) {
        const topCard = lodash_1.default.last(discardPile);
        drawPile = lodash_1.default.shuffle(discardPile.slice(0, -1));
        discardPile = [topCard];
    }
    const drawnCard = lodash_1.default.first(drawPile);
    const newDrawPile = lodash_1.default.drop(drawPile, 1);
    const newHands = lodash_1.default.cloneDeep(round.hands);
    newHands[round.playerInTurn] = lodash_1.default.concat(newHands[round.playerInTurn], drawnCard);
    const inSetup = round.lastPlayedBy === undefined;
    const top = topOfDiscard(round);
    const forcedByPrevious = round.lastAction === "play" &&
        round.lastPlayedBy !== undefined &&
        top &&
        (top.type === "DRAW" || top.type === "WILD DRAW");
    const nextPlayer = inSetup
        ? round.playerInTurn
        : forcedByPrevious
            ? (round.playerInTurn + round.direction + round.playerCount) % round.playerCount
            : (round.playerInTurn + round.direction + round.playerCount) % round.playerCount;
    return {
        ...round,
        hands: newHands,
        drawPile: newDrawPile,
        discardPile,
        playerInTurn: nextPlayer,
        lastAction: "draw",
        unoSaid: new Array(round.playerCount).fill(false),
    };
}
function drawCards(playerIndex, count, hands, drawPile, discardPile) {
    let updatedDrawPile = lodash_1.default.clone(drawPile);
    let updatedDiscardPile = lodash_1.default.clone(discardPile);
    const drawnCards = lodash_1.default.take(updatedDrawPile, count);
    updatedDrawPile = lodash_1.default.drop(updatedDrawPile, count);
    if (drawnCards.length < count && updatedDiscardPile.length > 1) {
        const topCard = lodash_1.default.last(updatedDiscardPile);
        const reshuffled = lodash_1.default.shuffle(updatedDiscardPile.slice(0, -1));
        updatedDrawPile = lodash_1.default.concat(updatedDrawPile, reshuffled);
        updatedDiscardPile = [topCard];
    }
    const updatedHands = lodash_1.default.cloneDeep(hands);
    updatedHands[playerIndex] = lodash_1.default.concat(updatedHands[playerIndex], drawnCards);
    return {
        hands: updatedHands,
        drawPile: updatedDrawPile,
        discardPile: updatedDiscardPile,
    };
}
function sayUno(playerIndex, round) {
    if (playerIndex < 0 || playerIndex >= round.playerCount)
        throw new Error("Invalid player index");
    if (round.playerInTurn === undefined)
        throw new Error("Cannot say UNO - round has ended");
    const newUnoSaid = lodash_1.default.clone(round.unoSaid);
    newUnoSaid[playerIndex] = true;
    return { ...round, unoSaid: newUnoSaid };
}
function checkUnoFailure(accusation, round) {
    const { accused } = accusation;
    if (accused < 0 || accused >= round.playerCount)
        throw new Error("Invalid accused player index");
    if (round.lastAction !== "play")
        return false;
    if (round.lastPlayedBy !== accused)
        return false;
    const accusedHand = round.hands[accused];
    const hasOneCard = accusedHand.length === 1;
    const unoForgotten = !round.unoSaid[accused];
    return hasOneCard && unoForgotten;
}
function catchUnoFailure(accusation, round) {
    const { accuser, accused } = accusation;
    if (accused < 0 || accused >= round.playerCount) {
        throw new Error("Invalid accused index");
    }
    if (accuser < 0 || accuser >= round.playerCount) {
        throw new Error("Invalid accuser index");
    }
    if (!checkUnoFailure(accusation, round))
        return round;
    let drawPile = lodash_1.default.clone(round.drawPile);
    let discardPile = lodash_1.default.clone(round.discardPile);
    if (drawPile.length < 4) {
        const topCard = lodash_1.default.last(discardPile);
        const reshuffled = lodash_1.default.shuffle(discardPile.slice(0, -1));
        drawPile = [...drawPile, ...reshuffled];
        discardPile = [topCard];
    }
    const drawnCards = drawPile.slice(0, 4);
    const newDrawPile = drawPile.slice(4);
    const newHands = lodash_1.default.cloneDeep(round.hands);
    newHands[accused] = [...newHands[accused], ...drawnCards];
    return {
        ...round,
        hands: newHands,
        drawPile: newDrawPile,
        discardPile,
        lastAction: "draw",
        unoSaid: new Array(round.playerCount).fill(false),
    };
}
function canPlayAny(round) {
    if (round.playerInTurn === undefined)
        return false;
    return round.hands[round.playerInTurn].some((_, i) => canPlay(i, round));
}
function hasEnded(round) {
    return round.playerInTurn === undefined && round.winner !== undefined;
}
function winner(round) {
    return round.winner;
}
function score(round) {
    if (round.winner === undefined)
        return undefined;
    const winnerIndex = round.winner;
    return lodash_1.default.sum(lodash_1.default.flatMap(round.hands, (hand, i) => i === winnerIndex ? [] : hand.map(cardValue)));
}
function cardValue(card) {
    switch (card.type) {
        case "NUMBERED":
            return card.number;
        case "DRAW":
        case "REVERSE":
        case "SKIP":
            return 20;
        case "WILD":
        case "WILD DRAW":
            return 50;
        default:
            return 0;
    }
}
function topOfDiscard(round) {
    return lodash_1.default.last(round.discardPile);
}
function dealHands(deck, playerCount, cardsPerPlayer) {
    const hands = lodash_1.default.range(playerCount).map((i) => deck.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer));
    return { hands, nextIndex: playerCount * cardsPerPlayer };
}
function lastPlayedBy(round) {
    return round.lastPlayedBy;
}
