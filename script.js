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
  refreshRosterDropdown();
  renderHistory();
  initPlayerPool();
  setupDragDrop();
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
}

function setupAutoSave() {
  POSITIONS.forEach(pos => {
    document.getElementById(pos).addEventListener('input', function() {
      localStorage.setItem('vb_' + pos, this.value);
    });
  });
  document.getElementById('team1-no-libero').addEventListener('change', function() {
    localStorage.setItem('vb_team1_no_libero', this.checked);
  });
  document.getElementById('team2-no-libero').addEventListener('change', function() {
    localStorage.setItem('vb_team2_no_libero', this.checked);
  });
}

function clearAllData() {
  if (!confirm('Wirklich alle Namen loeschen?')) return;
  POSITIONS.forEach(pos => {
    localStorage.removeItem('vb_' + pos);
    document.getElementById(pos).value = '';
  });
  localStorage.removeItem('vb_team1_no_libero');
  localStorage.removeItem('vb_team2_no_libero');
  document.getElementById('team1-no-libero').checked = false;
  document.getElementById('team2-no-libero').checked = false;
  document.getElementById('results').style.display = 'none';
  hideInfo();
  showToast('Alles geloescht');
}

// ── Roster Save/Load ───────────────────────────
function getRosters() {
  try { return JSON.parse(localStorage.getItem('vb_rosters') || '{}'); } catch { return {}; }
}

function saveRoster() {
  const name = prompt('Kader-Name:');
  if (!name) return;
  const rosters = getRosters();
  const data = {};
  POSITIONS.forEach(pos => { data[pos] = document.getElementById(pos).value; });
  data.team1NoLibero = document.getElementById('team1-no-libero').checked;
  data.team2NoLibero = document.getElementById('team2-no-libero').checked;
  rosters[name] = data;
  localStorage.setItem('vb_rosters', JSON.stringify(rosters));
  refreshRosterDropdown();
  showToast('Kader gespeichert: ' + name);
}

function deleteRoster() {
  const select = document.getElementById('roster-select');
  const name = select.value;
  if (!name) return;
  const rosters = getRosters();
  delete rosters[name];
  localStorage.setItem('vb_rosters', JSON.stringify(rosters));
  refreshRosterDropdown();
  showToast('Kader geloescht');
}

function refreshRosterDropdown() {
  const select = document.getElementById('roster-select');
  const rosters = getRosters();
  select.innerHTML = '<option value="">-- Kader laden --</option>';
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
    });
    document.getElementById('team1-no-libero').checked = !!data.team1NoLibero;
    document.getElementById('team2-no-libero').checked = !!data.team2NoLibero;
    showToast('Kader geladen: ' + this.value);
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
function generateTeams() {
  hideInfo();
  const playerPositions = getAllPlayerPositions();

  if (playerPositions.size === 0) {
    showInfo(['Bitte mindestens einen Spieler eingeben.'], 'error');
    return;
  }

  const team1NoLibero = document.getElementById('team1-no-libero').checked;
  const team2NoLibero = document.getElementById('team2-no-libero').checked;

  // Check: pure liberos with both teams noLibero
  const pureLiberos = [...playerPositions.entries()]
    .filter(([_, pos]) => pos.length === 1 && pos[0] === 'Libero')
    .map(([name]) => name);

  if (pureLiberos.length > 0 && team1NoLibero && team2NoLibero) {
    showInfo([
      'Es gibt Spieler die nur Libero koennen, aber beide Teams haben "ohne Libero" aktiviert.',
      'Betroffene: ' + pureLiberos.join(', ')
    ], 'error');
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
    let t1Players = [], t2Players = [];
    let team1Size = Math.floor(total / 2);
    let team2Size = Math.floor(total / 2);

    if (team1NoLibero && team2NoLibero) {
      team1Size = Math.min(team1Size, 6);
      team2Size = Math.min(team2Size, 6);
    } else if (total % 2 !== 0) {
      if (team1NoLibero) team2Size++; else team1Size++;
    }

    // Distribute pure liberos
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

    // Fill remaining
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
    showInfo(['Keine gueltige Teamaufteilung moeglich. Probiere andere Spielerkombinationen.'], 'error');
    return;
  }

  // Info messages
  const msgs = [];
  if (allPlayers.length % 2 !== 0) msgs.push(allPlayers.length + ' Spieler — ein Team hat einen Spieler mehr.');
  if (bestResult.skipped.length > 0) {
    const onBench = bestResult.bench.map(p => p.name);
    const unassigned = bestResult.skipped.filter(p => !onBench.includes(p.name));
    if (unassigned.length > 0) {
      msgs.push('Konnten nicht zugewiesen werden: ' + unassigned.map(p => p.name + ' (' + p.preferredPositions.join(', ') + ')').join(', '));
    }
  }
  if (msgs.length > 0) showInfo(msgs, 'warn');

  // Display
  displayTeam('team1-content', bestResult.team1);
  displayTeam('team2-content', bestResult.team2);
  const c1 = Object.values(bestResult.team1).reduce((s, a) => s + a.length, 0);
  const c2 = Object.values(bestResult.team2).reduce((s, a) => s + a.length, 0);
  document.getElementById('team1-count').textContent = c1 + ' Spieler';
  document.getElementById('team2-count').textContent = c2 + ' Spieler';
  displayBench(bestResult.skipped.filter(p => bestResult.bench.some(b => b.name === p.name)));
  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Save to history
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
  el.innerHTML = html || '<div style="text-align:center;color:var(--text-muted);padding:16px;">Keine Spieler</div>';
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
  const order = ['Aussenangreifer', 'Mittelblock', 'Zuspieler', 'Libero', 'Diagonal'];
  let text = '--- Team 1 ---\n';
  const t1 = document.getElementById('team1-content');
  t1.querySelectorAll('.team-pos').forEach(pos => {
    const label = pos.querySelector('.team-pos-label').textContent;
    const names = [...pos.querySelectorAll('.team-pos-player')].map(p => p.childNodes[0].textContent.trim());
    text += label + ': ' + names.join(', ') + '\n';
  });
  text += '\n--- Team 2 ---\n';
  const t2 = document.getElementById('team2-content');
  t2.querySelectorAll('.team-pos').forEach(pos => {
    const label = pos.querySelector('.team-pos-label').textContent;
    const names = [...pos.querySelectorAll('.team-pos-player')].map(p => p.childNodes[0].textContent.trim());
    text += label + ': ' + names.join(', ') + '\n';
  });
  navigator.clipboard.writeText(text).then(() => showToast('Teams kopiert!'));
}

