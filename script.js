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

    // Alle Spieler zufällig mischen
    const allPlayers = Array.from(playerPositions.keys());
    const shuffledPlayers = shuffleArray(allPlayers);

    // Checkbox-Status für beide Teams
    const team1NoLibero = document.getElementById('team1-no-libero').checked;
    const team2NoLibero = document.getElementById('team2-no-libero').checked;
    
    // Debug-Log zurücksetzen
    debugLog = '';
    console.log('🎯 CHECKBOX STATUS:');
    console.log(`   Team 1 ohne Libero: ${team1NoLibero}`);
    console.log(`   Team 2 ohne Libero: ${team2NoLibero}`);

    // Prüfe ob überhaupt lösbar: Gibt es pure Liberos wenn beide Teams ohne Libero?
    const pureLiberos = shuffledPlayers.filter(player => {
        const positions = playerPositions.get(player);
        return positions.length === 1 && positions[0] === 'Libero';
    });
    
    if (pureLiberos.length > 0 && team1NoLibero && team2NoLibero) {
        alert('❌ Es gibt Spieler die nur Libero können, aber beide Teams haben "ohne Libero" aktiviert!\n\n' +
              'Betroffene Spieler: ' + pureLiberos.join(', ') + '\n\n' +
              '💡 Lösung: Mindestens ein Team muss Libero erlauben, oder gib diesen Spielern weitere Positionen.');
        return;
    }

    // RETRY-MECHANISMUS: Probiere mehrere Aufteilungen
    let team1 = null;
    let team2 = null;
    let team1Players = [];
    let team2Players = [];
    let skippedPlayers = [];
    let attempts = 0;
    const maxAttempts = 10; // Probiere max 10 verschiedene Aufteilungen

    while (attempts < maxAttempts) {
        attempts++;
        
        // INTELLIGENTE AUFTEILUNG: Separiere pure Liberos von anderen
        const pureLiberoPlayers = [];
        const otherPlayers = [];
        
        for (const player of allPlayers) {
            const positions = playerPositions.get(player);
            if (positions.length === 1 && positions[0] === 'Libero') {
                pureLiberoPlayers.push(player);
            } else {
                otherPlayers.push(player);
            }
        }
        
        console.log(`🔄 Versuch ${attempts}:`);
        console.log(`   Pure Liberos: ${pureLiberoPlayers.length} ${pureLiberoPlayers.join(', ')}`);
        console.log(`   Andere Spieler: ${otherPlayers.length}`);
        
        // Mische beide Gruppen separat
        const shuffledLiberos = shuffleArray([...pureLiberoPlayers]);
        const shuffledOthers = shuffleArray([...otherPlayers]);
        
        team1Players = [];
        team2Players = [];
        
        // KRITISCH: Bei ungerader Spielerzahl muss Team OHNE Libero das KLEINERE Team sein!
        const totalPlayers = allPlayers.length;
        const isOdd = totalPlayers % 2 !== 0;
        
        // Berechne ideale Teamgrößen
        let team1Size = Math.floor(totalPlayers / 2);
        let team2Size = Math.floor(totalPlayers / 2);
        
        // SPEZIALFALL: Beide ohne Libero → Maximal 6 Spieler pro Team!
        if (team1NoLibero && team2NoLibero) {
            // Beide Teams spielen ohne Libero = nur 6 Positionen pro Team
            team1Size = Math.min(team1Size, 6);
            team2Size = Math.min(team2Size, 6);
            console.log(`   ⚠️ Beide ohne Libero: Maximal 6 Spieler pro Team → Team 1=${team1Size}, Team 2=${team2Size}`);
        } else if (isOdd) {
            // Bei ungerader Zahl: Ein Team bekommt +1 Spieler
            if (team1NoLibero && !team2NoLibero) {
                // Team 1 ohne Libero → Team 1 kleiner, Team 2 größer
                team2Size++;
                console.log(`   ⚠️ Ungerade Spielerzahl: Team 1 ohne Libero → Team 1=${team1Size}, Team 2=${team2Size}`);
            } else if (!team1NoLibero && team2NoLibero) {
                // Team 2 ohne Libero → Team 2 kleiner, Team 1 größer
                team1Size++;
                console.log(`   ⚠️ Ungerade Spielerzahl: Team 2 ohne Libero → Team 1=${team1Size}, Team 2=${team2Size}`);
            } else {
                // Beide mit Libero: Egal welches Team größer ist
                team1Size++;
                console.log(`   ℹ️ Ungerade Spielerzahl: Team 1=${team1Size}, Team 2=${team2Size}`);
            }
        }
        
        // Verteile pure Liberos basierend auf Haken
        if (team1NoLibero && !team2NoLibero) {
            // Alle Liberos zu Team 2
            team2Players.push(...shuffledLiberos);
            console.log(`   → ${shuffledLiberos.length} Liberos zu Team 2 (Team 1 ohne Libero)`);
            
            // AUSGLEICH: Verschiebe gleich viele andere Spieler von Team 2 zu Team 1
            const toBalance = Math.min(shuffledLiberos.length, shuffledOthers.length);
            for (let i = 0; i < toBalance && shuffledOthers.length > 0; i++) {
                const balancePlayer = shuffledOthers.pop();
                team1Players.push(balancePlayer);
                console.log(`      Ausgleich: ${balancePlayer} zu Team 1`);
            }
        } else if (!team1NoLibero && team2NoLibero) {
            // Alle Liberos zu Team 1
            team1Players.push(...shuffledLiberos);
            console.log(`   → ${shuffledLiberos.length} Liberos zu Team 1 (Team 2 ohne Libero)`);
            
            // AUSGLEICH: Verschiebe gleich viele andere Spieler von Team 1 zu Team 2  
            const toBalance = Math.min(shuffledLiberos.length, shuffledOthers.length);
            for (let i = 0; i < toBalance && shuffledOthers.length > 0; i++) {
                const balancePlayer = shuffledOthers.pop();
                team2Players.push(balancePlayer);
                console.log(`      Ausgleich: ${balancePlayer} zu Team 2`);
            }
        } else if (!team1NoLibero && !team2NoLibero) {
            // Beide erlauben Libero: 50/50
            shuffledLiberos.forEach((player, index) => {
                if (index % 2 === 0) {
                    team1Players.push(player);
                } else {
                    team2Players.push(player);
                }
            });
            console.log(`   → Liberos 50/50 verteilt`);
        }
        // Wenn beide noLibero: wird oben schon abgefangen
        
        // Verteile RESTLICHE andere Spieler gemäß team1Size und team2Size
        while (shuffledOthers.length > 0) {
            let added = false;
            
            if (team1Players.length < team1Size && shuffledOthers.length > 0) {
                team1Players.push(shuffledOthers.shift());
                added = true;
            }
            if (team2Players.length < team2Size && shuffledOthers.length > 0) {
                team2Players.push(shuffledOthers.shift());
                added = true;
            }
            
            // Wenn beide Teams voll sind, Rest bleibt übrig (für die Bank)
            if (!added) {
                console.log(`   ⚠️ Beide Teams voll! ${shuffledOthers.length} Spieler übrig für die Bank`);
                break;
            }
        }

        console.log(`   Team 1: ${team1Players.length} Spieler`, team1Players);
        console.log(`   Team 2: ${team2Players.length} Spieler`, team2Players);
        
        // Sammle überzählige Spieler für die Bank
        const benchPlayers = [];
        while (shuffledOthers.length > 0) {
            const player = shuffledOthers.shift();
            benchPlayers.push({
                name: player,
                preferredPositions: playerPositions.get(player)
            });
        }
        if (benchPlayers.length > 0) {
            console.log(`   🪑 ${benchPlayers.length} Spieler für die Bank:`, benchPlayers.map(p => p.name));
        }
        
        // Debug: Zeige welche Spieler welche Positionen haben
        console.log(`   Team 1 Details:`);
        team1Players.forEach(p => {
            const positions = playerPositions.get(p);
            const availablePos = positions.filter(pos => !(team1NoLibero && pos === 'Libero'));
            console.log(`      ${p}: ${positions.join(', ')} → verfügbar: ${availablePos.join(', ')}`);
        });
        console.log(`   Team 2 Details:`);
        team2Players.forEach(p => {
            const positions = playerPositions.get(p);
            const availablePos = positions.filter(pos => !(team2NoLibero && pos === 'Libero'));
            console.log(`      ${p}: ${positions.join(', ')} → verfügbar: ${availablePos.join(', ')}`);
        });

        // Versuche Positionen zuzuweisen mit Backtracking
        console.log(`🎲 Starte Backtracking für beide Teams...`);
        
        const result1 = assignPositionsFromPreferences(team1Players, playerPositions, team1NoLibero);
        const result2 = assignPositionsFromPreferences(team2Players, playerPositions, team2NoLibero);
        
        console.log(`   Team1 Result: ${result1.skipped.length} übersprungen`);
        console.log(`   Team2 Result: ${result2.skipped.length} übersprungen`);
        
        team1 = result1.team;
        team2 = result2.team;
        // Kombiniere: Backtracking-Skips + Bench-Spieler
        skippedPlayers = [...result1.skipped, ...result2.skipped, ...benchPlayers];

        // Erfolg wenn beide Teams komplett zugewiesen wurden
        // (Bench-Spieler sind OK und kein Grund zum Retry)
        if (result1.skipped.length === 0 && result2.skipped.length === 0) {
            if (benchPlayers.length > 0) {
                console.log(`✓ Lösung gefunden nach ${attempts} Versuch(en) - ${benchPlayers.length} Spieler auf der Bank`);
            } else {
                console.log(`✓ Lösung gefunden nach ${attempts} Versuch(en)`);
            }
            break;
        }
        
        // Bei letztem Versuch: Zeige Fehler
        if (attempts === maxAttempts) {
            alert(`❌ Keine gültige Teamaufteilung gefunden nach ${maxAttempts} Versuchen!\n\n` +
                  `Das kann passieren wenn:\n` +
                  `• Zu viele Spieler die gleichen Positionen wollen\n` +
                  `• Die Libero-Einstellungen die Aufteilung unmöglich machen\n\n` +
                  `💡 Versuche:\n` +
                  `• Noch einmal "Teams generieren" klicken\n` +
                  `• Spielern mehr Positions-Optionen geben\n` +
                  `• Libero-Haken anpassen`);
            return;
        }
    }

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

    // Auswechselbank anzeigen wenn Spieler übrig sind
    displayBench(skippedPlayers);

    // Ergebnisse einblenden
    document.getElementById('results').classList.add('show');

    // Zu den Ergebnissen scrollen
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function assignPositionsFromPreferences(players, playerPositions, noLibero = false) {
    console.log(`📋 assignPositionsFromPreferences aufgerufen: ${players.length} Spieler, noLibero=${noLibero}`);
    
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
    
    console.log(`   Libero Limit: ${maxPerPosition['Libero']}`);

    // Sortiere Spieler: wenig flexible zuerst (für bessere Performance)
    const sortedPlayers = players.map(player => ({
        name: player,
        positions: playerPositions.get(player),
        flexibility: playerPositions.get(player).length
    })).sort((a, b) => a.flexibility - b.flexibility);
    
    console.log(`   Spieler sortiert:`, sortedPlayers.map(p => `${p.name}(${p.positions.join(',')})`));

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
    
    console.log(`   Backtracking Ergebnis: ${success ? '✅ ERFOLG' : '❌ FEHLGESCHLAGEN'}`);
    if (success) {
        console.log(`   Zuweisungen:`, Object.entries(team).map(([pos, players]) => `${pos}: ${players.length}`));
    }

    if (success) {
        return { team, skipped: [] };
    } else {
        // Keine Lösung möglich - gebe alle Spieler als übersprungen zurück
        const skippedPlayers = sortedPlayers.map(p => ({
            name: p.name,
            preferredPositions: p.positions
        }));
        console.log(`   ⚠️ Alle Spieler übersprungen`);
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

function displayBench(skippedPlayers) {
    const benchSection = document.getElementById('bench-section');
    const benchContent = document.getElementById('bench-content');
    
    if (skippedPlayers.length === 0) {
        benchSection.style.display = 'none';
        return;
    }
    
    // Zeige Auswechselbank
    benchSection.style.display = 'block';
    
    let html = '';
    skippedPlayers.forEach(player => {
        html += `
            <div style="background: #f8f8f8; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
                <div style="font-weight: bold; margin-bottom: 5px;">👤 ${player.name}</div>
                <div style="font-size: 12px; color: #666;">Kann: ${player.preferredPositions.join(', ')}</div>
            </div>
        `;
    });
    
    benchContent.innerHTML = html;
}
