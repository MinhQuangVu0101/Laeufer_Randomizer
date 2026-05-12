import { supabase, isSupabaseConfigured } from '../db/supabase';

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthState = 'anonymous' | 'awaiting_otp' | 'authenticated';

export class AuthStore {
  private innerUser = $state<AuthUser | null>(null);
  private innerState = $state<AuthState>('anonymous');
  private innerPendingEmail = $state<string>('');
  private innerError = $state<string | null>(null);
  private innerLoading = $state(false);

  get user() {
    return this.innerUser;
  }
  get state() {
    return this.innerState;
  }
  get pendingEmail() {
    return this.innerPendingEmail;
  }
  get error() {
    return this.innerError;
  }
  get loading() {
    return this.innerLoading;
  }
  get isAuthenticated() {
    return this.innerState === 'authenticated' && this.innerUser !== null;
  }

  constructor() {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user?.email) {
        this.innerUser = { id: session.user.id, email: session.user.email };
        this.innerState = 'authenticated';
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        this.innerUser = { id: session.user.id, email: session.user.email };
        this.innerState = 'authenticated';
        this.innerError = null;
      } else if (this.innerState !== 'awaiting_otp') {
        this.innerUser = null;
        this.innerState = 'anonymous';
      }
    });
  }

  async sendOtp(email: string): Promise<{ ok: boolean; error?: string }> {
    if (!supabase) return { ok: false, error: 'Supabase not configured' };
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return { ok: false, error: 'Email required' };
    this.innerLoading = true;
    this.innerError = null;
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: true },
      });
      if (error) {
        this.innerError = error.message;
        return { ok: false, error: error.message };
      }
      this.innerPendingEmail = trimmed;
      this.innerState = 'awaiting_otp';
      return { ok: true };
    } finally {
      this.innerLoading = false;
    }
  }

  async verifyOtp(token: string): Promise<{ ok: boolean; error?: string }> {
    if (!supabase) return { ok: false, error: 'Supabase not configured' };
    const cleaned = token.trim();
    if (!cleaned) return { ok: false, error: 'Code required' };
    if (!this.innerPendingEmail) return { ok: false, error: 'No pending email' };
    this.innerLoading = true;
    this.innerError = null;
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: this.innerPendingEmail,
        token: cleaned,
        type: 'email',
      });
      if (error) {
        this.innerError = error.message;
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } finally {
      this.innerLoading = false;
    }
  }

  cancelOtp() {
    this.innerState = 'anonymous';
    this.innerPendingEmail = '';
    this.innerError = null;
  }

  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
    this.innerUser = null;
    this.innerState = 'anonymous';
    this.innerPendingEmail = '';
  }
}

export const auth: AuthStore | null = isSupabaseConfigured ? new AuthStore() : null;
