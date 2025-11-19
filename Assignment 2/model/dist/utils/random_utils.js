"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standardRandomizer = void 0;
exports.standardShuffler = standardShuffler;
// Uniformly selected pseudo-random number
const standardRandomizer = n => Math.floor(Math.random() * n);
exports.standardRandomizer = standardRandomizer;
// Perfect shuffle using the Fisher-Yates method
function standardShuffler(cards) {
    const copy = [...cards]; // make a mutable copy
    for (let i = 0; i < copy.length - 1; i++) {
        const j = Math.floor(Math.random() * (copy.length - i) + i);
        const temp = copy[j];
        copy[j] = copy[i];
        copy[i] = temp;
    }
    return copy;
}
