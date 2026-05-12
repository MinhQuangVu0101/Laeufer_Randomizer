<script lang="ts">
  import { t } from '../i18n';
  import type { RemoteSnapshot, LocalSnapshot, SyncDecision } from '../db/sync';

  type Props = {
    remote: RemoteSnapshot;
    local: LocalSnapshot;
    onDecide: (decision: SyncDecision) => void;
  };

  const { remote, local, onDecide }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop" onclick={() => onDecide('cancel')}>
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <h3>{t('syncWizardTitle')}</h3>
    <p class="hint">{t('syncWizardDescr')}</p>
    <div class="summary">
      <div class="row">
        <span class="label">{t('syncWizardLocalSummary', { n: local.rosterCount })}</span>
      </div>
      <div class="row">
        <span class="label">{t('syncWizardRemoteSummary', { n: remote.rosters.length })}</span>
      </div>
    </div>
    <div class="options">
      <button class="option" onclick={() => onDecide('pull')}>
        <strong>{t('syncPullLabel')}</strong>
        <span>{t('syncPullDescr')}</span>
      </button>
      <button class="option" onclick={() => onDecide('push')}>
        <strong>{t('syncPushLabel')}</strong>
        <span>{t('syncPushDescr')}</span>
      </button>
      <button class="option" onclick={() => onDecide('merge')}>
        <strong>{t('syncMergeLabel')}</strong>
        <span>{t('syncMergeDescr')}</span>
      </button>
      <button class="option later" onclick={() => onDecide('cancel')}>
        <span>{t('syncLaterLabel')}</span>
      </button>
    </div>
  </div>
</div>

<style>
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
    max-width: 420px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
  }
  .modal h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 6px;
    color: var(--text-1);
  }
  .hint {
    color: var(--text-3);
    font-size: 0.82rem;
    margin: 0 0 16px;
    line-height: 1.5;
  }
  .summary {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .row .label {
    color: var(--text-2);
    font-size: 0.85rem;
    font-family: var(--font-mono);
  }
  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .option {
    text-align: left;
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    cursor: pointer;
    font-family: inherit;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: all 0.12s;
  }
  .option:hover {
    background: var(--bg-3);
    border-color: var(--accent);
  }
  .option strong {
    color: var(--text-1);
    font-size: 0.92rem;
    font-weight: 600;
  }
  .option span {
    color: var(--text-3);
    font-size: 0.78rem;
  }
  .option.later {
    background: transparent;
    border: none;
    padding: 8px 0 4px;
    color: var(--text-3);
    text-align: center;
    font-size: 0.8rem;
  }
  .option.later:hover {
    background: transparent;
    color: var(--text-2);
  }
</style>
