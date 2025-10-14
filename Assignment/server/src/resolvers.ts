import { GraphQLError } from 'graphql';
import { Player, PendingGame, ActiveGame, GameHistory, UserModel } from './models.js';
import { pubsub } from './server.js';
import { PubSub } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import { Game } from '../../model/game';
import { Round } from '../../model/round';
import { standardShuffler, standardRandomizer } from '../..//utils/random_utils';
import type { Card, Color, GameMemento, RoundMemento } from '../../model/interfaces';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const GAME_UPDATED = 'GAME_UPDATED';
const PENDING_GAME_UPDATED = 'PENDING_GAME_UPDATED';
const GAME_FINISHED = 'GAME_FINISHED';

interface Context {
  userId: string | null;
  pubsub: PubSub;
}

const activeGamesMap = new Map<string, Game>();

// Helper functions
async function getOrCreatePlayer(username: string) {
  let player = await Player.findOne({ username });
  if (!player) {
    player = await Player.create({ username });
  }
  return player;
}

function validateGameExists(game: any, message = 'Game not found') {
  if (!game) {
    throw new GraphQLError(message, { extensions: { code: 'GAME_NOT_FOUND' } });
  }
}

function validateContext(userId: string | null): string {
  if (!userId) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return userId;
}

function cardToGraphQL(card: Card | Record<string, string | number>) {
  const c = card as any;
  return {
    type: c.type,
    color: c.color ?? null,
    number: c.number ?? null,
  };
}

function roundToGraphQL(round: Round, gameId: string) {
  const discardTop = round.discardPile().peek();
  return {
    id: gameId,
    players: Array.from({ length: round.playerCount }, (_, i) => ({
      id: i.toString(),
      username: round.player(i),
    })),
    currentPlayerIndex: round.playerInTurn() ?? 0,
    currentPlayer: {
      id: (round.playerInTurn() ?? 0).toString(),
      username: round.player(round.playerInTurn() ?? 0),
    },
    dealer: {
      id: round.dealer.toString(),
      username: round.player(round.dealer),
    },
    direction: round.discardPile().toMemento()[0]?.type === 'REVERSE' ? -1 : 1,
    discardPile: round.discardPile().toMemento().slice(0, 5).map(cardToGraphQL),
    drawPileSize: round.drawPile().size,
    playerHands: Array.from({ length: round.playerCount }, (_, i) => ({
      playerId: i.toString(),
      username: round.player(i),
      cardCount: round.playerHand(i).length,
      hand: round.playerHand(i).map(cardToGraphQL),
    })),
    gameStatus: round.hasEnded() ? 'finished' : 'active',
    hasEnded: round.hasEnded(),
    winner: round.winner() !== undefined ? {
      id: round.winner()!.toString(),
      username: round.player(round.winner()!),
    } : null,
  };
}

