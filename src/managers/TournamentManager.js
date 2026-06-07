const fs = require('fs');
const path = require('path');
const { createTournament } = require('../models/Tournament');

const CONFIG_PATH = path.join(__dirname, '../../tournament.config.json');

const DEFAULT_CONFIG = {
  id: 10,
  tournamentName: 'Classic Tournament',
  description: '',
  themeColor: '#FF0000',
  imageUrl: '',
  iconUrl: '',
  sponsorImageUrl: '',
  map: 'tile fall',
  roundCount: 5,
};

class TournamentManagerClass {
  constructor() {
    this.tournaments = new Map();
    this.brackets = new Map();
  }

  loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
      try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')); }
      catch { console.warn('[TournamentManager] Config inválido, usando padrão'); }
    }
    return { ...DEFAULT_CONFIG };
  }

  saveConfig(data) {
    const allowed = ['tournamentName', 'description', 'themeColor', 'imageUrl', 'iconUrl', 'sponsorImageUrl', 'map', 'roundCount'];
    const current = this.loadConfig();
    for (const key of allowed)
      if (data[key] !== undefined) current[key] = data[key];
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(current, null, 2));
    return current;
  }

  init() {
    const config = this.loadConfig();
    const t = createTournament(config);
    this.tournaments.set(t.id, t);
    console.log(`[TournamentManager] Torneio iniciado: "${t.tournamentName}" (id=${t.id})`);
  }

  updateConfig(data) {
    const config = this.saveConfig(data);
    const t = this.tournaments.get(10);
    if (t) Object.assign(t, config);
    return config;
  }

  getAll() { return Array.from(this.tournaments.values()); }

  getById(id) { return this.tournaments.get(Number(id)) || null; }

  create(data) {
    const t = createTournament(data);
    this.tournaments.set(t.id, t);
    this._initBracket(t);
    return t;
  }

  register(tournamentId, playerId, playerName) {
    const t = this.tournaments.get(Number(tournamentId));
    if (!t) return { error: 'Tournament not found' };
    if (t.participants.find(p => p.id === playerId)) return { error: 'Already registered' };
    if (t.participants.length >= 128) return { error: 'Tournament full' };
    t.participants.push({ id: playerId, name: playerName, registeredAt: new Date().toISOString() });
    if (t.participants.length >= 2) this._buildBracket(t);
    return { success: true, tournament: t };
  }

  reportResult(tournamentId, matchId, winnerId) {
    const bracket = this.brackets.get(Number(tournamentId));
    if (!bracket) return { error: 'Bracket not found' };
    const match = bracket.matches.find(m => m.id === matchId);
    if (!match) return { error: 'Match not found' };
    if (match.winnerId) return { error: 'Match already resolved' };
    match.winnerId = winnerId;
    match.status = 'finished';
    match.finishedAt = new Date().toISOString();
    this._advanceBracket(tournamentId, bracket, match);
    return { success: true, match, bracket };
  }

  getBracket(tournamentId) { return this.brackets.get(Number(tournamentId)) || null; }

  _initBracket(tournament) {
    this.brackets.set(tournament.id, { tournamentId: tournament.id, matches: [], round: 1, finished: false, winnerId: null });
  }

  _buildBracket(tournament) {
    const participants = [...tournament.participants].sort(() => Math.random() - 0.5);
    const matches = [];
    let matchId = 1;
    for (let i = 0; i < participants.length - 1; i += 2)
      matches.push({ id: matchId++, round: 1, player1: participants[i], player2: participants[i + 1] || null, winnerId: null, status: 'pending' });
    const bracket = this.brackets.get(tournament.id) || {};
    Object.assign(bracket, { tournamentId: tournament.id, matches, round: 1, finished: false });
    this.brackets.set(tournament.id, bracket);
  }

  _advanceBracket(tournamentId, bracket, resolvedMatch) {
    const pending = bracket.matches.filter(m => m.round === bracket.round && !m.winnerId);
    if (pending.length > 0) return;
    const winners = bracket.matches
      .filter(m => m.round === bracket.round)
      .map(m => [m.player1, m.player2].filter(Boolean).find(p => p.id === m.winnerId) || m.player1);
    if (winners.length === 1) {
      bracket.finished = true;
      bracket.winnerId = winners[0].id;
      const t = this.tournaments.get(Number(tournamentId));
      if (t) { t.status = 3; t.winner = winners[0]; }
      return;
    }
    bracket.round++;
    let matchId = bracket.matches.length + 1;
    for (let i = 0; i < winners.length - 1; i += 2)
      bracket.matches.push({ id: matchId++, round: bracket.round, player1: winners[i], player2: winners[i + 1] || null, winnerId: null, status: 'pending' });
  }
}

const TournamentManager = new TournamentManagerClass();
module.exports = { TournamentManager };
