// ── Constants ──────────────────────────────────
const POSITIONS = ['aussen', 'mitte', 'zuspieler', 'libero', 'diagonal'];
const POSITION_LABELS = {
  'Aussenangreifer': 'aussen', 'Mittelblock': 'mitte',
  'Zuspieler': 'zuspieler', 'Libero': 'libero', 'Diagonal': 'diagonal'
};
const LABEL_MAP = {
  'aussen': 'Aussenangreifer', 'mitte': 'Mittelblock',
  'zuspieler': 'Zuspieler', 'libero': 'Libero', 'diagonal': 'Diagonal'
};
const MAX_PER_POS = { 'Aussenangreifer': 2, 'Mittelblock': 2, 'Zuspieler': 1, 'Libero': 1, 'Diagonal': 1 };
const MAX_HISTORY = 3;
const DEFAULT_TEAM_SIZE = 6;

// ── i18n ───────────────────────────────────────
const TRANSLATIONS = {
  de: {
    appTitle: 'Volleyball Team Generator',
    subtitle: 'Faire Teams per Knopfdruck',
    loadRoster: '-- Kader laden --',
    save: 'Speichern',
    remove: 'Entfernen',
    playerPool: 'Spieler-Pool',
    addName: '+ Name',
    posAussen: 'Aussenangreifer',
    posMitte: 'Mittelblock',
    posZuspieler: 'Zuspieler',
    posLibero: 'Libero',
    posDiagonal: 'Diagonal',
    placeholderName: 'Ein Name pro Zeile',
    team1NoLibero: 'Team 1 ohne Libero',
    team2NoLibero: 'Team 2 ohne Libero',
    playersPerTeam: 'Spieler pro Team:',
    teamSizeHint: '(Max. pro Team — Rest auf Bank)',
    generateTeams: 'Teams generieren',
    clearAll: 'Alles loeschen',
    generatedTeams: 'Generierte Teams',
    copy: 'Kopieren',
    exportImage: 'Bild',
    exportPDF: 'PDF',
    team1: 'Team 1',
    team2: 'Team 2',
    bench: 'Auswechselbank',
    recentGenerations: 'Letzte Generierungen',
    confirmClear: 'Wirklich alle Namen loeschen?',
    confirmClearConfirmed: 'Alles geloescht',
    promptRoster: 'Kader-Name:',
    rosterSaved: 'Kader gespeichert: ',
    rosterLoaded: 'Kader geladen: ',
    rosterDeleted: 'Kader geloescht',
    promptPlayer: 'Spieler-Name:',
    noPlayers: 'Bitte mindestens einen Spieler eingeben.',
    onlyLiberoError: 'Es gibt Spieler die nur Libero koennen, aber beide Teams haben "ohne Libero" aktiviert.',
    affected: 'Betroffene: ',
    noSolution: 'Keine gueltige Teamaufteilung moeglich. Probiere andere Spielerkombinationen.',
    oddPlayers: ' Spieler — ein Team hat einen Spieler mehr.',
    unassigned: 'Konnten nicht zugewiesen werden: ',
    teamsCopied: 'Teams kopiert!',
    players: ' Spieler',
    noPlayersDisplay: 'Keine Spieler',
    imageExported: 'Bild heruntergeladen',
    moved: ' verschoben',
  },
  en: {
    appTitle: 'Volleyball Team Generator',
    subtitle: 'Fair teams at the tap of a button',
    loadRoster: '-- Load roster --',
    save: 'Save',
    remove: 'Remove',
    playerPool: 'Player Pool',
    addName: '+ Name',
    posAussen: 'Outside Hitter',
    posMitte: 'Middle Blocker',
    posZuspieler: 'Setter',
    posLibero: 'Libero',
    posDiagonal: 'Opposite',
    placeholderName: 'One name per line',
    team1NoLibero: 'Team 1 without libero',
    team2NoLibero: 'Team 2 without libero',
    playersPerTeam: 'Players per team:',
    teamSizeHint: '(Max per team — rest on bench)',
    generateTeams: 'Generate Teams',
    clearAll: 'Clear all',
    generatedTeams: 'Generated Teams',
    copy: 'Copy',
    exportImage: 'Image',
    exportPDF: 'PDF',
    team1: 'Team 1',
    team2: 'Team 2',
    bench: 'Bench',
    recentGenerations: 'Recent Generations',
    confirmClear: 'Really clear all names?',
    confirmClearConfirmed: 'All cleared',
    promptRoster: 'Roster name:',
    rosterSaved: 'Roster saved: ',
    rosterLoaded: 'Roster loaded: ',
    rosterDeleted: 'Roster deleted',
    promptPlayer: 'Player name:',
    noPlayers: 'Please enter at least one player.',
    onlyLiberoError: 'Some players can only play libero, but both teams have "without libero" enabled.',
    affected: 'Affected: ',
    noSolution: 'No valid team split possible. Try different player combinations.',
    oddPlayers: ' players — one team has one extra.',
    unassigned: 'Could not be assigned: ',
    teamsCopied: 'Teams copied!',
    players: ' players',
    noPlayersDisplay: 'No players',
    imageExported: 'Image downloaded',
    moved: ' moved',
  },
};

