<script lang="ts">
  import { settings } from '../stores/settings.svelte';
  import { t } from '../i18n';
</script>

<header>
  <div class="brand">
    <h1>{t('appTitle')}</h1>
    <p class="subtitle">{t('subtitle')}</p>
  </div>
  <div class="header-actions">
    <button
      class="icon-btn"
      title="Theme"
      onclick={() => (settings.theme = settings.theme === 'dark' ? 'light' : 'dark')}
    >
      {settings.theme === 'dark' ? '☾' : '☀'}
    </button>
    <button
      class="icon-btn"
      title="Sprache / Language"
      onclick={() => (settings.lang = settings.lang === 'de' ? 'en' : 'de')}
    >
      {settings.lang.toUpperCase()}
    </button>
  </div>
</header>

<style>
  header {
    padding: 20px 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  .brand h1 {
    font-size: 1.55rem;
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: var(--text-1);
  }
  .brand .subtitle {
    color: var(--text-3);
    font-size: 0.85rem;
    margin-top: 4px;
    font-weight: 500;
  }
  .header-actions {
    display: flex;
    gap: 6px;
  }
  .icon-btn {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    color: var(--text-2);
    padding: 8px;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-family: var(--font-mono);
    min-width: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .icon-btn:hover {
    background: var(--bg-3);
  }
</style>
