# UNO Game Project

A multiplayer UNO card game implemented with Vue.js, GraphQL, Node.js, and MongoDB.

## How to run

    in the root
        npm install

    for client
        npm run dev

    for server, you need docker and you need to have a running mongo:db container
    install via
        docker pull mongo:latest
    then run the container, for example
        docker run -d -p 27017:27017 --name mongodb mongo:latest
    verify
        docker ps
    create .env file in the /server folder, example
        MONGODB_URI=mongodb://localhost:27017/uno-game
        CLIENT_URL=http://localhost:5173
        NODE_ENV=development
        JWT_SECRET=supersecretkey12345
    then start the server via
        npm run dev
    open in browser
        http://localhost:5173/
    register
    login
    create a game
    play

## Known bugs

### Start game button

    Sometimes it can happen that if you register and log in as another user in a new tab and join a game, 
    the Start Game button sometimes doesn’t appear in the host window.

    🧩 To solve this, log out and log back in from the host browser window.

### Automatic redirect as a guest

    When you start a game as a host, it automatically redirects you to the game page —
    but not for guests.
    So as a guest you need to paste the /game/:id manually in your browser.

### Card in the game page

    Sometimes the player card in Game page have written on them "NUMBER" instead of the actual number "9"

## Requirements

### Assignment 2

    Combined with assignment 3 with real players
        - screen for setting up a game ( lobby )
        - screen for playing ( game )
        - implemented with vue.js
        - using consistent composition API
        - it has a GameOverview screen but it is not used

### Assignment 3

        - can play against 1-3 human opponents
        - users can identify themselves
        - users can create a game
        - users can join existing game
        - users get notified when something happens
        - the server uses GraphQL communication protocol
        - user registration and login
        - server uses Apollo server

## Tests passed

    The number of tests passed/failed oscillates because of the randomizer but it should pass approximately 195+- tests
    40 failed, 198 passed (06.10)

## Notes

    In the model/ there were the following changes in the naming convention:
        DRAW -> DRAW CARD
        WILD -> WILD CARD

## Commands for development

    Backend (GraphQL):
        http://localhost:4000/graphql

    Frontend (Vue):
        http://localhost:5173/

    General
        npm install
        npm test
        npx jest deck.test.ts
        npx ts-node deck.ts
        npm create vue@latest client
        npm run dev

    MongoDB
        docker ps
        docker start mongodb
    or
        docker run -d -p 27017:27017 --name mongodb mongo:latest

### For Apollo Server testing (GraphQL mutations)

    mutation {
      register(username: "jakub", password: "123456") {
        token
        user {
          id
          username
        }
      }
    }

    mutation {
      login(username: "jakub", password: "123456") {
        token
        user {
          id
          username
        }
      }
    }

    mutation CreateGame($input: CreateGameInput!) {
      createGame(input: $input) {
        id
        creatorId
        creatorUsername
        players {
          username
        }
        maxPlayers
        createdAt
      }
    }

    {
      "input": {
        "maxPlayers": 4
      }
    }

    Header type: authorization + token from login

    mutation JoinGame($input: JoinGameInput!) {
      joinGame(input: $input) {
        id
        creatorId
        creatorUsername
        players {
          username
        }
        maxPlayers
        createdAt
      }
    }
