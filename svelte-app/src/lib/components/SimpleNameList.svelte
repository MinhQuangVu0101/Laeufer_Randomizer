<script lang="ts">
  import { assignments } from '../stores/assignments.svelte';
  import { t } from '../i18n';

  function handleInput(e: Event) {
    const value = (e.currentTarget as HTMLTextAreaElement).value;
    assignments.setSimpleList(value.split('\n'));
  }
</script>

<div class="simple-list">
  <textarea
    placeholder={t('simplePlaceholder')}
    value={assignments.simpleList.join('\n')}
    oninput={handleInput}
  ></textarea>
</div>

<style>
  .simple-list {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 12px 14px;
  }
  .simple-list textarea {
    width: 100%;
    background: var(--bg-3);
    color: var(--text-1);
    border: 1px solid var(--border-1);
    border-radius: var(--radius-sm);
    padding: 10px;
    min-height: 140px;
    resize: vertical;
    font-size: 0.9rem;
    line-height: 1.6;
  }
</style>
