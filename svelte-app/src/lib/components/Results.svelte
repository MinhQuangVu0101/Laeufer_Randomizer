<script lang="ts">
  import { POSITION_IDS, POSITION_NAME_KEYS } from '../constants';
  import { t, tLang } from '../i18n';
  import { settings } from '../stores/settings.svelte';
  import { toast } from '../stores/toast.svelte';
  import type { GenerationResult, Team } from '../domain/types';
  import TeamCard from './TeamCard.svelte';

  type Props = { result: GenerationResult };
  const { result }: Props = $props();

  let captureEl: HTMLElement | undefined = $state();
  let exporting = $state(false);

  function formatPositionTeamText(team: Team, title: string): string {
    const lang = settings.lang;
    let out = `--- ${title} ---\n`;
    for (const pos of POSITION_IDS) {
      const players = team[pos];
      if (players.length === 0) continue;
      const posName = tLang(lang, POSITION_NAME_KEYS[pos]);
      out += `${posName}: ${players.map((p) => p.name).join(', ')}\n`;
    }
    return out;
  }

  function formatSimpleTeamText(team: string[], title: string): string {
    return `--- ${title} ---\n${team.join(', ')}\n`;
  }

  function buildClipboardText(): string {
    if (!result.ok) return '';
    let text = '';
    if (result.mode === 'positions') {
      text += formatPositionTeamText(result.team1, t('team1'));
      text += '\n';
      text += formatPositionTeamText(result.team2, t('team2'));
      if (result.bench.length > 0) {
        text += `\n--- ${t('benchHeader')} ---\n`;
        text += result.bench.map((b) => b.name).join(', ') + '\n';
      }
    } else {
      text += formatSimpleTeamText(result.team1, t('team1'));
      text += '\n';
      text += formatSimpleTeamText(result.team2, t('team2'));
      if (result.bench.length > 0) {
        text += `\n--- ${t('benchHeader')} ---\n`;
        text += result.bench.join(', ') + '\n';
      }
    }
    return text.trim();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildClipboardText());
      toast.show(t('copiedToast'));
    } catch {
      toast.show(t('exportFailed'));
    }
  }

  async function captureToCanvas(): Promise<HTMLCanvasElement | null> {
    if (!captureEl) return null;
    const { default: html2canvas } = await import('html2canvas');
    return await html2canvas(captureEl, {
      backgroundColor: settings.theme === 'dark' ? '#1c1917' : '#fafaf9',
      scale: 2,
      logging: false,
    });
  }

  async function handleExportImage() {
    if (exporting) return;
    exporting = true;
    try {
      const canvas = await captureToCanvas();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `teams-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.show(t('imageDownloaded'));
    } catch {
      toast.show(t('exportFailed'));
    } finally {
      exporting = false;
    }
  }

  async function handleExportPdf() {
    if (exporting) return;
    exporting = true;
    try {
      const canvas = await captureToCanvas();
      if (!canvas) return;
      const { default: jsPDF } = await import('jspdf');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const finalHeight = Math.min(imgHeight, pageHeight - 20);
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, finalHeight);
      pdf.save(`teams-${Date.now()}.pdf`);
      toast.show(t('pdfDownloaded'));
    } catch {
      toast.show(t('exportFailed'));
    } finally {
      exporting = false;
    }
  }
</script>

<section class="results">
  {#if !result.ok}
    <div class="error-box" role="alert">
      <span class="error-icon">!</span>
      <div class="error-body">
        {#if result.reason === 'no_players'}
          <strong>{t('errorNoPlayers')}</strong>
          <p>{t('errorNoPlayersBody')}</p>
        {:else if result.reason === 'only_libero'}
          <strong>{t('errorOnlyLibero')}</strong>
          <p>
            {t('errorOnlyLiberoBody')}: <em>{result.affectedPlayers.join(', ')}</em>.
            {t('errorOnlyLiberoFix')}
          </p>
        {:else if result.reason === 'no_solution'}
          <strong>{t('errorNoSolution')}</strong>
          <p>{t('errorNoSolutionBody')}</p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="results-head">
      <h2>{t('generatedTeams')}</h2>
      <div class="result-actions">
        <button class="action-btn" onclick={handleCopy} disabled={exporting}>
          {t('copyTeams')}
        </button>
        <button class="action-btn" onclick={handleExportImage} disabled={exporting}>
          {t('exportImage')}
        </button>
        <button class="action-btn" onclick={handleExportPdf} disabled={exporting}>
          {t('exportPdf')}
        </button>
      </div>
    </div>

    <div bind:this={captureEl} class="capture">
      <div class="teams-grid">
        {#if result.mode === 'positions'}
          <TeamCard mode="positions" team={result.team1} title={t('team1')} color="var(--team-1)" />
          <TeamCard mode="positions" team={result.team2} title={t('team2')} color="var(--team-2)" />
        {:else}
          <TeamCard mode="simple" team={result.team1} title={t('team1')} color="var(--team-1)" />
          <TeamCard mode="simple" team={result.team2} title={t('team2')} color="var(--team-2)" />
        {/if}
      </div>

      {#if result.bench.length > 0}
        <div class="bench">
          <div class="bench-head">
            <h3>{t('benchHeader')}</h3>
            <span class="bench-count">· {result.bench.length}</span>
          </div>
          <ul class="bench-list">
            {#if result.mode === 'positions'}
              {#each result.bench as b (b.name)}
                <li>
                  <span class="bench-name">{b.name}</span>
                  {#if b.preferences.length > 0}
                    <span class="bench-pos">({b.preferences.join(', ')})</span>
                  {/if}
                </li>
              {/each}
            {:else}
              {#each result.bench as name (name)}
                <li><span class="bench-name">{name}</span></li>
              {/each}
            {/if}
          </ul>
        </div>
      {/if}
    </div>
  {/if}
</section>

<style>
  .results {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .results-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .results-head h2 {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0;
  }
  .result-actions {
    display: flex;
    gap: 6px;
  }
  .action-btn {
    background: var(--bg-2);
    color: var(--accent);
    border: 1px solid var(--border-1);
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
  }
  .action-btn:hover:not(:disabled) {
    background: var(--bg-3);
  }
  .action-btn:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .capture {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .teams-grid {
    display: grid;
    gap: 14px;
  }

  .error-box {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-left: 4px solid #e63946;
    border-radius: var(--radius);
    padding: 14px 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .error-icon {
    background: #e63946;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
    font-family: var(--font-mono);
  }
  .error-body strong {
    color: var(--text-1);
    font-size: 0.95rem;
    display: block;
    margin-bottom: 4px;
  }
  .error-body p {
    color: var(--text-2);
    font-size: 0.85rem;
    margin: 0;
    line-height: 1.5;
  }
  .error-body em {
    color: var(--text-1);
    font-style: normal;
    font-weight: 500;
  }

  .bench {
    background: var(--bg-2);
    border: 1px solid var(--border-1);
    border-radius: var(--radius);
    padding: 12px 16px;
  }
  .bench-head {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 8px;
  }
  .bench-head h3 {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0;
  }
  .bench-count {
    color: var(--text-3);
    font-size: 0.78rem;
    font-family: var(--font-mono);
  }
  .bench-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }
  .bench-list li {
    font-size: 0.88rem;
    color: var(--text-1);
  }
  .bench-pos {
    color: var(--text-3);
    font-size: 0.78rem;
    margin-left: 4px;
    font-style: italic;
  }
</style>
