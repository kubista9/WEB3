import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';
import { PubSub } from 'graphql-subscriptions';
import 'dotenv/config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import jwt from 'jsonwebtoken'

const PORT = 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uno-game';

export const pubsub = new PubSub();

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  })


  await server.start();

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

  useServer(
    {
      onConnect: () => console.log('WebSocket connected'),
      onDisconnect: () => console.log('WebSocket disconnected'),
    },
    wsServer
  );

  app.use(
    '/graphql',
    cors({ origin: 'http://localhost:5173' }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const userId = req.headers.authorization || null;
        return { userId, pubsub };
      },
    })
  );

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);

  app.use(
    '/graphql',
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        let userId: string | null = null;

        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as any;
            userId = decoded.username;
          } catch (err) {
            console.error('Invalid token:', err);
          }
        }

        return { userId, pubsub };
      },
    })
  );

  startServer().catch(console.error);
}