function getLang() {
  return localStorage.getItem('vb_lang') || 'de';
}
function t(key) {
  const lang = getLang();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.de[key] || key;
}
function applyLanguage() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'de' ? 'EN' : 'DE';
}
function toggleLanguage() {
  localStorage.setItem('vb_lang', getLang() === 'de' ? 'en' : 'de');
  applyLanguage();
  refreshRosterDropdown();
  renderHistory();
  POSITIONS.forEach(renderAssignedChips);
  renderPool();
}

// ── Preset Players ─────────────────────────────
const PRESET_PLAYERS = [
  'Quang', 'Anh', 'Erik', 'Tom', 'Ben', 'Claudio', 'David', 'Elena',
  'Ermin', 'Georg', 'Heiko', 'Janika', 'Jonas', 'Jun-Min', 'Karim',
  'Lara', 'Laura', 'Lisa', 'Omid', 'Pablo', 'PauTom', 'Justus', 'Tim'
];

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSavedData();
  setupAutoSave();
  applyLanguage();
  refreshRosterDropdown();
  renderHistory();
  initPlayerPool();
  setupDragDrop();
  POSITIONS.forEach(renderAssignedChips);
});

// ── Toast ──────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

// ── Info Box ───────────────────────────────────
function showInfo(messages, type = 'warn') {
  const el = document.getElementById('info');
  if (!messages || messages.length === 0) { el.style.display = 'none'; return; }
  el.className = `info-box info-${type}`;
  el.innerHTML = messages.join('<br>');
  el.style.display = 'block';
}
function hideInfo() { document.getElementById('info').style.display = 'none'; }

// ── Data ───────────────────────────────────────
function getNames(id) {
  return document.getElementById(id).value.split('\n').map(n => n.trim()).filter(n => n.length > 0);
}

function setNames(id, names) {
  const el = document.getElementById(id);
  el.value = names.join('\n');
  localStorage.setItem('vb_' + id, el.value);
}

function getAllPlayerPositions() {
  const map = new Map();
  for (const [label, id] of Object.entries(POSITION_LABELS)) {
    for (const name of getNames(id)) {
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(label);
    }
  }
  return map;
}

// ── Auto-save ──────────────────────────────────
function loadSavedData() {
  POSITIONS.forEach(pos => {
    const saved = localStorage.getItem('vb_' + pos);
    if (saved) document.getElementById(pos).value = saved;
  });
  const t1 = localStorage.getItem('vb_team1_no_libero');
  const t2 = localStorage.getItem('vb_team2_no_libero');
  if (t1 === 'true') document.getElementById('team1-no-libero').checked = true;
  if (t2 === 'true') document.getElementById('team2-no-libero').checked = true;
  const sz = localStorage.getItem('vb_team_size');
  if (sz) document.getElementById('team-size').value = sz;
}

function setupAutoSave() {
  POSITIONS.forEach(pos => {
    document.getElementById(pos).addEventListener('input', function() {
      localStorage.setItem('vb_' + pos, this.value);
      renderAssignedChips(pos);
      renderPool();
    });
  });
  document.getElementById('team1-no-libero').addEventListener('change', function() {
    localStorage.setItem('vb_team1_no_libero', this.checked);
  });
  document.getElementById('team2-no-libero').addEventListener('change', function() {
    localStorage.setItem('vb_team2_no_libero', this.checked);
  });
  document.getElementById('team-size').addEventListener('change', function() {
    localStorage.setItem('vb_team_size', this.value);
  });
}

