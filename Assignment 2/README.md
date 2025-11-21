# UNO Game Project ( Functional )

A multiplayer UNO card game implemented with Next.js, GraphQL, Node.js

## How to run

in the root

    npm install

for server

    npm run dev

for client 

    npm run dev

open in browser

    http://localhost:3000/

- register
- login
- create a game
- play

## Known bugs
none for now

## Requirements

### Assignment 4 ( Model )
- Define immutable types for UNO corresponding to the types you defined in assignment 1
- Define functions that manipulate data according to the UNO rules
- Uses lodash
- Uses only pure functions
- Functions should be written in functional style 
- Say UNO Functionality ----WORKING ON IT

### Assignment 5
- Uses model from Assignment 4
- Uses Redux for state management
- Uses RxJS for handling messages from the server
- Uses React for rendering
- The implementation must retain the features from assignments 1–3

#### From Assignment 2:

a. Screen for setting up a game (lobby)
b. Screen for playing (game)
c. Using consistent composition API — NEED TO CHECK
d. GameOverview screen available at /game/:id/overview — WORKING ON IT

#### From Assignment 3:

e. Can play against 1–3 human opponents
f. Users can identify themselves
g. Users can create a game
h. Users can join existing games
i. Users get notifications — WORKING ON IT
j. Server uses GraphQL — NEED TO CHECK
k. User registration and login
l. Server uses Apollo Server — NEED TO CHECK

### Assignment 6
- Features from Assignment 5
- Uses Next.js for server-side rendering
- Works with “npm run dev” and “npm run build; npm run start” — NEED TO CHECK


## Tests passed

- 16 failed, 169 passed (18.11)

## Commands for development

General

    npm install


    npm test


    npx jest deck.test.ts


    npm run build


    npm start


    npx create-next-app@latest 


    npm run dev


    npm run start