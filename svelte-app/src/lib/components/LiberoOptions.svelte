<script lang="ts">
  import { settings } from '../stores/settings.svelte';
  import { t } from '../i18n';
</script>

<div class="libero-options">
  <label>
    <input
      type="checkbox"
      checked={!settings.team1NoLibero}
      onchange={(e) => (settings.team1NoLibero = !(e.currentTarget as HTMLInputElement).checked)}
    />
    <span>{t('team1WithLibero')}</span>
  </label>
  <label>
    <input
      type="checkbox"
      checked={!settings.team2NoLibero}
      onchange={(e) => (settings.team2NoLibero = !(e.currentTarget as HTMLInputElement).checked)}
    />
    <span>{t('team2WithLibero')}</span>
  </label>
</div>

<style>
  .libero-options {
    display: flex;
    gap: 16px;
    margin-top: 10px;
    padding: 10px 14px;
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    flex-wrap: wrap;
  }
  .libero-options label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: var(--text-2);
    cursor: pointer;
  }
  .libero-options input {
    accent-color: var(--accent);
  }
</style>