// ── History ────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem('vb_history') || '[]'); } catch { return []; }
}

function addHistory(result) {
  const history = getHistory();
  const entry = {
    time: new Date().toLocaleString('de-DE'),
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
      <strong>T1:</strong> ${e.team1.join(', ')}<br>
      <strong>T2:</strong> ${e.team2.join(', ')}
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

  // Collect all names currently in textareas
  const assigned = new Set();
  POSITIONS.forEach(pos => {
    getNames(pos).forEach(n => assigned.add(n));
  });

  container.innerHTML = '';
  players.forEach(name => {
    const chip = document.createElement('div');
    chip.className = 'pool-chip' + (assigned.has(name) ? ' is-assigned' : '');
    chip.draggable = true;
    chip.dataset.player = name;
    chip.innerHTML = `${name} <span class="pool-chip-remove" onclick="removePoolPlayer(event, '${name}')">&times;</span>`;

    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', name);
      e.dataTransfer.effectAllowed = 'copy';
      chip.style.opacity = '0.5';
    });
    chip.addEventListener('dragend', () => {
      chip.style.opacity = '';
    });

    container.appendChild(chip);
  });
}

function addCustomPlayer() {
  const name = prompt('Spieler-Name:');
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

// ── Drag & Drop ────────────────────────────────
function setupDragDrop() {
  // Make textareas accept drops
  POSITIONS.forEach(pos => {
    const textarea = document.getElementById(pos);
    const card = textarea.closest('.position-card');

    textarea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      textarea.classList.add('drag-over');
    });
    textarea.addEventListener('dragleave', () => {
      textarea.classList.remove('drag-over');
    });
    textarea.addEventListener('drop', (e) => {
      e.preventDefault();
      textarea.classList.remove('drag-over');
      const name = e.dataTransfer.getData('text/plain');
      if (!name) return;

      // Add name to textarea if not already there
      const current = textarea.value.split('\n').map(n => n.trim()).filter(n => n);
      if (!current.includes(name)) {
        current.push(name);
        textarea.value = current.join('\n');
        localStorage.setItem('vb_' + pos, textarea.value);
        renderPool(); // Update assigned state
        showToast(name + ' → ' + (LABEL_MAP[pos] || pos));
      }
    });

    // Also handle dragover on the card itself
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('drag-over');
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });
    card.addEventListener('drop', (e) => {
      // Delegate to textarea handler if not already handled
      card.classList.remove('drag-over');
    });
  });

  // Update pool when textareas change
  POSITIONS.forEach(pos => {
    document.getElementById(pos).addEventListener('input', () => {
      renderPool();
    });
  });
}
