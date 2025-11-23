// A function that returns a (possibly) random number from 0 to bound - 1
export type Randomizer = (bound: number) => number

// Uniformly selected pseudo-random number
export const standardRandomizer: Randomizer = n => Math.floor(Math.random() * n)

// A function that shuffles the given array and returns a new shuffled array
export type Shuffler<T> = (cards: readonly T[]) => T[]

// Perfect shuffle using the Fisher-Yates method
export function standardShuffler<T>(cards: readonly T[]): T[] {
  const copy = [...cards] // make a mutable copy
  for (let i = 0; i < copy.length - 1; i++) {
    const j = Math.floor(Math.random() * (copy.length - i) + i)
    const temp = copy[j]
    copy[j] = copy[i]
    copy[i] = temp
  }
  return copy
}