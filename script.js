// Beim Laden der Seite
window.addEventListener('DOMContentLoaded', function() {
    loadSavedData();
    setupAutoSave();
});

function loadSavedData() {
    const positions = ['aussen', 'mitte', 'zuspieler', 'libero', 'diagonal'];

    positions.forEach(position => {
        const savedData = localStorage.getItem('volleyball_' + position);
        if (savedData) {
            document.getElementById(position).value = savedData;
        }
    });

    // Checkbox-Status für beide Teams laden
    const team1NoLibero = localStorage.getItem('volleyball_team1_no_libero');
    if (team1NoLibero === 'true') {
        document.getElementById('team1-no-libero').checked = true;
    }
    
    const team2NoLibero = localStorage.getItem('volleyball_team2_no_libero');
    if (team2NoLibero === 'true') {
        document.getElementById('team2-no-libero').checked = true;
    }
}

function setupAutoSave() {
    const positions = ['aussen', 'mitte', 'zuspieler', 'libero', 'diagonal'];

    positions.forEach(position => {
        const textarea = document.getElementById(position);

        // Speichern bei jeder Änderung
        textarea.addEventListener('input', function() {
            localStorage.setItem('volleyball_' + position, this.value);
            showSavedIndicator();
        });
    });

    // Checkboxen für beide Teams speichern
    document.getElementById('team1-no-libero').addEventListener('change', function() {
        localStorage.setItem('volleyball_team1_no_libero', this.checked);
        showSavedIndicator();
    });
    
    document.getElementById('team2-no-libero').addEventListener('change', function() {
        localStorage.setItem('volleyball_team2_no_libero', this.checked);
        showSavedIndicator();
    });
}

function showSavedIndicator() {
    const indicator = document.getElementById('saved-indicator');
    indicator.classList.add('show');

    setTimeout(() => {
        indicator.classList.remove('show');
    }, 1500);
}

