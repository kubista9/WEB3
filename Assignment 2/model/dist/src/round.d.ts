import { Card, Accusation, Round } from "./interfaces";
import { Shuffler } from "../utils/random_utils";
export declare function play(index: number, chosenColor: string | undefined, round: Round): Round;
export declare function createRound(players: string[], dealer: number, shuffler?: Shuffler<Card>, cardsPerPlayer?: number, _lastPlayedBy?: number): Round;
export declare function canPlay(cardIndex: number, round: Round): boolean;
export declare function draw(round: Round): Round;
export declare function sayUno(playerIndex: number, round: Round): Round;
export declare function checkUnoFailure(accusation: Accusation, round: Round): boolean;
export declare function catchUnoFailure(accusation: {
    accuser: number;
    accused: number;
}, round: Round): Round;
export declare function canPlayAny(round: Round): boolean;
export declare function hasEnded(round: Round): boolean;
export declare function winner(round: Round): number | undefined;
export declare function score(round: Round): number | undefined;
export declare function cardValue(card: Card): number;
export declare function topOfDiscard(round: Round): Card | undefined;
export declare function dealHands(deck: Card[], playerCount: number, cardsPerPlayer: number): {
    hands: Card[][];
    nextIndex: number;
};
export declare function lastPlayedBy(round: Round): number | undefined;
