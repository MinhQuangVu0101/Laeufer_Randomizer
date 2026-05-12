import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

export const isSupabaseConfigured: boolean = supabase !== null;

export type SettingsRow = {
  user_id: string;
  mode: 'positions' | 'simple';
  theme: 'light' | 'dark' | 'system';
  lang: 'de' | 'en';
  team_size: number;
  team1_no_libero: boolean;
  team2_no_libero: boolean;
  pool: string[];
  assignments: Record<string, string[]>;
  simple_list: string[];
  updated_at: string;
};

export type RosterRow = {
  id: string;
  user_id: string;
  name: string;
  data: {
    mode: 'positions' | 'simple';
    assignments: Record<string, string[]>;
    simpleList: string[];
    teamSize: number;
    team1NoLibero: boolean;
    team2NoLibero: boolean;
  };
  updated_at: string;
};
