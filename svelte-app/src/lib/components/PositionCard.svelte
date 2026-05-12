<script lang="ts">
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { POSITION_META, POSITION_NAME_KEYS, type Position } from '../constants';
  import { assignments } from '../stores/assignments.svelte';
  import { t } from '../i18n';

  type Props = { posId: Position };
  const { posId }: Props = $props();

  type DndItem = { id: string; name: string };

  let items = $state<DndItem[]>([]);
  let dragging = $state(false);

  $effect(() => {
    if (dragging) return;
    const storeNames = assignments.positions[posId];
    if (
      storeNames.length === items.length &&
      storeNames.every((n, i) => n === items[i].name)
    )
      return;
    items = storeNames.map((n) => ({ id: n, name: n }));
  });

  function handleConsider(e: CustomEvent<DndEvent<DndItem>>) {
    dragging = true;
    items = e.detail.items;
  }

  function handleFinalize(e: CustomEvent<DndEvent<DndItem>>) {
    dragging = false;
    const newItems = e.detail.items;
    items = newItems;
    const newNames = newItems.map((i) => i.name);
    const oldNames = assignments.positions[posId];
    for (const n of oldNames) {
      if (!newNames.includes(n)) assignments.removeFromPosition(posId, n);
    }
    for (const n of newNames) {
      if (!oldNames.includes(n)) assignments.addToPosition(posId, n);
    }
  }

  function handleQuickAdd(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const input = e.currentTarget as HTMLInputElement;
    const name = input.value.trim();
    if (name) {
      assignments.addToPosition(posId, name);
      input.value = '';
    }
  }
</script>

<div class="position-card" data-pos={posId} style:--pos-color={POSITION_META[posId].color}>
  <div class="position-header">
    <span class="badge">{POSITION_META[posId].badge}</span>
    <span class="position-name">{t(POSITION_NAME_KEYS[posId])}</span>
    <span class="position-max" title="Max pro Team · Doppelt total · Rest auf Bench">
      {t('positionMaxLabel')} {POSITION_META[posId].max} {t('positionPerTeam')} · {POSITION_META[posId].max * 2} {t('positionTotalLabel')}
    </span>
  </div>
  <div
    class="drop-zone"
    use:dndzone={{ items, type: 'player', flipDurationMs: 180, dropTargetStyle: {} }}
    onconsider={handleConsider}
    onfinalize={handleFinalize}
  >
    {#each items as item (item.id)}
      <button
        class="assigned"
        type="button"
        onclick={() => assignments.removeFromPosition(posId, item.name)}
        title={t('positionRemoveTitle')}
      >
        {item.name} ×
      </button>
    {/each}
  </div>
  <input
    class="quick-add"
    type="text"
    placeholder={t('positionQuickAdd')}
    onkeydown={handleQuickAdd}
  />
</div>

<style>
  .position-card {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 12px 14px;
    position: relative;
    overflow: hidden;
  }
  .position-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: var(--pos-color, var(--accent));
  }

  .position-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .badge {
    background: var(--pos-color, var(--accent));
    color: #1c1917;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.72rem;
    letter-spacing: 0.02em;
    font-family: var(--font-mono);
  }
  .position-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-1);
  }
  .position-max {
    color: var(--text-3);
    font-size: 0.72rem;
    font-family: var(--font-mono);
    margin-left: auto;
  }

  .drop-zone {
    min-height: 38px;
    padding: 6px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .assigned {
    background: var(--accent-subtle);
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: grab;
    touch-action: none;
  }
  .assigned:active {
    cursor: grabbing;
  }
  .assigned:hover {
    background: var(--accent);
    color: var(--text-inverse);
  }

  .quick-add {
    width: 100%;
    background: transparent;
    border: 0;
    border-top: 1px dashed var(--border-1);
    padding: 6px 0 0;
    margin-top: 6px;
    font-size: 0.85rem;
    color: var(--text-1);
  }
  .quick-add:focus {
    outline: none;
    border-top-color: var(--accent);
  }
  .quick-add::placeholder {
    color: var(--text-3);
    font-style: italic;
  }
</style>
