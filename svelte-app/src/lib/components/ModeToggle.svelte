<script lang="ts">
  import { settings } from '../stores/settings.svelte';
  import { t } from '../i18n';
</script>

<div class="mode-toggle">
  <button
    class="mode-btn"
    class:active={settings.mode === 'positions'}
    onclick={() => (settings.mode = 'positions')}
  >
    {t('modePositions')}
  </button>
  <button
    class="mode-btn"
    class:active={settings.mode === 'simple'}
    onclick={() => (settings.mode = 'simple')}
  >
    {t('modeSimple')}
  </button>
</div>

<style>
  .mode-toggle {
    display: flex;
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 3px;
    margin-bottom: 14px;
  }
  .mode-btn {
    flex: 1;
    padding: 10px;
    border: 0;
    background: transparent;
    color: var(--text-3);
    font-size: 0.88rem;
    font-weight: 500;
    border-radius: calc(var(--radius) - 4px);
    transition: all 0.15s;
  }
  .mode-btn.active {
    background: var(--accent);
    color: var(--text-inverse);
    font-weight: 600;
  }
</style>
