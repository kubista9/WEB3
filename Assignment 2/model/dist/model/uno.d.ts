import { Round } from './interfaces';
import { GameProps, Game } from './interfaces';
export declare function createGame(props: GameProps): Game;
export declare function play(roundAction: (r: Round) => Round, game: Game): Game;
export declare function winner(game: Game): number | undefined;
declare const _default: {
    createGame: typeof createGame;
    play: typeof play;
    winner: typeof winner;
};
export default _default;
