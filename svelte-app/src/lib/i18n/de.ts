export const de = {
  appTitle: 'Volleyball Generator',
  subtitle: 'Faire Teams per Knopfdruck',

  loadRoster: '— Kader laden —',
  rosterSave: 'Speichern',
  rosterDelete: 'Entfernen',
  rosterSavedToast: 'Kader gespeichert',
  rosterLoadedToast: 'Kader geladen',
  rosterDeletedToast: 'Kader gelöscht',
  promptRosterName: 'Kader-Name:',
  rosterEmpty: 'Noch keine Kader gespeichert',

  poolHeader: 'Spieler-Pool',
  poolAdd: '+ Name',
  promptPlayerName: 'Spieler-Name:',

  modePositions: 'Mit Positionen',
  modeSimple: 'Ohne Positionen',

  positionMaxLabel: 'max',
  positionQuickAdd: '+ Name (Enter)',
  positionRemoveTitle: 'Entfernen',

  posAussen: 'Aussenangreifer',
  posMitte: 'Mittelblock',
  posZuspieler: 'Zuspieler',
  posLibero: 'Libero',
  posDiagonal: 'Diagonal',

  team1NoLibero: 'Team 1 ohne Libero',
  team2NoLibero: 'Team 2 ohne Libero',

  perTeam: 'Pro Team',
  restToBench: 'Rest → Bank',

  simplePlaceholder: 'Ein Name pro Zeile — oder Spieler aus dem Pool draggen',

  generate: 'Teams generieren',
  clearTitle: 'Alle Zuweisungen löschen',
  confirmClear: 'Wirklich alle Zuweisungen löschen?',

  generatedTeams: 'Generierte Teams',
  team1: 'Team 1',
  team2: 'Team 2',
  playersCount: 'Spieler',
  benchHeader: 'Auswechselbank',

  errorNoPlayers: 'Keine Spieler zugewiesen.',
  errorNoPlayersBody: 'Bitte mindestens einen Spieler einem Team zuweisen, bevor du generierst.',
  errorOnlyLibero: 'Libero-Konflikt.',
  errorOnlyLiberoBody:
    'Diese Spieler können nur Libero spielen, aber beide Teams haben „ohne Libero" aktiviert',
  errorOnlyLiberoFix: 'Deaktiviere die Option für mindestens ein Team.',
  errorNoSolution: 'Keine gültige Aufteilung gefunden.',
  errorNoSolutionBody:
    'Probiere andere Spielerkombinationen oder ändere die Libero-Optionen. Vielleicht hast du zu viele Spieler einer einzelnen Position.',

  hintNamesOnlyInSimple: 'Namen sind nur in „Ohne Positionen" hinzugefügt.',
  hintPlayersInPositions: 'Spieler aktuell in Positionen zugewiesen — wechsle zurück um sie zu sehen.',
  flattenAll: 'Alle hierher übernehmen',

  copyTeams: 'Kopieren',
  copiedToast: 'Teams kopiert!',
  copyTeamLabel: 'Team',
  exportImage: 'PNG',
  exportPdf: 'PDF',
  imageDownloaded: 'Bild gespeichert',
  pdfDownloaded: 'PDF gespeichert',
  exportFailed: 'Export fehlgeschlagen',

  historyHeader: 'Letzte Generierungen',
  historyEmpty: 'Noch keine Generierungen',
  historyAgo: 'gerade eben',
  historyMinutesAgo: 'vor {n} min',
  historyHoursAgo: 'vor {n} h',
};

export type TranslationKey = keyof typeof de;
export type TranslationDict = Record<TranslationKey, string>;
