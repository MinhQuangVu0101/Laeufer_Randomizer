import type { Position } from '../constants';

export type PlayerWithPositions = {
  name: string;
  positions: Position[];
};

export type AssignedPlayer = {
  name: string;
  position: Position;
  preferences: Position[];
};

export type Team = Record<Position, AssignedPlayer[]>;

export type BenchPlayerWithPositions = {
  name: string;
  preferences: Position[];
};

export type GenerationInputPositions = {
  mode: 'positions';
  players: PlayerWithPositions[];
  team1NoLibero: boolean;
  team2NoLibero: boolean;
  teamSize: number;
};

export type GenerationInputSimple = {
  mode: 'simple';
  players: string[];
  teamSize: number;
};

export type GenerationInput = GenerationInputPositions | GenerationInputSimple;

export type GenerationFailure =
  | { ok: false; reason: 'no_players' }
  | { ok: false; reason: 'only_libero'; affectedPlayers: string[] }
  | { ok: false; reason: 'no_solution' };

export type GenerationSuccessPositions = {
  ok: true;
  mode: 'positions';
  team1: Team;
  team2: Team;
  bench: BenchPlayerWithPositions[];
};

export type GenerationSuccessSimple = {
  ok: true;
  mode: 'simple';
  team1: string[];
  team2: string[];
  bench: string[];
};

export type GenerationResult =
  | GenerationFailure
  | GenerationSuccessPositions
  | GenerationSuccessSimple;
