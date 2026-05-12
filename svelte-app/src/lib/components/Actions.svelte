<script lang="ts">
  import { t } from '../i18n';

  type Props = { onGenerate: () => void; onClear: () => void };
  const { onGenerate, onClear }: Props = $props();
</script>

<div class="actions">
  <button class="btn-primary" onclick={onGenerate}>{t('generate')}</button>
  <button class="btn-muted" onclick={onClear} title={t('clearTitle')}>×</button>
</div>

<style>
  .actions {
    display: flex;
    gap: 8px;
  }
  .btn-primary {
    flex: 1;
    background: var(--accent);
    color: var(--text-inverse);
    border: 0;
    padding: 14px;
    border-radius: var(--radius);
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: -0.005em;
    transition: background 0.15s;
  }
  .btn-primary:hover {
    background: var(--accent-hover);
  }
  .btn-muted {
    background: var(--bg-2);
    color: var(--text-2);
    border: 1px solid var(--border-1);
    padding: 14px 16px;
    border-radius: var(--radius);
    font-size: 0.9rem;
  }
</style>
