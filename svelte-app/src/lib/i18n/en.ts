import type { TranslationDict } from './de';

export const en: TranslationDict = {
  appTitle: 'Volleyball Generator',
  subtitle: 'Fair teams at the tap of a button',

  loadRoster: '— Load roster —',
  rosterSave: 'Save',
  rosterDelete: 'Remove',
  rosterSavedToast: 'Roster saved',
  rosterLoadedToast: 'Roster loaded',
  rosterDeletedToast: 'Roster deleted',
  promptRosterName: 'Roster name:',
  rosterEmpty: 'No rosters saved yet',

  poolHeader: 'Player Pool',
  poolAdd: '+ Name',
  promptPlayerName: 'Player name:',

  modePositions: 'With positions',
  modeSimple: 'Without positions',

  positionMaxLabel: 'max',
  positionQuickAdd: '+ Name (Enter)',
  positionRemoveTitle: 'Remove',

  posAussen: 'Outside Hitter',
  posMitte: 'Middle Blocker',
  posZuspieler: 'Setter',
  posLibero: 'Libero',
  posDiagonal: 'Opposite',

  team1NoLibero: 'Team 1 without libero',
  team2NoLibero: 'Team 2 without libero',

  perTeam: 'Per team',
  restToBench: 'Rest → bench',

  simplePlaceholder: 'One name per line — or drag players from the pool',

  generate: 'Generate Teams',
  clearTitle: 'Clear all assignments',
  confirmClear: 'Really clear all assignments?',

  generatedTeams: 'Generated Teams',
  team1: 'Team 1',
  team2: 'Team 2',
  playersCount: 'players',
  benchHeader: 'Bench',

  errorNoPlayers: 'No players assigned.',
  errorNoPlayersBody: 'Please assign at least one player to a team before generating.',
  errorOnlyLibero: 'Libero conflict.',
  errorOnlyLiberoBody:
    'These players can only play libero, but both teams have "no libero" enabled',
  errorOnlyLiberoFix: 'Disable the option for at least one team.',
  errorNoSolution: 'No valid split found.',
  errorNoSolutionBody:
    'Try different player combinations or change the libero options. You may have too many players in a single position.',

  hintNamesOnlyInSimple: 'Names are only in "Without positions".',
  hintPlayersInPositions: 'Players currently assigned to positions — switch back to see them.',
  flattenAll: 'Move all here',

  copyTeams: 'Copy',
  copiedToast: 'Teams copied!',
  copyTeamLabel: 'Team',
  exportImage: 'PNG',
  exportPdf: 'PDF',
  imageDownloaded: 'Image downloaded',
  pdfDownloaded: 'PDF downloaded',
  exportFailed: 'Export failed',

  historyHeader: 'Recent Generations',
  historyEmpty: 'No generations yet',
  historyAgo: 'just now',
  historyMinutesAgo: '{n} min ago',
  historyHoursAgo: '{n} h ago',
};
