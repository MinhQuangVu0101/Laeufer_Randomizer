<script lang="ts">
  import { POSITION_IDS, POSITION_META, POSITION_NAME_KEYS } from '../constants';
  import { t } from '../i18n';
  import type { Team } from '../domain/types';

  type Props =
    | { title: string; color: string; mode: 'positions'; team: Team }
    | { title: string; color: string; mode: 'simple'; team: string[] };

  const props: Props = $props();

  const count = $derived(
    props.mode === 'positions'
      ? Object.values(props.team).reduce((s, arr) => s + arr.length, 0)
      : props.team.length,
  );
</script>

<article class="team-card" style:--team-accent={props.color}>
  <header class="team-head">
    <h3>{props.title}</h3>
    <span class="team-count">{count} {t('playersCount')}</span>
  </header>

  {#if props.mode === 'positions'}
    <div class="rows">
      {#each POSITION_IDS as posId (posId)}
        {@const players = props.team[posId]}
        {#if players.length > 0}
          {@const meta = POSITION_META[posId]}
          <div class="row" style:--pos-color={meta.color}>
            <span class="row-badge">{meta.badge}</span>
            <div class="row-body">
              <span class="row-name">{t(POSITION_NAME_KEYS[posId])}</span>
              <span class="row-players">
                {#each players as p, i (p.name)}
                  <span class="row-player">
                    {p.name}{#if p.preferences.length > 1}<span class="row-flex"
                        >({p.preferences.filter((x) => x !== p.position).join(', ')})</span
                      >{/if}{#if i < players.length - 1},
                    {/if}
                  </span>
                {/each}
              </span>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <ul class="simple-list">
      {#each props.team as name (name)}
        <li>{name}</li>
      {/each}
    </ul>
  {/if}
</article>

<style>
  .team-card {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 14px 16px;
    position: relative;
    overflow: hidden;
  }
  .team-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: var(--team-accent);
  }
  .team-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
  }
  .team-head h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-1);
    margin: 0;
  }
  .team-count {
    color: var(--text-3);
    font-size: 0.78rem;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .row-badge {
    background: var(--pos-color);
    color: #1c1917;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.68rem;
    font-family: var(--font-mono);
    flex-shrink: 0;
  }
  .row-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }
  .row-name {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .row-players {
    font-size: 0.92rem;
    color: var(--text-1);
    line-height: 1.4;
  }
  .row-flex {
    color: var(--text-3);
    font-size: 0.75rem;
    margin-left: 2px;
    font-style: italic;
  }

  .simple-list {
    list-style: none;
    padding: 0;
    margin: 0;
    columns: 2;
    column-gap: 16px;
  }
  .simple-list li {
    padding: 4px 0;
    font-size: 0.92rem;
    color: var(--text-1);
    break-inside: avoid;
  }
</style>
