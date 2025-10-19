## How to run

in the root

  npm install

for client 

  npm run dev

for server you need docker and you need to have a running mongo:db container

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

open http://localhost:5173/ in the browser

register 
login 
create a game
play

## Known bugs

### Start game button
Sometimes it can happen that if you register and log in as another user in a new tab and join a game, the start game button sometimes doesnt appear in the host window. To solve this, you need to log out and log in from the host browser window. 

### Automatic redirect as a guest
When you start a game as a host it will automatically redirect you to the game page but not guests, so as a guest you need to paste the /game/:id in your window

## Tests passed

40 failed, 198 passed 06.10

## Commands

http://localhost:4000/graphql

http://localhost:5173/

### General
  npm install

  npm test

  npx jest deck.test.ts

  npx ts-node deck.ts

  npm create vue@latest client

  npm run dev

### MongoDB
  docker ps

  docker start mongodb

or 

  docker run -d -p 27017:27017 --name mongodb mongo:latest

### For apollo server
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

header type: authorization + token from login

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