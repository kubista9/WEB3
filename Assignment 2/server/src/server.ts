import express, { Request, Response } from 'express'
import http from 'http'
import cors from 'cors'
import mongoose from 'mongoose'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from './typeDefs'
import { resolvers } from './resolvers'
import { PubSub } from 'graphql-subscriptions'
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'

const PORT = 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uno-game'
export const pubsub = new PubSub()

async function startServer() {
  const app = express()
  const httpServer = http.createServer(app)

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await wsServer.close()
            },
          }
        },
      },
    ],
  })

  await server.start()
  console.log('Apollo Server started')

  useServer(
    {
      schema,
      context: async (ctx) => {
        const authHeader = (ctx.connectionParams as Record<string, string> | undefined)?.authorization
        const token = authHeader?.replace('Bearer ', '')
        let userId: string | null = null

        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as any
            userId = decoded.username
          } catch (err) {
            console.error('Invalid WS token:', err)
          }
        }
        return { userId, pubsub }
      },
      onConnect: () => console.log('🔌 WebSocket connected'),
      onDisconnect: () => console.log('🔌 WebSocket disconnected'),
    },
    wsServer
  )

  app.use(
    '/graphql',
    cors({ origin: 'http://localhost:5173', credentials: true }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '')
        let userId: string | null = null
        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as any
            userId = decoded.username
          } catch (err) {
            console.error('Invalid HTTP token:', err)
          }
        }
        return { userId, pubsub }
      },
    })
  )

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' })
  })

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  )
  console.log(`Server ready at http://localhost:${PORT}/graphql`)
  console.log(`Subscriptions ready at ws://localhost:${PORT}/graphql`)
}

startServer().catch(console.error)