function clearAllData() {
  if (!confirm(t('confirmClear'))) return;
  POSITIONS.forEach(pos => {
    localStorage.removeItem('vb_' + pos);
    document.getElementById(pos).value = '';
    renderAssignedChips(pos);
  });
  localStorage.removeItem('vb_team1_no_libero');
  localStorage.removeItem('vb_team2_no_libero');
  document.getElementById('team1-no-libero').checked = false;
  document.getElementById('team2-no-libero').checked = false;
  document.getElementById('results').style.display = 'none';
  hideInfo();
  renderPool();
  showToast(t('confirmClearConfirmed'));
}

// ── Roster Save/Load ───────────────────────────
function getRosters() {
  try { return JSON.parse(localStorage.getItem('vb_rosters') || '{}'); } catch { return {}; }
}

function saveRoster() {
  const name = prompt(t('promptRoster'));
  if (!name) return;
  const rosters = getRosters();
  const data = {};
  POSITIONS.forEach(pos => { data[pos] = document.getElementById(pos).value; });
  data.team1NoLibero = document.getElementById('team1-no-libero').checked;
  data.team2NoLibero = document.getElementById('team2-no-libero').checked;
  data.teamSize = document.getElementById('team-size').value;
  rosters[name] = data;
  localStorage.setItem('vb_rosters', JSON.stringify(rosters));
  refreshRosterDropdown();
  showToast(t('rosterSaved') + name);
}

function deleteRoster() {
  const select = document.getElementById('roster-select');
  const name = select.value;
  if (!name) return;
  const rosters = getRosters();
  delete rosters[name];
  localStorage.setItem('vb_rosters', JSON.stringify(rosters));
  refreshRosterDropdown();
  showToast(t('rosterDeleted'));
}

function refreshRosterDropdown() {
  const select = document.getElementById('roster-select');
  const rosters = getRosters();
  select.innerHTML = `<option value="">${t('loadRoster')}</option>`;
  for (const name of Object.keys(rosters)) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  }
  select.onchange = function() {
    if (!this.value) return;
    const data = rosters[this.value];
    if (!data) return;
    POSITIONS.forEach(pos => {
      document.getElementById(pos).value = data[pos] || '';
      localStorage.setItem('vb_' + pos, data[pos] || '');
      renderAssignedChips(pos);
    });
    document.getElementById('team1-no-libero').checked = !!data.team1NoLibero;
    document.getElementById('team2-no-libero').checked = !!data.team2NoLibero;
    if (data.teamSize) {
      document.getElementById('team-size').value = data.teamSize;
      localStorage.setItem('vb_team_size', data.teamSize);
    }
    renderPool();
    showToast(t('rosterLoaded') + this.value);
  };
}

// ── Shuffle ────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Backtracking Assignment ────────────────────
function assignPositions(players, playerPositions, noLibero) {
  const team = {};
  for (const label of Object.keys(MAX_PER_POS)) team[label] = [];
  const limits = { ...MAX_PER_POS };
  if (noLibero) limits['Libero'] = 0;

  const sorted = players.map(name => ({
    name, positions: playerPositions.get(name), flex: playerPositions.get(name).length
  })).sort((a, b) => a.flex - b.flex);

  function backtrack(idx) {
    if (idx === sorted.length) return true;
    const p = sorted[idx];
    for (const pos of p.positions) {
      if (noLibero && pos === 'Libero') continue;
      if (team[pos].length < limits[pos]) {
        team[pos].push({ name: p.name, preferences: p.positions });
        if (backtrack(idx + 1)) return true;
        team[pos].pop();
      }
    }
    return false;
  }

  const success = backtrack(0);
  if (success) return { team, skipped: [] };
  return { team, skipped: sorted.map(p => ({ name: p.name, preferredPositions: p.positions })) };
}

// ── Team Generation ────────────────────────────
function getTeamSize() {
  const v = parseInt(document.getElementById('team-size').value, 10);
  if (isNaN(v) || v < 1) return DEFAULT_TEAM_SIZE;
  return Math.min(v, 12);
}