function clearAllData() {
    if (confirm('Wirklich alle gespeicherten Namen löschen?')) {
        const positions = ['aussen', 'mitte', 'zuspieler', 'libero', 'diagonal'];

        positions.forEach(position => {
            localStorage.removeItem('volleyball_' + position);
            document.getElementById(position).value = '';
        });

        localStorage.removeItem('volleyball_team1_no_libero');
        localStorage.removeItem('volleyball_team2_no_libero');
        document.getElementById('team1-no-libero').checked = false;
        document.getElementById('team2-no-libero').checked = false;

        document.getElementById('results').classList.remove('show');
        document.getElementById('info').innerHTML = '';

        alert('Alle Namen wurden gelöscht!');
    }
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function getNames(textareaId) {
    const textarea = document.getElementById(textareaId);
    return textarea.value
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
}

function generateTeams() {
    // Alle Spieler und ihre Präferenzen sammeln
    const playerPositions = new Map();

    const positions = {
        'Außenangreifer': getNames('aussen'),
        'Mittelblock': getNames('mitte'),
        'Zuspieler': getNames('zuspieler'),
        'Libero': getNames('libero'),
        'Diagonal': getNames('diagonal')
    };

    // Für jeden Spieler alle seine gewünschten Positionen speichern
    for (const [position, players] of Object.entries(positions)) {
        for (const player of players) {
            if (!playerPositions.has(player)) {
                playerPositions.set(player, []);
            }
            playerPositions.get(player).push(position);
        }
    }

    if (playerPositions.size === 0) {
        alert('Bitte gib mindestens einen Spieler ein!');
        return;
    }

    // Alle Spieler zufällig mischen und 50/50 aufteilen
    const allPlayers = Array.from(playerPositions.keys());
    const shuffledPlayers = shuffleArray(allPlayers);

    const team1Players = [];
    const team2Players = [];

    shuffledPlayers.forEach((player, index) => {
        if (index % 2 === 0) {
            team1Players.push(player);
        } else {
            team2Players.push(player);
        }
    });

    // Positionszuweisung NUR aus Präferenzen
    const team1 = assignPositionsFromPreferences(team1Players, playerPositions);
    const team2 = assignPositionsFromPreferences(team2Players, playerPositions);

    // Info-Meldungen
    const info = generateInfo(playerPositions.size);
    displayInfo(info);

    // Teams anzeigen
    displayTeam('team1-content', team1, 1);
    displayTeam('team2-content', team2, 2);

    document.getElementById('team1-count').textContent = `Gesamt: ${team1Players.length} Spieler`;
    document.getElementById('team2-count').textContent = `Gesamt: ${team2Players.length} Spieler`;

    // Ergebnisse einblenden
    document.getElementById('results').classList.add('show');

    // Zu den Ergebnissen scrollen
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function assignPositionsFromPreferences(players, playerPositions) {
    const team = {
        'Außenangreifer': [],
        'Mittelblock': [],
        'Zuspieler': [],
        'Libero': [],
        'Diagonal': []
    };

    // Spieler nach Flexibilität sortieren (erst die mit weniger Optionen)
    const sortedPlayers = players.map(player => ({
        name: player,
        positions: playerPositions.get(player),
        flexibility: playerPositions.get(player).length
    })).sort((a, b) => a.flexibility - b.flexibility);

    const assignedPlayers = new Set();

    // Alle Spieler zuweisen
    for (const player of sortedPlayers) {
        if (assignedPlayers.has(player.name)) continue;

        // Wenn nur eine Präferenz: direkt zuweisen
        if (player.flexibility === 1) {
            const position = player.positions[0];
            team[position].push({
                name: player.name,
                preferences: player.positions
            });
            assignedPlayers.add(player.name);
        } else {
            // Bei mehreren Präferenzen: die am wenigsten besetzte wählen
            const positionCounts = player.positions.map(pos => ({
                position: pos,
                count: team[pos].length
            })).sort((a, b) => a.count - b.count);

            // Zufällig eine der am wenigsten besetzten Positionen wählen
            const minCount = positionCounts[0].count;
            const leastOccupied = positionCounts.filter(p => p.count === minCount);
            const chosen = leastOccupied[Math.floor(Math.random() * leastOccupied.length)];

            team[chosen.position].push({
                name: player.name,
                preferences: player.positions
            });
            assignedPlayers.add(player.name);
        }
    }

    return team;
}

function generateInfo(totalPlayers) {
    const messages = [];

    if (totalPlayers % 2 !== 0) {
        messages.push(`ℹ️ ${totalPlayers} Spieler gesamt - ein Team hat einen Spieler mehr`);
    }

    return messages;
}

function displayInfo(messages) {
    const infoDiv = document.getElementById('info');

    if (messages.length === 0) {
        infoDiv.innerHTML = '';
        return;
    }

    let html = '<div class="info"><h4>Hinweise:</h4><ul>';
    messages.forEach(msg => {
        html += `<li>${msg}</li>`;
    });
    html += '</ul></div>';

    infoDiv.innerHTML = html;
}

function displayTeam(elementId, team, teamNumber) {
    const element = document.getElementById(elementId);
    let html = '';
    let hasPositions = false;

    // Prüfen ob dieses Team ohne Libero spielen soll
    const noLibero = document.getElementById(`team${teamNumber}-no-libero`).checked;

    const allPositions = ['Außenangreifer', 'Mittelblock', 'Zuspieler', 'Libero', 'Diagonal'];

    for (const position of allPositions) {
        // Libero-Position überspringen wenn Checkbox aktiviert ist
        if (position === 'Libero' && noLibero) {
            continue;
        }

        const players = team[position];

        // Nur Positionen anzeigen, die auch besetzt sind
        if (players.length > 0) {
            hasPositions = true;
            html += `
                <div class="team-position">
                    <strong>${position}</strong>
                    <ul>
                        ${players.map(p => {
                            const isFlexible = p.preferences.length > 1;

                            let text = `• ${p.name}`;
                            if (isFlexible) {
                                text += `<span class="flex-badge">kann auch: ${p.preferences.filter(pos => pos !== position).join(', ')}</span>`;
                            }
                            return `<li>${text}</li>`;
                        }).join('')}
                    </ul>
                </div>
            `;
        }
    }

    if (!hasPositions) {
        html = '<div class="no-positions">Keine Spieler zugewiesen</div>';
    }

    element.innerHTML = html;
}
