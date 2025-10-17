import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { typeDefs } from './typeDefs';
import { PubSub } from 'graphql-subscriptions';
import { resolvers } from './resolvers'
import 'dotenv/config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import jwt from 'jsonwebtoken';

const PORT = 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uno-game';
export const pubsub = new PubSub();

async function startServer() {
  console.log('Starting server...');
  console.log('MongoDB URI:', MONGODB_URI);
  const app = express();
  const httpServer = http.createServer(app);

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }

  console.log('Creating Apollo Server...');
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  })

  await server.start();
  console.log('Apollo Server started');
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

  useServer(
    {
      onConnect: () => console.log('WebSocket connected'),
      onDisconnect: () => console.log('WebSocket disconnected'),
    },
    wsServer
  );

  console.log('Setting up middleware...');
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

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  console.log('Starting HTTP server on port', PORT);
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
}

startServer().catch(console.error);