function generateTeams() {
  hideInfo();
  const playerPositions = getAllPlayerPositions();

  if (playerPositions.size === 0) {
    showInfo([t('noPlayers')], 'error');
    return;
  }

  const team1NoLibero = document.getElementById('team1-no-libero').checked;
  const team2NoLibero = document.getElementById('team2-no-libero').checked;
  const teamSizeTarget = getTeamSize();

  const pureLiberos = [...playerPositions.entries()]
    .filter(([_, pos]) => pos.length === 1 && pos[0] === 'Libero')
    .map(([name]) => name);

  if (pureLiberos.length > 0 && team1NoLibero && team2NoLibero) {
    showInfo([t('onlyLiberoError'), t('affected') + pureLiberos.join(', ')], 'error');
    return;
  }

  const allPlayers = [...playerPositions.keys()];
  const maxAttempts = 15;
  let bestResult = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pureLib = allPlayers.filter(p => {
      const pos = playerPositions.get(p);
      return pos.length === 1 && pos[0] === 'Libero';
    });
    const others = shuffle(allPlayers.filter(p => !pureLib.includes(p)));
    const shuffledLib = shuffle(pureLib);

    const total = allPlayers.length;
    let team1Size = Math.min(Math.floor(total / 2), teamSizeTarget);
    let team2Size = Math.min(Math.floor(total / 2), teamSizeTarget);

    if (team1NoLibero && team2NoLibero) {
      team1Size = Math.min(team1Size, teamSizeTarget);
      team2Size = Math.min(team2Size, teamSizeTarget);
    } else if (total % 2 !== 0) {
      if (team1Size < teamSizeTarget && !team1NoLibero) team1Size++;
      else if (team2Size < teamSizeTarget && !team2NoLibero) team2Size++;
    }

    let t1Players = [], t2Players = [];

    if (team1NoLibero && !team2NoLibero) {
      t2Players.push(...shuffledLib);
      const bal = Math.min(shuffledLib.length, others.length);
      for (let i = 0; i < bal; i++) t1Players.push(others.pop());
    } else if (!team1NoLibero && team2NoLibero) {
      t1Players.push(...shuffledLib);
      const bal = Math.min(shuffledLib.length, others.length);
      for (let i = 0; i < bal; i++) t2Players.push(others.pop());
    } else {
      shuffledLib.forEach((p, i) => { (i % 2 === 0 ? t1Players : t2Players).push(p); });
    }

    const remaining = [...others];
    while (remaining.length > 0) {
      if (t1Players.length < team1Size && remaining.length > 0) t1Players.push(remaining.shift());
      if (t2Players.length < team2Size && remaining.length > 0) t2Players.push(remaining.shift());
      if (t1Players.length >= team1Size && t2Players.length >= team2Size) break;
    }

    const benchPlayers = remaining.map(name => ({ name, preferredPositions: playerPositions.get(name) }));
    const r1 = assignPositions(t1Players, playerPositions, team1NoLibero);
    const r2 = assignPositions(t2Players, playerPositions, team2NoLibero);
    const skipped = [...r1.skipped, ...r2.skipped, ...benchPlayers];

    if (r1.skipped.length === 0 && r2.skipped.length === 0) {
      bestResult = { team1: r1.team, team2: r2.team, skipped, bench: benchPlayers };
      break;
    }
    if (!bestResult || skipped.length < bestResult.skipped.length) {
      bestResult = { team1: r1.team, team2: r2.team, skipped, bench: benchPlayers };
    }
  }

  if (!bestResult) {
    showInfo([t('noSolution')], 'error');
    return;
  }

  const msgs = [];
  const total = allPlayers.length;
  if (total > teamSizeTarget * 2) {
    // bench expected
  } else if (total % 2 !== 0) {
    msgs.push(total + t('oddPlayers'));
  }
  if (bestResult.skipped.length > 0) {
    const onBench = bestResult.bench.map(p => p.name);
    const unassigned = bestResult.skipped.filter(p => !onBench.includes(p.name));
    if (unassigned.length > 0) {
      msgs.push(t('unassigned') + unassigned.map(p => p.name + ' (' + p.preferredPositions.join(', ') + ')').join(', '));
    }
  }
  if (msgs.length > 0) showInfo(msgs, 'warn');

  displayTeam('team1-content', bestResult.team1);
  displayTeam('team2-content', bestResult.team2);
  const c1 = Object.values(bestResult.team1).reduce((s, a) => s + a.length, 0);
  const c2 = Object.values(bestResult.team2).reduce((s, a) => s + a.length, 0);
  document.getElementById('team1-count').textContent = c1 + t('players');
  document.getElementById('team2-count').textContent = c2 + t('players');
  displayBench(bestResult.skipped.filter(p => bestResult.bench.some(b => b.name === p.name)));
  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

  addHistory(bestResult);
}

