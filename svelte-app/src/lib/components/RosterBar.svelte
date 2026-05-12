<script lang="ts">
  import { rosters } from '../stores/roster.svelte';
  import { settings } from '../stores/settings.svelte';
  import { assignments } from '../stores/assignments.svelte';
  import { toast } from '../stores/toast.svelte';
  import { t } from '../i18n';

  let selected = $state('');

  function handleSelect(e: Event) {
    const value = (e.currentTarget as HTMLSelectElement).value;
    selected = value;
    if (!value) return;
    if (rosters.applyToStores(value, settings, assignments)) {
      toast.show(`${t('rosterLoadedToast')}: ${value}`);
    }
  }

  function handleSave() {
    const name = prompt(t('promptRosterName'));
    if (name && name.trim()) {
      rosters.saveFromStores(name.trim(), settings, assignments);
      toast.show(`${t('rosterSavedToast')}: ${name.trim()}`);
      selected = name.trim();
    }
  }

  function handleDelete() {
    if (!selected) return;
    if (rosters.delete(selected)) {
      toast.show(t('rosterDeletedToast'));
      selected = '';
    }
  }
</script>

<div class="roster">
  <select value={selected} onchange={handleSelect}>
    <option value="">{t('loadRoster')}</option>
    {#each rosters.names as name (name)}
      <option value={name}>{name}</option>
    {/each}
  </select>
  <button class="link" onclick={handleSave}>{t('rosterSave')}</button>
  <button class="link muted" onclick={handleDelete} disabled={!selected} title={t('rosterDelete')}
    >×</button
  >
</div>

<style>
  .roster {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 14px;
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    margin-bottom: 14px;
  }
  .roster select {
    flex: 1;
    background: transparent;
    border: 0;
    color: var(--text-1);
    padding: 8px 4px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  .roster .link {
    background: transparent;
    border: 0;
    color: var(--accent);
    padding: 6px 8px;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
  }
  .roster .link:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .roster .link.muted {
    color: var(--text-3);
  }
</style>
