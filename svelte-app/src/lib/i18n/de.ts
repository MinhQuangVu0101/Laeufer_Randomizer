const _de = {
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
  positionPerTeam: '/ Team',
  positionTotalLabel: 'total',
  regenerate: '↻ Nochmal',
  positionQuickAdd: '+ Name (Enter)',
  positionRemoveTitle: 'Entfernen',

  posAussen: 'Aussenangreifer',
  posMitte: 'Mittelblock',
  posZuspieler: 'Zuspieler',
  posLibero: 'Libero',
  posDiagonal: 'Diagonal',

  team1WithLibero: 'Team 1 mit Libero',
  team2WithLibero: 'Team 2 mit Libero',

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
    'Diese Spieler können nur Libero spielen, aber kein Team hat „mit Libero" aktiviert',
  errorOnlyLiberoFix: 'Aktiviere die Libero-Option für mindestens ein Team.',
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

  authActivate: '☁ Sync aktivieren',
  authSignedIn: 'Sync',
  authSignOut: 'Abmelden',
  authEmailTitle: 'Email-Login',
  authEmailHint: 'Wir senden dir einen 6-stelligen Code per Email.',
  authEmailLabel: 'Email',
  authEmailPlaceholder: 'deine@email.de',
  authSendOtp: 'Code senden',
  authCancel: 'Abbrechen',
  authOtpTitle: 'Code eingeben',
  authOtpHint: '6-stelliger Code aus der Email an {email}',
  authOtpLabel: 'Code',
  authOtpPlaceholder: '123456',
  authVerify: 'Bestätigen',
  authChangeEmail: 'Andere Email',
  authToastSignedIn: 'Eingeloggt',
  authToastSignedOut: 'Abgemeldet',
  authToastOtpSent: 'Code per Email gesendet',
  authError: 'Login fehlgeschlagen',
  authErrorRateLimit: 'Zu viele Versuche — bitte warte einen Moment.',

  syncWizardTitle: 'Erstes Sync',
  syncWizardDescr: 'Wir haben deinen Cloud-Stand geladen. Was soll passieren?',
  syncWizardLocalSummary: 'Lokal: {n} Roster',
  syncWizardRemoteSummary: 'Cloud: {n} Roster',
  syncPullLabel: 'Cloud → Hier',
  syncPullDescr: 'Lokale Daten werden ersetzt',
  syncPushLabel: 'Hier → Cloud',
  syncPushDescr: 'Cloud wird mit lokalen Daten überschrieben',
  syncMergeLabel: 'Per Roster mergen',
  syncMergeDescr: 'Pro Roster gewinnt das mit dem neueren Timestamp',
  syncLaterLabel: 'Später entscheiden',
  syncToastPulled: 'Cloud-Daten übernommen',
  syncToastPushed: 'Lokale Daten hochgeladen',
  syncToastMerged: 'Daten zusammengeführt',
  syncFailed: 'Sync fehlgeschlagen',
};

export const de = _de;
export type TranslationKey = keyof typeof _de;
export type TranslationDict = Record<TranslationKey, string>;
