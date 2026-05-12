<script lang="ts">
  import { POSITION_IDS } from './lib/constants';
  import { settings } from './lib/stores/settings.svelte';
  import { pool } from './lib/stores/pool.svelte';
  import { assignments } from './lib/stores/assignments.svelte';
  import { rosters } from './lib/stores/roster.svelte';
  import { history } from './lib/stores/history.svelte';
  import { toast } from './lib/stores/toast.svelte';
  import { auth } from './lib/stores/auth.svelte';
  import { generateTeams } from './lib/domain/algorithm';
  import { t } from './lib/i18n';
  import {
    pullRemoteSnapshot,
    pushLocalToRemote,
    applyRemoteToLocal,
    mergeRemoteWithLocal,
    summarizeLocal,
    type RemoteSnapshot,
    type SyncDecision,
  } from './lib/db/sync';
  import type {
    GenerationInput,
    GenerationResult,
    PlayerWithPositions,
  } from './lib/domain/types';

  import AppHeader from './lib/components/AppHeader.svelte';
  import AppFooter from './lib/components/AppFooter.svelte';
  import RosterBar from './lib/components/RosterBar.svelte';
  import PoolSection from './lib/components/PoolSection.svelte';
  import ModeToggle from './lib/components/ModeToggle.svelte';
  import PositionCard from './lib/components/PositionCard.svelte';
  import LiberoOptions from './lib/components/LiberoOptions.svelte';
  import SimpleNameList from './lib/components/SimpleNameList.svelte';
  import TeamSizeConfig from './lib/components/TeamSizeConfig.svelte';
  import Actions from './lib/components/Actions.svelte';
  import Results from './lib/components/Results.svelte';
  import HistorySection from './lib/components/HistorySection.svelte';
  import Toast from './lib/components/Toast.svelte';
  import AuthBar from './lib/components/AuthBar.svelte';
  import SyncWizard from './lib/components/SyncWizard.svelte';

  let genResult = $state<GenerationResult | null>(null);
  let resultsEl: HTMLElement | undefined = $state();
  let pendingRemoteSnapshot = $state<RemoteSnapshot | null>(null);

  let lastUserId = $state<string | null>(null);

  $effect(() => {
    if (!auth) return;
    const u = auth.user;
    if (!u) {
      lastUserId = null;
      pendingRemoteSnapshot = null;
      return;
    }
    if (u.id === lastUserId) return;
    lastUserId = u.id;
    pullRemoteSnapshot(u.id)
      .then((snapshot) => {
        pendingRemoteSnapshot = snapshot;
      })
      .catch((err) => {
        console.warn('[sync] pull failed', err);
        toast.show(t('syncFailed'));
      });
  });

  async function handleSyncDecision(decision: SyncDecision) {
    if (!auth?.user || !pendingRemoteSnapshot) {
      pendingRemoteSnapshot = null;
      return;
    }
    const userId = auth.user.id;
    const snapshot = pendingRemoteSnapshot;
    pendingRemoteSnapshot = null;
    try {
      if (decision === 'pull') {
        applyRemoteToLocal(snapshot, settings, pool, assignments, rosters);
        toast.show(t('syncToastPulled'));
      } else if (decision === 'push') {
        await pushLocalToRemote(userId, settings, pool, assignments, rosters);
        toast.show(t('syncToastPushed'));
      } else if (decision === 'merge') {
        mergeRemoteWithLocal(snapshot, settings, pool, assignments, rosters);
        await pushLocalToRemote(userId, settings, pool, assignments, rosters);
        toast.show(t('syncToastMerged'));
      }
    } catch (err) {
      console.warn('[sync] decision failed', err);
      toast.show(t('syncFailed'));
    }
  }

  $effect(() => {
    document.documentElement.classList.toggle('theme-dark', settings.theme === 'dark');
    document.documentElement.classList.toggle('theme-light', settings.theme === 'light');
  });

  $effect(() => {
    if (genResult && resultsEl) {
      const el = resultsEl;
      queueMicrotask(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  });

  function buildPositionPlayers(): PlayerWithPositions[] {
    const players: PlayerWithPositions[] = [];
    for (const pos of POSITION_IDS) {
      for (const name of assignments.positions[pos]) {
        let entry = players.find((p) => p.name === name);
        if (!entry) {
          entry = { name, positions: [] };
          players.push(entry);
        }
        entry.positions.push(pos);
      }
    }
    return players;
  }

  function handleGenerate() {
    const input: GenerationInput =
      settings.mode === 'positions'
        ? {
            mode: 'positions',
            players: buildPositionPlayers(),
            team1NoLibero: settings.team1NoLibero,
            team2NoLibero: settings.team2NoLibero,
            teamSize: settings.teamSize,
          }
        : {
            mode: 'simple',
            players: [...assignments.simpleList],
            teamSize: settings.teamSize,
          };
    const r = generateTeams(input);
    genResult = r;
    if (r.ok) history.add(r);
  }

  function handleClear() {
    if (!confirm(t('confirmClear'))) return;
    assignments.clearAll();
    genResult = null;
  }
</script>

<AppHeader />
<AuthBar />
<RosterBar />
<PoolSection />
<ModeToggle />

{#if settings.mode === 'positions'}
  <div class="position-grid">
    {#each POSITION_IDS as posId (posId)}
      <PositionCard {posId} />
    {/each}
  </div>

  <LiberoOptions />

  {#if assignments.simpleList.length > 0}
    <div class="cross-mode-hint">
      <span>{assignments.simpleList.length}</span> {t('hintNamesOnlyInSimple')}
    </div>
  {/if}
{:else}
  <SimpleNameList />
  {#if assignments.countAssignedInPositions() > 0}
    <div class="cross-mode-hint">
      <span>{assignments.countAssignedInPositions()}</span> {t('hintPlayersInPositions')}
      <button class="flatten-btn" onclick={() => assignments.flattenPositionsToSimple()}>
        {t('flattenAll')}
      </button>
    </div>
  {/if}
{/if}

<TeamSizeConfig />
<Actions onGenerate={handleGenerate} onClear={handleClear} />

{#if genResult}
  <div bind:this={resultsEl}>
    <Results result={genResult} />
  </div>
{/if}

<HistorySection />
<AppFooter />

{#if pendingRemoteSnapshot}
  <SyncWizard
    remote={pendingRemoteSnapshot}
    local={summarizeLocal(settings, rosters)}
    onDecide={handleSyncDecision}
  />
{/if}

<Toast />

<style>
  .position-grid {
    display: grid;
    gap: 10px;
  }
  .cross-mode-hint {
    margin-top: 10px;
    padding: 10px 14px;
    background: var(--bg-2);
    border: 1px dashed var(--border-2);
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    color: var(--text-2);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .cross-mode-hint span {
    color: var(--accent);
    font-weight: 700;
  }
  .flatten-btn {
    background: transparent;
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    margin-left: auto;
  }
</style>
