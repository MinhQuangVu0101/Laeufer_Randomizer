<script lang="ts">
  import { auth } from '../stores/auth.svelte';
  import { toast } from '../stores/toast.svelte';
  import { t } from '../i18n';
  import { isSupabaseConfigured } from '../db/supabase';

  let modalOpen = $state(false);
  let email = $state('');
  let otp = $state('');

  function openModal() {
    if (!auth) return;
    auth.cancelOtp();
    email = '';
    otp = '';
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
    auth?.cancelOtp();
  }

  async function handleSendOtp(e: Event) {
    e.preventDefault();
    if (!auth) return;
    const r = await auth.sendOtp(email);
    if (r.ok) {
      toast.show(t('authToastOtpSent'));
    } else {
      toast.show(r.error ?? t('authError'));
    }
  }

  async function handleVerifyOtp(e: Event) {
    e.preventDefault();
    if (!auth) return;
    const r = await auth.verifyOtp(otp);
    if (r.ok) {
      modalOpen = false;
      toast.show(t('authToastSignedIn'));
    } else {
      toast.show(r.error ?? t('authError'));
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    await auth.signOut();
    toast.show(t('authToastSignedOut'));
  }
</script>

{#if isSupabaseConfigured && auth}
  <div class="auth-bar">
    {#if auth.isAuthenticated && auth.user}
      <button class="auth-pill authed" onclick={handleSignOut} title={t('authSignOut')}>
        <span class="dot"></span>
        <span class="email">{auth.user.email}</span>
        <span class="sep">·</span>
        <span class="signout">{t('authSignOut')}</span>
      </button>
    {:else}
      <button class="auth-pill" onclick={openModal}>{t('authActivate')}</button>
    {/if}
  </div>

  {#if modalOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="backdrop" onclick={closeModal}>
      <div class="modal" onclick={(e) => e.stopPropagation()}>
        {#if auth.state !== 'awaiting_otp'}
          <h3>{t('authEmailTitle')}</h3>
          <p class="hint">{t('authEmailHint')}</p>
          <form onsubmit={handleSendOtp}>
            <label for="auth-email">{t('authEmailLabel')}</label>
            <input
              id="auth-email"
              type="email"
              autocomplete="email"
              required
              placeholder={t('authEmailPlaceholder')}
              bind:value={email}
              disabled={auth.loading}
            />
            <div class="modal-actions">
              <button type="button" class="btn-muted" onclick={closeModal} disabled={auth.loading}>
                {t('authCancel')}
              </button>
              <button type="submit" class="btn-primary" disabled={auth.loading || !email}>
                {t('authSendOtp')}
              </button>
            </div>
          </form>
        {:else}
          <h3>{t('authOtpTitle')}</h3>
          <p class="hint">{t('authOtpHint', { email: auth.pendingEmail })}</p>
          <form onsubmit={handleVerifyOtp}>
            <label for="auth-otp">{t('authOtpLabel')}</label>
            <input
              id="auth-otp"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              pattern="[0-9]{'{6}'}"
              maxlength="6"
              required
              placeholder={t('authOtpPlaceholder')}
              bind:value={otp}
              disabled={auth.loading}
            />
            <div class="modal-actions">
              <button
                type="button"
                class="btn-muted"
                onclick={() => {
                  auth?.cancelOtp();
                  otp = '';
                }}
                disabled={auth.loading}
              >
                {t('authChangeEmail')}
              </button>
              <button type="submit" class="btn-primary" disabled={auth.loading || !otp}>
                {t('authVerify')}
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  .auth-bar {
    margin-bottom: 14px;
    display: flex;
    justify-content: flex-end;
  }
  .auth-pill {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    color: var(--accent);
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .auth-pill:hover {
    background: var(--bg-3);
  }
  .auth-pill.authed {
    color: var(--text-2);
  }
  .auth-pill.authed .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
  }
  .auth-pill .email {
    color: var(--text-1);
    font-weight: 600;
  }
  .auth-pill .sep {
    color: var(--text-3);
  }
  .auth-pill .signout {
    color: var(--text-3);
    font-size: 0.75rem;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    backdrop-filter: blur(2px);
  }
  .modal {
    background: var(--bg-1);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 20px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  }
  .modal h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 6px;
    color: var(--text-1);
  }
  .modal .hint {
    color: var(--text-3);
    font-size: 0.82rem;
    margin: 0 0 16px;
    line-height: 1.5;
  }
  .modal label {
    display: block;
    color: var(--text-2);
    font-size: 0.78rem;
    font-weight: 500;
    margin-bottom: 4px;
  }
  .modal input {
    width: 100%;
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius-sm);
    color: var(--text-1);
    padding: 10px 12px;
    font-size: 0.95rem;
    font-family: inherit;
    margin-bottom: 14px;
  }
  .modal input:focus {
    outline: none;
    border-color: var(--accent);
  }
  .modal input[id='auth-otp'] {
    font-family: var(--font-mono);
    letter-spacing: 0.3em;
    text-align: center;
    font-size: 1.2rem;
  }
  .modal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .btn-primary {
    background: var(--accent);
    color: var(--text-inverse);
    border: 0;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.88rem;
    cursor: pointer;
    font-family: inherit;
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn-muted {
    background: transparent;
    color: var(--text-3);
    border: 1px solid var(--border-1);
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    font-size: 0.88rem;
    cursor: pointer;
    font-family: inherit;
  }
</style>
