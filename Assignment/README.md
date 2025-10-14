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