export const resolvers = {
  Query: {
    async me(_: any, __: any, { userId }: Context) {
      if (!userId) return null;
      return Player.findById(userId);
    },

    async pendingGames() {
      return PendingGame.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
    },

    async pendingGame(_: any, { id }: { id: string }) {
      const game = await PendingGame.findById(id);
      validateGameExists(game);
      return game;
    },

    async activeGame(_: any, { id }: { id: string }) {
      const dbGame = await ActiveGame.findById(id);
      validateGameExists(dbGame);

      const gameInstance = activeGamesMap.get(id);
      if (!gameInstance) {
        throw new GraphQLError('Game instance not found', {
          extensions: { code: 'GAME_NOT_FOUND' },
        });
      }

      const round = gameInstance.currentRound();
      if (!round) {
        throw new GraphQLError('Round not found', {
          extensions: { code: 'ROUND_NOT_FOUND' },
        });
      }

      return {
        ...roundToGraphQL(round, id),
        gameId: id,
      };
    },

    async playerGames(_: any, __: any, { userId }: Context) {
      const userId_validated = validateContext(userId);
      const player = await Player.findById(userId_validated);
      if (!player) return [];

      const pending = await PendingGame.find({ 'players._id': player._id });
      return pending ?? [];
    },
  },

  Mutation: {
    async register(
      _: any,
      { username, password }: { username: string; password: string }
    ) {
      const existing = await UserModel.findOne({ username });
      if (existing) {
        throw new GraphQLError('User already exists', {
          extensions: { code: 'USER_EXISTS' },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ username, password: hashedPassword });

      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET || 'supersecretkey'
      );

      return {
        token,
        user: {
          id: username,
          username,
        },
      };
    },

    async login(
      _: any,
      { username, password }: { username: string; password: string }
    ) {
      const user = await UserModel.findOne({ username });
      if (!user) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'USER_NOT_FOUND' },
        });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new GraphQLError('Invalid password', {
          extensions: { code: 'INVALID_PASSWORD' },
        });
      }

      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET || 'supersecretkey'
      );

      return {
        token,
        user: {
          id: username,
          username,
        },
      };
    },

    async createGame(
      _: any,
      { input }: { input: { maxPlayers: number } },
      { userId, pubsub }: Context
    ) {
      const username = validateContext(userId);

      const game = await PendingGame.create({
        creatorId: username,
        creatorUsername: username,
        players: [{ username }],
        maxPlayers: input.maxPlayers,
      });

      await pubsub.publish(PENDING_GAME_UPDATED, {
        pendingGameUpdated: game,
      });

      return game;
    },

    async joinGame(
      _: any,
      { input }: { input: { gameId: string; username: string } },
      { pubsub }: Context
    ) {
      const player = await getOrCreatePlayer(input.username);
      const game = await PendingGame.findById(input.gameId);
      validateGameExists(game, 'Pending game not found');

      if (!game) {
        throw new GraphQLError('Game not found', {
          extensions: { code: 'GAME_NOT_FOUND' },
        });
      }

      const playerExists = game.players.some(
        (p: any) => p._id?.toString() === player._id?.toString()
      );

      if (playerExists) {
        throw new GraphQLError('Player already in game', {
          extensions: { code: 'PLAYER_ALREADY_JOINED' },
        });
      }

      if (game.players.length >= game.maxPlayers) {
        throw new GraphQLError('Game is full', {
          extensions: { code: 'GAME_FULL' },
        });
      }

      game.players.push({
        username: player.username,
      });

      await game.save();
      await pubsub.publish(PENDING_GAME_UPDATED, {
        pendingGameUpdated: game,
      });

      return game;
    },

    async startGame(
      _: any,
      { input }: { input: { gameId: string } },
      { userId, pubsub }: Context
    ) {
      const userId_validated = validateContext(userId);
      const pendingGame = await PendingGame.findById(input.gameId);
      validateGameExists(pendingGame, 'Pending game not found');

      if (!pendingGame) {
        throw new GraphQLError('Game not found', {
          extensions: { code: 'GAME_NOT_FOUND' },
        });
      }

      if (pendingGame.creatorId.toString() !== userId_validated) {
        throw new GraphQLError('Only game creator can start the game', {
          extensions: { code: 'UNAUTHORIZED' },
        });
      }

      if (pendingGame.players.length < 2) {
        throw new GraphQLError('Need at least 2 players', {
          extensions: { code: 'INSUFFICIENT_PLAYERS' },
        });
      }

      // Create Game instance
      const playerNames = pendingGame.players.map((p: any) => p.username);
      const gameInstance = new Game(
        playerNames,
        500,
        standardShuffler,
        standardRandomizer,
        7
      );

      // Create ActiveGame in DB
      const activeGame = await ActiveGame.create({
        pendingGameId: input.gameId,
        players: pendingGame.players,
        gameMemento: gameInstance.toMemento(),
        gameStatus: 'active',
        createdAt: new Date(),
      });

      const gameId = (activeGame._id as any).toString();

      // Store game instance in memory
      activeGamesMap.set(gameId, gameInstance);

      // Set up game end listener
      const round = gameInstance.currentRound();
      if (round) {
        round.onEnd((event: { winner: number }) => {
          const roundScore = round.score();
          handleRoundEnd(gameId, event.winner, roundScore, pubsub);
        });
      }

      // Delete pending game
      await PendingGame.deleteOne({ _id: input.gameId });

      // Publish update
      const graphqlGame = {
        ...roundToGraphQL(round!, gameId),
        gameId,
      };

      await pubsub.publish(`${GAME_UPDATED}_${gameId}`, {
        gameUpdated: graphqlGame,
      });

      return graphqlGame;
    },

    async playCard(
      _: any,
      { input }: { input: { gameId: string; cardIndex: number; saidUno: boolean; chosenColor?: string } },
      { userId, pubsub }: Context
    ) {
      const userId_validated = validateContext(userId);
      const gameInstance = activeGamesMap.get(input.gameId);

      if (!gameInstance) {
        throw new GraphQLError('Game not found', {
          extensions: { code: 'GAME_NOT_FOUND' },
        });
      }

      const round = gameInstance.currentRound();
      if (!round) {
        throw new GraphQLError('No active round', {
          extensions: { code: 'NO_ACTIVE_ROUND' },
        });
      }

      const currentPlayerIndex = round.playerInTurn();
      if (currentPlayerIndex === undefined) {
        throw new GraphQLError('No current player', {
          extensions: { code: 'NO_CURRENT_PLAYER' },
        });
      }

      const currentPlayer = round.player(currentPlayerIndex);
      const player = await Player.findById(userId_validated);
      if (!player || player.username !== currentPlayer) {
        throw new GraphQLError('Not your turn', {
          extensions: { code: 'NOT_YOUR_TURN' },
        });
      }

      if (!round.canPlay(input.cardIndex)) {
        throw new GraphQLError('Cannot play this card', {
          extensions: { code: 'INVALID_MOVE' },
        });
      }

      try {
        // Play the card
        round.play(input.cardIndex, input.chosenColor as Color);

        if (input.saidUno) {
          round.sayUno(currentPlayerIndex);
        }

        // Save game state
        await ActiveGame.updateOne(
          { _id: input.gameId },
          { gameMemento: gameInstance.toMemento() }
        );

        // Check if round ended
        if (round.hasEnded()) {
          const winner = round.winner();
          const score = round.score();

          if (winner !== undefined && score !== undefined) {
            // Publish game finished event
            const winnerName = round.player(winner);
            await pubsub.publish(`${GAME_FINISHED}_${input.gameId}`, {
              gameFinished: {
                winnerId: winner.toString(),
                winnerUsername: winnerName,
                score,
              },
            });

            // Store game history
            const scores = Array.from({ length: round.playerCount }, (_, i) => ({
              playerId: i.toString(),
              username: round.player(i),
              score: i === winner ? score : 0,
            }));

            await GameHistory.create({
              gameId: input.gameId,
              players: Array.from({ length: round.playerCount }, (_, i) => ({
                username: round.player(i),
              })),
              winnerId: winnerName,
              scores,
              completedAt: new Date(),
            });
          }
        }

        // Publish game update
        const graphqlGame = {
          ...roundToGraphQL(round, input.gameId),
          gameId: input.gameId,
        };

        await pubsub.publish(`${GAME_UPDATED}_${input.gameId}`, {
          gameUpdated: graphqlGame,
        });

        return graphqlGame;
      } catch (error) {
        throw new GraphQLError(`Failed to play card: ${error}`, {
          extensions: { code: 'PLAY_CARD_ERROR' },
        });
      }
    },

    async drawCard(
      _: any,
      { gameId }: { gameId: string },
      { userId, pubsub }: Context
    ) {
      const userId_validated = validateContext(userId);
      const gameInstance = activeGamesMap.get(gameId);

      if (!gameInstance) {
        throw new GraphQLError('Game not found', {
          extensions: { code: 'GAME_NOT_FOUND' },
        });
      }

      const round = gameInstance.currentRound();
      if (!round) {
        throw new GraphQLError('No active round', {
          extensions: { code: 'NO_ACTIVE_ROUND' },
        });
      }

      const currentPlayerIndex = round.playerInTurn();
      if (currentPlayerIndex === undefined) {
        throw new GraphQLError('No current player', {
          extensions: { code: 'NO_CURRENT_PLAYER' },
        });
      }

      const currentPlayer = round.player(currentPlayerIndex);
      const player = await Player.findById(userId_validated);
      if (!player || player.username !== currentPlayer) {
        throw new GraphQLError('Not your turn', {
          extensions: { code: 'NOT_YOUR_TURN' },
        });
      }

      try {
        round.draw();

        // Save game state
        await ActiveGame.updateOne(
          { _id: gameId },
          { gameMemento: gameInstance.toMemento() }
        );

        // Publish update
        const graphqlGame = {
          ...roundToGraphQL(round, gameId),
          gameId,
        };

        await pubsub.publish(`${GAME_UPDATED}_${gameId}`, {
          gameUpdated: graphqlGame,
        });

        return graphqlGame;
      } catch (error) {
        throw new GraphQLError(`Failed to draw card: ${error}`, {
          extensions: { code: 'DRAW_CARD_ERROR' },
        });
      }
    },

    async callUno(
      _: any,
      { gameId, playerIndex }: { gameId: string; playerIndex: number },
      { pubsub }: Context
    ) {
      const gameInstance = activeGamesMap.get(gameId);

      if (!gameInstance) {
        throw new GraphQLError('Game not found', {
          extensions: { code: 'GAME_NOT_FOUND' },
        });
      }

      const round = gameInstance.currentRound();
      if (!round) {
        throw new GraphQLError('No active round', {
          extensions: { code: 'NO_ACTIVE_ROUND' },
        });
      }

      try {
        round.sayUno(playerIndex);

        // Save game state
        await ActiveGame.updateOne(
          { _id: gameId },
          { gameMemento: gameInstance.toMemento() }
        );

        const graphqlGame = {
          ...roundToGraphQL(round, gameId),
          gameId,
        };

        await pubsub.publish(`${GAME_UPDATED}_${gameId}`, {
          gameUpdated: graphqlGame,
        });

        return graphqlGame;
      } catch (error) {
        throw new GraphQLError(`Failed to call uno: ${error}`, {
          extensions: { code: 'CALL_UNO_ERROR' },
        });
      }
    },

    async catchUnoFailure(
      _: any,
      { input }: { input: { gameId: string; accuser: number; accused: number } },
      { pubsub }: Context
    ) {
      const gameInstance = activeGamesMap.get(input.gameId);

      if (!gameInstance) {
        throw new GraphQLError('Game not found', {
          extensions: { code: 'GAME_NOT_FOUND' },
        });
      }

      const round = gameInstance.currentRound();
      if (!round) {
        throw new GraphQLError('No active round', {
          extensions: { code: 'NO_ACTIVE_ROUND' },
        });
      }

      try {
        const success = round.catchUnoFailure({
          accuser: input.accuser,
          accused: input.accused,
        });

        // Save game state
        await ActiveGame.updateOne(
          { _id: input.gameId },
          { gameMemento: gameInstance.toMemento() }
        );

        const graphqlGame = {
          ...roundToGraphQL(round, input.gameId),
          gameId: input.gameId,
          challengeSuccess: success,
        };

        await pubsub.publish(`${GAME_UPDATED}_${input.gameId}`, {
          gameUpdated: graphqlGame,
        });

        return graphqlGame;
      } catch (error) {
        throw new GraphQLError(`Failed to catch uno failure: ${error}`, {
          extensions: { code: 'CATCH_UNO_ERROR' },
        });
      }
    },

    async leaveGame(
      _: any,
      { gameId }: { gameId: string },
      { userId, pubsub }: Context
    ) {
      const userId_validated = validateContext(userId);
      const game = await PendingGame.findById(gameId);

      if (!game) return false;

      game.players = game.players.filter(
        (p: any) => p._id.toString() !== userId_validated
      );

      if (game.players.length === 0) {
        await PendingGame.deleteOne({ _id: gameId });
      } else {
        await game.save();
        await pubsub.publish(`${PENDING_GAME_UPDATED}_${gameId}`, {
          pendingGameUpdated: game,
        });
      }

      return true;
    },
  },

  Subscription: {
    gameUpdated: {
      subscribe: (_: any, { gameId }: { gameId: string }) => {
        return pubsub.asyncIterator([`${GAME_UPDATED}_${gameId}`]) as any;
      },
      resolve: (payload: any) => payload.gameUpdated,
    },

    pendingGameUpdated: {
      subscribe: (_: any, { gameId }: { gameId: string }) => {
        return pubsub.asyncIterator([`${PENDING_GAME_UPDATED}_${gameId}`]) as any;
      },
      resolve: (payload: any) => payload.pendingGameUpdated,
    },

    gameFinished: {
      subscribe: (_: any, { gameId }: { gameId: string }) => {
        return pubsub.asyncIterator([`${GAME_FINISHED}_${gameId}`]) as any;
      },
      resolve: (payload: any) => payload.gameFinished,
    },
  },
};

async function handleRoundEnd(
  gameId: string,
  winner: number,
  score: number | undefined,
  pubsub: PubSub
) {
  const gameInstance = activeGamesMap.get(gameId);
  if (!gameInstance) return;

  const round = gameInstance.currentRound();
  if (!round) return;

  const winnerName = round.player(winner);

  // Store game history
  const scores = Array.from({ length: round.playerCount }, (_, i) => ({
    playerId: i.toString(),
    username: round.player(i),
    score: i === winner ? (score ?? 0) : 0,
  }));

  await GameHistory.create({
    gameId,
    players: Array.from({ length: round.playerCount }, (_, i) => ({
      username: round.player(i),
    })),
    winnerId: winnerName,
    scores,
    completedAt: new Date(),
  });

  // Publish finished event
  await pubsub.publish(`${GAME_FINISHED}_${gameId}`, {
    gameFinished: {
      winnerId: winner.toString(),
      winnerUsername: winnerName,
      score: score ?? 0,
    },
  });
}