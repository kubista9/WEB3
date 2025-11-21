# UNO Game Project ( Functional )

A multiplayer UNO card game implemented with Next.js, GraphQL, Node.js, Redux, Apollo, Lodash

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

## Notes
- It is possible to play only one round of uno, if you wish to play more, you must leave the game and create a new game

## Requirements

### Assignment 4 ( Model from assignment 1 in functional )
- Uses immutable types for UNO corresponding to the types you defined in assignment 1
- Defines functions that manipulate data according to the UNO rules
- Uses lodash
- Uses only pure functions

Should have
- Functions should be written in functional style — NEED TO CHECK
- Say UNO Functionality

Could have
- Make as much of the test suite as relevant pass

### Assignment 5
- Uses model from Assignment 4
- Uses Redux for state management
- Uses RxJS for handling messages from the server
- Uses React for rendering
- Retains the features from assignments 1–3
- The implementation should use React for rendering ( Shoud have )

#### From Assignment 2:
- The player should be able to play one round of Uno against 1-3 players
- The play should proceed according to as much of the official Uno rules you implemented in assignment 1
- Screen for setting up a game (lobby)
- Screen for playing (game)
- Using consistent composition or options API — NEED TO CHECK
 
 Should have
- The application should have a game over screen indicating the result — NEED TO CHECK

Could have 
- Play an entire game (with score) of Uno against 1-3 players

#### From Assignment 3:
- Can play against 1–3 human opponents
- Users can identify themselves
- Users can create a game
- Users can join existing games
- Users get notifications everytime something happens
- Server uses GraphQL as the communication protocol — NEED TO CHECK
- Users can register and login
- The application allows playing an entire game (with score) of Uno against 1-3 human opponents — NEED TO CHECK

### Assignment 6
- Features from Assignment 5
- Uses Next.js for server-side rendering — NEED TO CHECK
- Works with “npm run dev” and “npm run build; npm run start” — NEED TO CHECK

Should have
- The implementation should use both server and client components — NEED TO CHECK
- The design should make deliberate choices of when to use static vs dynamic pages — NEED TO CHECK

Could have
- The implementation could have its API implemented in Next.js

## Tests passed

- 16 failed, 169 passed (18.11)

## Commands for development

to install

    npm install

to build, mostly for model

    npm run build

to test the whole suite

    npm test

to run the script

    npm run dev

to run individual test

    npx jest deck.test.ts

to create next js project

    npx create-next-app@latest 