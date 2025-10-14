import { apolloClient } from './graphql'
import { gql } from '@apollo/client/core'

export const authService = {
    async login(username: string, password: string) {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation Login($username: String!, $password: String!) {
          login(username: $username, password: $password) {
            token
            user {
              id
              username
            }
          }
        }
      `,
            variables: { username, password }
        })
        return data.login
    },

    async register(username: string, password: string) {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation Register($username: String!, $password: String!) {
          register(username: $username, password: $password) {
            token
            user {
              id
              username
            }
          }
        }
      `,
            variables: { username, password }
        })
        return data.register
    }
}

export const lobbyService = {
    async getGames() {
        const { data } = await apolloClient.query({
            query: gql`
        query GetGames {
          games {
            id
            name
            players
            maxPlayers
            status
          }
        `
        })
        return data.games
    },

    async createGame(name: string, maxPlayers: number) {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation CreateGame($name: String!, $maxPlayers: Int!) {
          createGame(name: $name, maxPlayers: $maxPlayers) {
            id
            name
            players
            maxPlayers
            status
          }
        }
      `,
            variables: { name, maxPlayers }
        })
        return data.createGame
    },

    async joinGame(gameId: string) {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation JoinGame($gameId: ID!) {
          joinGame(gameId: $gameId) {
            id
            name
            players
            maxPlayers
            status
            gameState
          }
        }
      `,
            variables: { gameId }
        })
        return data.joinGame
    }
}

export const gameService = {
    async playCard(gameId: string, cardIndex: number, chosenColor?: string) {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation PlayCard($gameId: ID!, $cardIndex: Int!, $chosenColor: String) {
          playCard(gameId: $gameId, cardIndex: $cardIndex, chosenColor: $chosenColor) {
            success
            gameState
          }
        }
      `,
            variables: { gameId, cardIndex, chosenColor }
        })
        return data.playCard
    },

    async drawCard(gameId: string) {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation DrawCard($gameId: ID!) {
          drawCard(gameId: $gameId) {
            success
            gameState
          }
        }
      `,
            variables: { gameId }
        })
        return data.drawCard
    },

    async sayUno(gameId: string) {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation SayUno($gameId: ID!) {
          sayUno(gameId: $gameId) {
            success
          }
        }
      `,
            variables: { gameId }
        })
        return data.sayUno
    },

    async catchUnoFailure(gameId: string, accusedPlayerId: number) {
        const { data } = await apolloClient.mutate({
            mutation: gql`
        mutation CatchUnoFailure($gameId: ID!, $accusedPlayerId: Int!) {
          catchUnoFailure(gameId: $gameId, accusedPlayerId: $accusedPlayerId) {
            success
          }
        }
      `,
            variables: { gameId, accusedPlayerId }
        })
        return data.catchUnoFailure
    },

    subscribeToGame(gameId: string, callback: (data: any) => void) {
        return apolloClient.subscribe({
            query: gql`
        subscription OnGameUpdate($gameId: ID!) {
          gameUpdated(gameId: $gameId) {
            gameState
            event
            message
          }
        }
      `,
            variables: { gameId }
        }).subscribe({
            next: ({ data }) => callback(data.gameUpdated),
            error: (err) => console.error('Subscription error:', err)
        })
    }
}