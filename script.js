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

    // Checkbox-Status für beide Teams
    const team1NoLibero = document.getElementById('team1-no-libero').checked;
    const team2NoLibero = document.getElementById('team2-no-libero').checked;

    // Positionszuweisung NUR aus Präferenzen
    const result1 = assignPositionsFromPreferences(team1Players, playerPositions, team1NoLibero);
    const result2 = assignPositionsFromPreferences(team2Players, playerPositions, team2NoLibero);
    
    const team1 = result1.team;
    const team2 = result2.team;
    const skippedPlayers = [...result1.skipped, ...result2.skipped];

    // Info-Meldungen
    const info = generateInfo(playerPositions.size, skippedPlayers, team1, team2);
    displayInfo(info);

    // Teams anzeigen
    displayTeam('team1-content', team1, 1);
    displayTeam('team2-content', team2, 2);

    // Tatsächlich zugewiesene Spieler zählen
    const team1Count = Object.values(team1).reduce((sum, pos) => sum + pos.length, 0);
    const team2Count = Object.values(team2).reduce((sum, pos) => sum + pos.length, 0);

    document.getElementById('team1-count').textContent = `Gesamt: ${team1Count} Spieler`;
    document.getElementById('team2-count').textContent = `Gesamt: ${team2Count} Spieler`;

    // Ergebnisse einblenden
    document.getElementById('results').classList.add('show');

    // Zu den Ergebnissen scrollen
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function assignPositionsFromPreferences(players, playerPositions, noLibero = false) {
    const team = {
        'Außenangreifer': [],
        'Mittelblock': [],
        'Zuspieler': [],
        'Libero': [],
        'Diagonal': []
    };

    // Maximale Anzahl Spieler pro Position
    const maxPerPosition = {
        'Außenangreifer': 2,
        'Mittelblock': 2,
        'Zuspieler': 1,
        'Libero': noLibero ? 0 : 1,
        'Diagonal': 1
    };

    // Sortiere Spieler: wenig flexible zuerst (für bessere Performance)
    const sortedPlayers = players.map(player => ({
        name: player,
        positions: playerPositions.get(player),
        flexibility: playerPositions.get(player).length
    })).sort((a, b) => a.flexibility - b.flexibility);

    // BACKTRACKING-ALGORITHMUS
    function backtrack(playerIndex) {
        // Basisfall: Alle Spieler wurden zugewiesen
        if (playerIndex === sortedPlayers.length) {
            return true; // Erfolg!
        }

        const player = sortedPlayers[playerIndex];

        // Probiere alle Positionen dieses Spielers aus
        for (const position of player.positions) {
            // Skip Libero wenn noLibero aktiviert
            if (noLibero && position === 'Libero') continue;

            // Prüfe ob Position noch Platz hat
            if (team[position].length < maxPerPosition[position]) {
                // Weise Position zu
                team[position].push({
                    name: player.name,
                    preferences: player.positions
                });

                // Versuche rekursiv den nächsten Spieler zuzuweisen
                if (backtrack(playerIndex + 1)) {
                    return true; // Lösung gefunden!
                }

                // Backtrack: Entferne Zuweisung wieder und probiere nächste Position
                team[position].pop();
            }
        }

        // Keine gültige Zuweisung für diesen Spieler gefunden
        return false;
    }

    // Starte Backtracking
    const success = backtrack(0);

    if (success) {
        return { team, skipped: [] };
    } else {
        // Keine Lösung möglich - gebe alle Spieler als übersprungen zurück
        const skippedPlayers = sortedPlayers.map(p => ({
            name: p.name,
            preferredPositions: p.positions
        }));
        return { team, skipped: skippedPlayers };
    }
}

function generateInfo(totalPlayers, skippedPlayers = [], team1 = null, team2 = null) {
    const messages = [];

    if (totalPlayers % 2 !== 0) {
        messages.push(`ℹ️ ${totalPlayers} Spieler gesamt - ein Team hat einen Spieler mehr`);
    }

    if (skippedPlayers.length > 0) {
        // Wenn ALLE Spieler übersprungen wurden, ist es ein Backtracking-Fehler
        const team1Count = team1 ? Object.values(team1).reduce((sum, pos) => sum + pos.length, 0) : 0;
        const team2Count = team2 ? Object.values(team2).reduce((sum, pos) => sum + pos.length, 0) : 0;
        
        if (team1Count === 0 || team2Count === 0) {
            messages.push(`❌ Keine gültige Zuteilung möglich! Die Spielerkombination passt nicht zu den Positionslimits.`);
            messages.push(`💡 Versuche: Mehr flexible Spieler hinzufügen oder weniger Spieler mit gleichen Positionen`);
        } else {
            messages.push(`⚠️ Folgende Spieler konnten nicht zugewiesen werden (alle gewünschten Positionen sind voll):`);
            skippedPlayers.forEach(player => {
                messages.push(`   • ${player.name} (kann: ${player.preferredPositions.join(', ')})`);
            });
        }
        
        // Debug-Info: Zeige Belegung der Teams
        if (team1 && team2 && (team1Count > 0 || team2Count > 0)) {
            messages.push(`📊 Belegung der Teams:`);
            
            const positions = ['Außenangreifer', 'Mittelblock', 'Zuspieler', 'Libero', 'Diagonal'];
            const maxPos = { 'Außenangreifer': 2, 'Mittelblock': 2, 'Zuspieler': 1, 'Libero': 1, 'Diagonal': 1 };
            
            positions.forEach(pos => {
                const t1Count = team1[pos].length;
                const t2Count = team2[pos].length;
                const max = maxPos[pos];
                messages.push(`   • ${pos}: Team1 ${t1Count}/${max}, Team2 ${t2Count}/${max}`);
            });
        }
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

    const allPositions = ['Außenangreifer', 'Mittelblock', 'Zuspieler', 'Libero', 'Diagonal'];

    for (const position of allPositions) {
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
