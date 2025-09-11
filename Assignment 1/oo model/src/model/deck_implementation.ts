import { CardTypes, UnoDeck, ValidColors } from "./requirements";

// Requirement 5 2/2
export class Deck implements UnoDeck {
    drawPile: CardTypes[];
    discardPile: CardTypes[];

    constructor() {
        this.drawPile = [];
        this.discardPile = [];
    }

    startTheGame(): void {
        for (const c of ValidColors) {
            this.drawPile.push({ type: "Numbered", color: c, value: 0 });

            for (let v = 1; v <= 9; v++) {
                this.drawPile.push({ type: "Numbered", color: c, value: v as any });
                this.drawPile.push({ type: "Numbered", color: c, value: v as any });
            }

            this.drawPile.push(
                { type: "Skip", color: c },
                { type: "Skip", color: c });
            this.drawPile.push(
                { type: "Reverse", color: c },
                { type: "Reverse", color: c }
            );
            this.drawPile.push(
                { type: "Draw Two", color: c },
                { type: "Draw Two", color: c }
            );
        }

        for (let i = 0; i < 4; i++) {
            this.drawPile.push({ type: "Wild" });
            this.drawPile.push({ type: "Wild Draw Four" });
        }

        this.shuffleDeck()
    }

    shuffleDeck(): void {
        this.drawPile.sort(() => Math.random() - 0.5);
    }

    /*
    drawFromDeck(): CardTypes {
        return this.drawPile.pop();
       
    }
    getDeckSize(): number {
        throw new Error("Method not implemented.");
    }
    drawCards(number: number): CardTypes {
        throw new Error("Method not implemented.");
    }
    discardCard(): CardTypes {
        throw new Error("Method not implemented.");
    }
    */


}


