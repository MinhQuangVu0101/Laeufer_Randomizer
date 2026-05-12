<script lang="ts">
  import { history } from '../stores/history.svelte';
  import { t } from '../i18n';

  function formatTime(time: number): string {
    const diffMs = Date.now() - time;
    const min = Math.floor(diffMs / 60_000);
    const h = Math.floor(min / 60);
    if (min < 1) return t('historyAgo');
    if (min < 60) return t('historyMinutesAgo', { n: min });
    return t('historyHoursAgo', { n: h });
  }
</script>

{#if !history.isEmpty}
  <section class="history">
    <h3>{t('historyHeader')}</h3>
    <ol class="entries">
      {#each history.all as entry (entry.time)}
        <li class="entry">
          <span class="time">{formatTime(entry.time)}</span>
          <div class="bodies">
            <div><strong>T1:</strong> {entry.team1}</div>
            <div><strong>T2:</strong> {entry.team2}</div>
            {#if entry.bench}
              <div class="bench"><strong>B:</strong> {entry.bench}</div>
            {/if}
          </div>
        </li>
      {/each}
    </ol>
  </section>
{/if}

<style>
  .history {
    margin-top: 20px;
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 12px 16px;
  }
  .history h3 {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 10px;
  }
  .entries {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .entry {
    padding: 8px 0;
    border-top: 1px dashed var(--border-1);
    font-size: 0.78rem;
    color: var(--text-2);
    line-height: 1.5;
  }
  .entry:first-child {
    border-top: 0;
    padding-top: 0;
  }
  .time {
    color: var(--text-3);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    display: block;
    margin-bottom: 4px;
  }
  .bodies strong {
    color: var(--text-1);
    margin-right: 4px;
  }
  .bench {
    color: var(--text-3);
  }
</style>