// ── Display ────────────────────────────────────
function displayTeam(elId, team) {
  const el = document.getElementById(elId);
  const order = ['Aussenangreifer', 'Mittelblock', 'Zuspieler', 'Libero', 'Diagonal'];
  let html = '';
  for (const pos of order) {
    if (team[pos].length === 0) continue;
    html += `<div class="team-pos"><div class="team-pos-label">${pos}</div>`;
    for (const p of team[pos]) {
      const flex = p.preferences.length > 1
        ? `<span class="flex-tag">${p.preferences.filter(x => x !== pos).join(', ')}</span>` : '';
      html += `<div class="team-pos-player">${p.name}${flex}</div>`;
    }
    html += '</div>';
  }
  el.innerHTML = html || `<div style="text-align:center;color:var(--text-muted);padding:16px;">${t('noPlayersDisplay')}</div>`;
}

function displayBench(players) {
  const section = document.getElementById('bench-section');
  const content = document.getElementById('bench-content');
  if (players.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  content.innerHTML = players.map(p =>
    `<div class="bench-player">${p.name} <span class="bench-player-pos">${p.preferredPositions.join(', ')}</span></div>`
  ).join('');
}

// ── Copy Teams ─────────────────────────────────
function copyTeams() {
  let text = `--- ${t('team1')} ---\n`;
  const t1 = document.getElementById('team1-content');
  t1.querySelectorAll('.team-pos').forEach(pos => {
    const label = pos.querySelector('.team-pos-label').textContent;
    const names = [...pos.querySelectorAll('.team-pos-player')].map(p => p.childNodes[0].textContent.trim());
    text += label + ': ' + names.join(', ') + '\n';
  });
  text += `\n--- ${t('team2')} ---\n`;
  const t2el = document.getElementById('team2-content');
  t2el.querySelectorAll('.team-pos').forEach(pos => {
    const label = pos.querySelector('.team-pos-label').textContent;
    const names = [...pos.querySelectorAll('.team-pos-player')].map(p => p.childNodes[0].textContent.trim());
    text += label + ': ' + names.join(', ') + '\n';
  });
  navigator.clipboard.writeText(text).then(() => showToast(t('teamsCopied')));
}

// ── Export ─────────────────────────────────────
function exportImage() {
  const node = document.getElementById('results-capture');
  if (!node || typeof html2canvas === 'undefined') return;
  html2canvas(node, { backgroundColor: '#1e1e2e', scale: 2 }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'teams-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast(t('imageExported'));
  });
}

function exportPDF() {
  window.print();
}

// ── History ────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem('vb_history') || '[]'); } catch { return []; }
}

