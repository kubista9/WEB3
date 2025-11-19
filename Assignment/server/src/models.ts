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
  playerId: string;
  username: string;
  cardPlayed?: ICard;
  drawCount?: number;
  cardDrawn?: ICard;
  timestamp: Date;
  saidUno: boolean;
}

export interface IPendingGame extends Document {
  creatorId: string;
  creatorUsername: string;
  players: Array<{ username: string }>;
  maxPlayers: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface IActiveGame extends Document {
  players: Array<{ username: string }>;
  currentPlayerIndex: number;
  direction: number;
  discardPile: ICard[];
  drawPile: ICard[];
  playerHands: Array<{
    playerId: string;
    username: string;
    hand: ICard[];
  }>;
  gameStatus: string;
  gameMemento: any;
  pendingGameId?: mongoose.Types.ObjectId;
  moves: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  startedAt: Date;
  completedAt?: Date;
}

export interface IGameHistory extends Document {
  players: Array<{ username: string }>;
  rounds: number;
  winnerId: string;
  scores: Array<{ playerId: string; username: string; score: number }>;
  completedAt: Date;
}

export interface IUser extends Document {
  username: string;
  password: string;
  createdAt: Date;
}

const playerSchema = new Schema<IPlayer>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      primaryKey: true,
    },
  },
  { timestamps: true }
);

const moveSchema = new Schema<IMove>(
  {
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'ActiveGame',
      required: true,
    },
    playerId: {
      type: String,
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

const pendingGameSchema = new Schema<IPendingGame>(
  {
    creatorId: {
      type: String,
      required: true,
    },
    creatorUsername: { type: String, required: true },
    players: [
      {
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

pendingGameSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const activeGameSchema = new Schema<IActiveGame>(
  {
    players: [
      {
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
        playerId: String,
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
    gameMemento: { type: Schema.Types.Mixed, required: false },
    pendingGameId: { type: Schema.Types.ObjectId, ref: 'PendingGame' },
    moves: [{ type: Schema.Types.ObjectId, ref: 'Move' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
);

const gameHistorySchema = new Schema<IGameHistory>(
  {
    players: [
      {
        username: String,
      },
    ],
    rounds: { type: Number, required: true },
    winnerId: {
      type: String,
      required: true,
    },
    scores: [
      {
        playerId: String,
        username: String,
        score: Number,
      },
    ],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const Player = mongoose.model<IPlayer>('Player', playerSchema);
export const Move = mongoose.model<IMove>('Move', moveSchema);
export const PendingGame = mongoose.model<IPendingGame>('PendingGame', pendingGameSchema);
export const ActiveGame = mongoose.model<IActiveGame>('ActiveGame', activeGameSchema);
export const GameHistory = mongoose.model<IGameHistory>('GameHistory', gameHistorySchema);
export const UserModel = mongoose.model<IUser>('User', userSchema);