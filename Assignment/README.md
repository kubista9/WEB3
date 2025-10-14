## Tests passed

40 failed, 198 passed 06.10

## Commands

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
  login(username: "jakub", password: "123456") {
    token
    user {
      id
      username
    }
  }
}

mutation {
  register(username: "jakub", password: "123456") {
    token
    user {
      id
      username
    }
  }
}