function addHistory(result) {
  const history = getHistory();
  const entry = {
    time: new Date().toLocaleString(getLang() === 'de' ? 'de-DE' : 'en-US'),
    team1: Object.entries(result.team1).flatMap(([pos, players]) => players.map(p => p.name + ' (' + pos + ')')),
    team2: Object.entries(result.team2).flatMap(([pos, players]) => players.map(p => p.name + ' (' + pos + ')'))
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem('vb_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  const section = document.getElementById('history-section');
  const content = document.getElementById('history-content');
  if (history.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  content.innerHTML = history.map(e =>
    `<div class="history-entry">
      <span class="history-time">${e.time}</span><br>
      <strong>${t('team1').replace('Team ', 'T')}:</strong> ${e.team1.join(', ')}<br>
      <strong>${t('team2').replace('Team ', 'T')}:</strong> ${e.team2.join(', ')}
    </div>`
  ).join('');
}

// ── Player Pool ────────────────────────────────
function getPoolPlayers() {
  try { return JSON.parse(localStorage.getItem('vb_pool') || 'null') || [...PRESET_PLAYERS]; }
  catch { return [...PRESET_PLAYERS]; }
}

function savePoolPlayers(players) {
  localStorage.setItem('vb_pool', JSON.stringify(players));
}

function initPlayerPool() {
  renderPool();
}

function renderPool() {
  const container = document.getElementById('player-pool-chips');
  const players = getPoolPlayers();

  const assigned = new Set();
  POSITIONS.forEach(pos => {
    getNames(pos).forEach(n => assigned.add(n));
  });

  container.innerHTML = '';
  players.forEach(name => {
    const chip = document.createElement('div');
    chip.className = 'pool-chip' + (assigned.has(name) ? ' is-assigned' : '');
    chip.draggable = !assigned.has(name);
    chip.dataset.player = name;
    chip.innerHTML = `<span class="pool-chip-name">${name}</span> <span class="pool-chip-remove" onclick="removePoolPlayer(event, '${name.replace(/'/g, "\\'")}')">&times;</span>`;

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ name, from: 'pool' }));
      e.dataTransfer.effectAllowed = 'move';
      chip.style.opacity = '0.5';
    });
    chip.addEventListener('dragend', () => {
      chip.style.opacity = '';
    });

    container.appendChild(chip);
  });
}

function addCustomPlayer() {
  const name = prompt(t('promptPlayer'));
  if (!name || !name.trim()) return;
  const players = getPoolPlayers();
  if (!players.includes(name.trim())) {
    players.push(name.trim());
    savePoolPlayers(players);
  }
  renderPool();
}

function removePoolPlayer(e, name) {
  e.stopPropagation();
  const players = getPoolPlayers().filter(p => p !== name);
  savePoolPlayers(players);
  renderPool();
}

// ── Assigned Chips (per position) ──────────────
function renderAssignedChips(pos) {
  const container = document.getElementById(pos + '-chips');
  if (!container) return;
  const names = getNames(pos);
  container.innerHTML = '';
  names.forEach(name => {
    const chip = document.createElement('div');
    chip.className = 'assigned-chip';
    chip.draggable = true;
    chip.dataset.player = name;
    chip.dataset.from = pos;
    chip.innerHTML = `<span class="assigned-chip-name">${name}</span><span class="assigned-chip-remove" title="Remove">&times;</span>`;

    chip.querySelector('.assigned-chip-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromPosition(pos, name);
    });

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({ name, from: pos }));
      e.dataTransfer.effectAllowed = 'move';
      chip.classList.add('dragging');
    });
    chip.addEventListener('dragend', () => {
      chip.classList.remove('dragging');
    });

    container.appendChild(chip);
  });
}

function removeFromPosition(pos, name) {
  const names = getNames(pos).filter(n => n !== name);
  setNames(pos, names);
  renderAssignedChips(pos);
  renderPool();
}

function addToPosition(pos, name) {
  const names = getNames(pos);
  if (!names.includes(name)) {
    names.push(name);
    setNames(pos, names);
  }
}

// ── Drag & Drop ────────────────────────────────
function setupDragDrop() {
  POSITIONS.forEach(pos => {
    const card = document.getElementById(pos).closest('.position-card');

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      card.classList.add('drag-over');
    };
    const handleDragLeave = (e) => {
      if (!card.contains(e.relatedTarget)) card.classList.remove('drag-over');
    };
    const handleDrop = (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      let payload;
      try { payload = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { payload = null; }
      if (!payload || !payload.name) return;

      const { name, from } = payload;
      if (from === pos) return;

      if (from && from !== 'pool' && POSITIONS.includes(from)) {
        const srcNames = getNames(from).filter(n => n !== name);
        setNames(from, srcNames);
        renderAssignedChips(from);
      }
      addToPosition(pos, name);
      renderAssignedChips(pos);
      renderPool();
      showToast(name + ' → ' + t('pos' + pos.charAt(0).toUpperCase() + pos.slice(1)));
    };

    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('dragleave', handleDragLeave);
    card.addEventListener('drop', handleDrop);
  });
}
