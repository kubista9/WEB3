## Commands
  npm install

  npm test

  npx jest deck.test.ts

  npx ts-node deck.ts

# UNO Game Implementation 🎮

This project is an object-oriented TypeScript implementation of the classic UNO card game.  
It follows the official rules of UNO and satisfies the requirements defined in the assignment specification.

---

## 🎴 Cards

### Number Cards
- Values: **0–9**  
- Colors: **Red, Green, Blue, Yellow**

### Action Cards (per color)
- **Skip** → next player loses their turn  
- **Reverse** → order of play changes direction  
  - Special case: with **2 players**, Reverse = Skip  
- **Draw Two** → next player draws 2 cards and loses their turn  

### Wild Cards
- **Wild** → player declares the next color  
- **Wild Draw Four** → player declares next color, next player draws 4 cards and loses their turn  
  - May **only** be played if the player has no card matching the active color  

---

## 🃏 Setup
- Each player starts with **7 cards**  
- Flip one card from draw pile to discard pile to start  
- If the first card is **Wild** or **Wild Draw Four**, draw another instead  

---

## 🔄 Gameplay
- Players take turns in sequence (clockwise or counterclockwise, depending on **Reverse**)  

### On a Turn:
- Play a card that matches **color OR number/type**, OR play a **Wild**  
- If unable, draw one card  
  - If playable, may play it immediately  
  - Otherwise, keep it  

### Special Rules:
- **Reverse, Skip, Draw Two, Wild, Wild Draw Four** have immediate effects as described above  

---

## 🏆 Ending a Round
- A player wins the round by playing their **last card**  
- Opponents’ cards score points for the winner:  
  - Number cards = face value  
  - Skip/Reverse/Draw Two = **20**  
  - Wild/Wild Draw Four = **50**  

---

## 🔔 UNO Rule
- If a player has **one card left**, they must say **“UNO”** before playing it  
- If another player catches them not saying it before the next turn starts → penalty = **draw 4 cards**  

---

## 🎯 Winning the Game
- First player to reach **500 points** wins the game  

---

## 📑 Must-Have Requirements

### Requirement 1
Define a type `Card`, representing UNO cards (including special cards, not blanks).  
Make it as **precise as possible** (all UNO cards, nothing else).

### Requirement 2
Define types for:
- Numbered cards  
- Colored action cards  
- Wild cards  

### Requirement 3
Define a type `Type`, representing the different kinds of UNO cards.

### Requirement 4
Define a utility type `TypedCard<Type>`, representing UNO cards of the given type.

### Requirement 5
Define an interface/type `Deck` representing a full UNO deck (and any pile of cards).  
Create an implementation of `Deck`.

### Requirement 6
Define an interface/type for a **player hand**.  
Create an implementation of a **player hand**.

### Requirement 7
Define an interface/type to represent playing a **round** (hand).  
Create an implementation of playing a round according to the rules of UNO **except** the rules surrounding saying “UNO” (going out).

---

## 🚀 Could-Have Extensions
- Define an interface/type `Game` representing a full UNO game consisting of several rounds complete with scoring.  
- Implement `Game` with scoring system (first to 500 points wins).  
- Define **memento types** to support saving and restoring the state of Deck, Hand, Round, and Game.  

---
