export const MODES = {
  positions: 'positions',
  simple: 'simple',
} as const;

export type Mode = (typeof MODES)[keyof typeof MODES];

export const STORAGE_KEYS = {
  pool: 'vb_pool_v2',
  assignments: 'vb_assignments_v2',
  rosters: 'vb_rosters_v2',
  settings: 'vb_settings_v2',
  lang: 'vb_lang',
  theme: 'vb_theme',
  mode: 'vb_mode',
  migrations: 'vb_migrations',
} as const;

export const POSITION_IDS = ['aussen', 'mitte', 'zuspieler', 'libero', 'diagonal'] as const;

export type Position = (typeof POSITION_IDS)[number];

export type PositionMeta = {
  badge: string;
  max: number;
  color: string;
};

export const POSITION_META: Record<Position, PositionMeta> = {
  aussen: { badge: 'AA', max: 2, color: '#7dd3fc' },
  mitte: { badge: 'MB', max: 2, color: '#6ee7b7' },
  zuspieler: { badge: 'ZS', max: 1, color: '#fcd34d' },
  libero: { badge: 'LI', max: 1, color: '#fca5a5' },
  diagonal: { badge: 'DI', max: 1, color: '#c4b5fd' },
};

export const POSITION_NAME_KEYS = {
  aussen: 'posAussen',
  mitte: 'posMitte',
  zuspieler: 'posZuspieler',
  libero: 'posLibero',
  diagonal: 'posDiagonal',
} as const;

export const DEFAULT_TEAM_SIZE = 6;
export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 12;
