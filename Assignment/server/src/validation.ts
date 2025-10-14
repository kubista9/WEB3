import * as z from 'zod';

// Card schema
const CardSchema = z.object({
  color: z.string(),
  value: z.string(),
});

// Player schema
const PlayerSchema = z.object({
  _id: z.string().optional(),
  username: z.string().min(1).max(50),
});

export type Player = z.infer<typeof PlayerSchema>;
export type Card = z.infer<typeof CardSchema>;

// Game creation input
const CreateGameInputSchema = z.object({
  maxPlayers: z.number().min(2).max(10),
  username: z.string().min(1).max(50),
});

export type CreateGameInput = z.infer<typeof CreateGameInputSchema>;

// Join game input
const JoinGameInputSchema = z.object({
  gameId: z.string().min(1),
  username: z.string().min(1).max(50),
});

export type JoinGameInput = z.infer<typeof JoinGameInputSchema>;

// Play card input
const PlayCardInputSchema = z.object({
  gameId: z.string().min(1),
  cardIndex: z.number().min(0),
  saidUno: z.boolean(),
});

export type PlayCardInput = z.infer<typeof PlayCardInputSchema>;

// Start game input
const StartGameInputSchema = z.object({
  gameId: z.string().min(1),
});

export type StartGameInput = z.infer<typeof StartGameInputSchema>;

// Draw card input
const DrawCardInputSchema = z.object({
  gameId: z.string().min(1),
});

export type DrawCardInput = z.infer<typeof DrawCardInputSchema>;

// Challenge Uno input
const ChallengeUnoInputSchema = z.object({
  gameId: z.string().min(1),
});

export type ChallengeUnoInput = z.infer<typeof ChallengeUnoInputSchema>;

// Validation functions
export function validateCreateGameInput(data: unknown) {
  return CreateGameInputSchema.safeParse(data);
}

export function validateJoinGameInput(data: unknown) {
  return JoinGameInputSchema.safeParse(data);
}

export function validatePlayCardInput(data: unknown) {
  return PlayCardInputSchema.safeParse(data);
}

export function validateStartGameInput(data: unknown) {
  return StartGameInputSchema.safeParse(data);
}

export function validateDrawCardInput(data: unknown) {
  return DrawCardInputSchema.safeParse(data);
}

export function validateChallengeUnoInput(data: unknown) {
  return ChallengeUnoInputSchema.safeParse(data);
}

export function validatePlayer(data: unknown) {
  return PlayerSchema.safeParse(data);
}

export function validateCard(data: unknown) {
  return CardSchema.safeParse(data);
}