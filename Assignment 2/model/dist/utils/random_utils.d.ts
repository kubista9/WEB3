export type Randomizer = (bound: number) => number;
export declare const standardRandomizer: Randomizer;
export type Shuffler<T> = (cards: readonly T[]) => T[];
export declare function standardShuffler<T>(cards: readonly T[]): T[];
