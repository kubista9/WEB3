import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  username: string;
  createdAt: Date;
}

export interface ICard {
  color: string;
  value: string;
}

export interface IMove extends Document {
  gameId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  username: string;
  cardPlayed?: ICard;
  drawCount?: number;
  cardDrawn?: ICard;
  timestamp: Date;
  saidUno: boolean;
}

export interface IPendingGame extends Document {
  creatorId: mongoose.Types.ObjectId;
  creatorUsername: string;
  players: Array<{ _id: mongoose.Types.ObjectId; username: string }>;
  maxPlayers: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface IActiveGame extends Document {
  players: Array<{ _id: mongoose.Types.ObjectId; username: string }>;
  currentPlayerIndex: number;
  direction: number;
  discardPile: ICard[];
  drawPile: ICard[];
  playerHands: Array<{
    playerId: mongoose.Types.ObjectId;
    username: string;
    hand: ICard[];
  }>;
  gameStatus: string;
  gameMemento: any; // Store serialized game state
  pendingGameId?: mongoose.Types.ObjectId;
  moves: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  completedAt?: Date;
}

export interface IGameHistory extends Document {
  players: Array<{ _id: mongoose.Types.ObjectId; username: string }>;
  rounds: number;
  winnerId: mongoose.Types.ObjectId;
  scores: Array<{ playerId: mongoose.Types.ObjectId; username: string; score: number }>;
  completedAt: Date;
}

// Player Schema
const playerSchema = new Schema<IPlayer>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
    },
  },
  { timestamps: true }
);

// Move Schema
const moveSchema = new Schema<IMove>(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'ActiveGame',
      required: true,
    },
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    username: { type: String, required: true },
    cardPlayed: {
      color: String,
      value: String,
    },
    drawCount: Number,
    cardDrawn: {
      color: String,
      value: String,
    },
    timestamp: { type: Date, default: Date.now },
    saidUno: { type: Boolean, default: false },
  }
);

// Pending Game Schema
const pendingGameSchema = new Schema<IPendingGame>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    creatorUsername: { type: String, required: true },
    players: [
      {
        _id: { type: Schema.Types.ObjectId, ref: 'Player' },
        username: String,
      },
    ],
    maxPlayers: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: false }
);

// Add TTL index to auto-delete expired pending games
pendingGameSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Active Game Schema
const activeGameSchema = new Schema<IActiveGame>(
  {
    players: [
      {
        _id: { type: Schema.Types.ObjectId, ref: 'Player' },
        username: String,
      },
    ],
    currentPlayerIndex: { type: Number, required: true },
    direction: { type: Number, default: 1 },
    discardPile: [
      {
        color: String,
        value: String,
      },
    ],
    drawPile: [
      {
        color: String,
        value: String,
      },
    ],
    playerHands: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
        username: String,
        hand: [
          {
            color: String,
            value: String,
          },
        ],
      },
    ],
    gameStatus: { type: String, enum: ['active', 'finished'], default: 'active' },
    gameMemento: { type: Schema.Types.Mixed, required: true }, // Store serialized game state
    pendingGameId: { type: Schema.Types.ObjectId, ref: 'PendingGame' },
    moves: [{ type: Schema.Types.ObjectId, ref: 'Move' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
);

// Game History Schema
const gameHistorySchema = new Schema<IGameHistory>(
  {
    players: [
      {
        _id: { type: Schema.Types.ObjectId, ref: 'Player' },
        username: String,
      },
    ],
    rounds: { type: Number, required: true },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    scores: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
        username: String,
        score: Number,
      },
    ],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Create Models
export const Player = mongoose.model<IPlayer>('Player', playerSchema);
export const Move = mongoose.model<IMove>('Move', moveSchema);
export const PendingGame = mongoose.model<IPendingGame>('PendingGame', pendingGameSchema);
export const ActiveGame = mongoose.model<IActiveGame>('ActiveGame', activeGameSchema);
export const GameHistory = mongoose.model<IGameHistory>('GameHistory', gameHistorySchema);