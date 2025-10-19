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