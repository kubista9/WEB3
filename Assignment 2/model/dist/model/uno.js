"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = createGame;
exports.play = play;
exports.winner = winner;
const round_1 = require("./round");
const lodash_1 = __importDefault(require("lodash"));
function createGame(props) {
    const players = props.players ?? ["A", "B"];
    const targetScore = props.targetScore ?? 500;
    const cardsPerPlayer = props.cardsPerPlayer ?? 7;
    const randomizer = props.randomizer;
    const shuffler = props.shuffler;
    if (players.length < 2)
        throw new Error("Game requires at least 2 players");
    if (targetScore <= 0)
        throw new Error("Target score must be greater than 0");
    const scores = lodash_1.default.fill(Array(players.length), 0);
    const dealer = randomizer ? randomizer() : 0;
    return {
        playerCount: players.length,
        players,
        targetScore,
        scores,
        currentRound: (0, round_1.createRound)(players, dealer, shuffler, cardsPerPlayer),
        randomizer,
        shuffler,
        cardsPerPlayer,
    };
}
function play(roundAction, game) {
    if (game.winner !== undefined || !game.currentRound)
        return game;
    const updatedRound = roundAction(game.currentRound);
    if (updatedRound.winner === undefined) {
        return { ...game, currentRound: updatedRound };
    }
    const roundTotal = (0, round_1.score)(updatedRound) ?? 0;
    const roundWinner = updatedRound.winner;
    const newScores = lodash_1.default.map(game.scores, (s, i) => i === roundWinner ? s + roundTotal : s);
    const gameWinner = lodash_1.default.findIndex(newScores, (s) => s >= game.targetScore);
    if (gameWinner !== -1) {
        return {
            ...game,
            scores: newScores,
            winner: gameWinner,
            currentRound: undefined,
        };
    }
    const nextDealer = roundWinner;
    const newRound = (0, round_1.createRound)(game.players, nextDealer, game.shuffler, game.cardsPerPlayer);
    return {
        ...game,
        scores: newScores,
        currentRound: newRound,
    };
}
function winner(game) {
    return game.winner;
}
exports.default = {
    createGame,
    play,
    winner
};
