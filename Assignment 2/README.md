# UNO Game Project ( Functional )

A multiplayer UNO card game implemented with Next.js, GraphQL, Node.js, Redux, Lodash

## How to run

in the root

    npm install

for server

    npm install

then

    npm run dev

for client 

    npm install

then

    npm run dev

open in browser

    http://localhost:3000/

- register
- login
- create a game
- play

## Notes
- There is only local database, so if you register as a user and you stop the server from running, you will have to register again
- Game over screen is implemented as an alert() and when you click on OK, it will redirect you to the lobby

## Requirements

### Assignment 4 ( Model from assignment 1 in functional )
- Uses immutable types for UNO corresponding to the types you defined in assignment 1
- Defines functions that manipulate data according to the UNO rules
- Uses lodash
- Uses only pure functions
- Functions should be written in functional style
- Say UNO Functionality
- Make as much of the test suite as relevant pass ( 16 failed, 169 passed )

### Assignment 5
- Uses model from Assignment 4
- Uses Redux for state management
- Uses RxJS for handling messages from the server
- Uses React for rendering
- Retains the features from assignments 1–3

#### From Assignment 2:
- The player should be able to play one round of Uno against 1-3 players
- The play should proceed according to as much of the official Uno rules you implemented in assignment 1
- Screen for setting up a game (lobby)
- Screen for playing (game)
- Using consistent composition or options API
- The application should have a game over screen indicating the result

#### From Assignment 3:
- Can play against 1–3 human opponents
- Users can identify themselves
- Users can create a game
- Users can join existing games
- Users get notifications everytime something happens
- Users can register and login

### Assignment 6
- Features from Assignment 5
- Uses Next.js for server-side rendering 
- Works with “npm run dev” and “npm run build; npm run start”
- The implementation should use both server and client components 
- The design should make deliberate choices of when to use static vs dynamic pages

## Commands for development

to install

    npm install

to test the whole suite

    npm test

to run individual test

    npx jest deck.test.ts

to run the script

    npm run dev

or 

    npm run start

to create next js project

    npx create-next-app@latest 