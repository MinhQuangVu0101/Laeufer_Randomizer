<script lang="ts">
  import { settings } from '../stores/settings.svelte';
  import { t } from '../i18n';
</script>

<div class="config">
  <label for="team-size">{t('perTeam')}</label>
  <input id="team-size" type="number" min="1" max="12" bind:value={settings.teamSize} />
  <span class="config-hint">{t('restToBench')}</span>
</div>

<style>
  .config {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 12px 16px;
    margin: 14px 0;
  }
  .config label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-2);
  }
  .config input {
    background: var(--bg-3);
    color: var(--text-1);
    border: 1px solid var(--border-1);
    border-radius: var(--radius-sm);
    width: 56px;
    padding: 8px;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
  }
  .config-hint {
    font-size: 0.75rem;
    color: var(--text-3);
    margin-left: auto;
    font-family: var(--font-mono);
  }
</style>
