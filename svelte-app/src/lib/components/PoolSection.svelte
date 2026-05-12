<script lang="ts">
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { pool } from '../stores/pool.svelte';
  import { assignments } from '../stores/assignments.svelte';
  import { settings } from '../stores/settings.svelte';
  import { t } from '../i18n';

  type DndItem = { id: string; name: string };

  let items = $state<DndItem[]>(pool.all.map((n) => ({ id: n, name: n })));
  let dragging = $state(false);

  $effect(() => {
    if (dragging) return;
    const all = pool.all;
    if (items.length === all.length && all.every((n, i) => n === items[i].name)) return;
    items = all.map((n) => ({ id: n, name: n }));
  });

  function handleConsider(e: CustomEvent<DndEvent<DndItem>>) {
    dragging = true;
    items = e.detail.items;
  }

  function handleFinalize() {
    dragging = false;
    // Pool always shows ALL pool names regardless of drag direction
    items = pool.all.map((n) => ({ id: n, name: n }));
  }

  function addCustomPlayer() {
    const name = prompt(t('promptPlayerName'));
    if (name) pool.add(name);
  }
</script>

<section class="section">
  <div class="section-head">
    <h2>{t('poolHeader')} <span class="count">· {pool.size}</span></h2>
    <button class="chip-add" onclick={addCustomPlayer}>{t('poolAdd')}</button>
  </div>
  <div
    class="pool-chips"
    use:dndzone={{ items, type: 'player', flipDurationMs: 180, dropFromOthersDisabled: true }}
    onconsider={handleConsider}
    onfinalize={handleFinalize}
  >
    {#each items as item (item.id)}
      <span class="chip" class:assigned={assignments.isAssigned(item.name, settings.mode)}>
        {item.name}
      </span>
    {/each}
  </div>
</section>

<style>
  .section {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 14px 16px;
    margin-bottom: 14px;
  }
  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .section-head h2 {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .section-head .count {
    color: var(--text-3);
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
  }
  .pool-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 28px;
  }
  .chip {
    background: var(--bg-3);
    color: var(--text-1);
    padding: 5px 11px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: grab;
    font-variant-numeric: tabular-nums;
    transition: background 0.15s;
    touch-action: none;
  }
  .chip:active {
    cursor: grabbing;
  }
  .chip:hover {
    background: var(--bg-4);
  }
  .chip.assigned {
    background: var(--bg-2);
    color: var(--text-3);
    border: 1px dashed var(--border-2);
  }
  .chip-add {
    background: transparent;
    color: var(--accent);
    border: 1px dashed var(--accent);
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
  }
</style>
