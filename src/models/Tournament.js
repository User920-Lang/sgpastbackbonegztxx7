const { getMap } = require('../maps');

const TournamentStatus = { UPCOMING:0, REGISTRATION:1, IN_PROGRESS:2, FINISHED:3, CANCELLED:4, ACTIVE:6 };
const TournamentType   = { TESTING:'TestingTournament', CLASSIC:'ClassicTournament', RANKED:'RankedTournament' };
const PhaseType        = { SINGLE_ELIMINATION:'SingleEliminationBracket', ROUND_ROBIN:'RoundRobin' };
const UserStatus       = { NONE:0, INVITED:1, REGISTERED:2, ELIMINATED:3, WINNER:4 };

function createRound(id, maxLength = 30, winScore = 1) {
  return { id, maxLength, winScore };
}

function createPhase(overrides = {}) {
  return {
    id: 1,
    type: PhaseType.SINGLE_ELIMINATION,
    maxLoses: 1,
    maxTeams: 128,
    maxPlayers: 2,
    rounds: overrides.rounds || [1,2,3,4,5].map(i => createRound(i)),
    ...overrides,
  };
}

function createTournament(overrides = {}) {
  const now        = new Date();
  const startTime  = new Date(now.getTime() + 15 * 60 * 1000);
  const roundCount = parseInt(overrides.roundCount) || 5;
  const rounds     = Array.from({ length: roundCount }, (_, i) => createRound(i + 1));
  const mapName    = overrides.map || 'tile fall';
  const mapData    = getMap(mapName) || { name: mapName, id: 'level1_tile' };

  return {
    id:                  Date.now(),
    tournamentName:      overrides.tournamentName || 'Classic Tournament',
    description:         overrides.description || '',
    additionalDescription: '',
    imageUrl:            overrides.imageUrl || '',
    iconUrl:             overrides.iconUrl || '',
    sponsorImageUrl:     overrides.sponsorImageUrl || '',
    themeColor:          overrides.themeColor || '#FF0000',
    status:              TournamentStatus.ACTIVE,
    type:                TournamentType.CLASSIC,
    time:                startTime.toISOString(),
    currentPhaseId:      1,
    phaseCount:          1,
    partySize:           1,
    map:                 mapData.name,
    mapId:               mapData.id,
    roundCount,
    phases:              [createPhase({ rounds })],
    winner:              null,
    invite:              { status: UserStatus.INVITED, finalPlace: 0 },
    hasAllDataLoaded:    true,
    participants:        [],
    createdAt:           now.toISOString(),
    ...overrides,
  };
}

module.exports = { createTournament, createPhase, createRound, TournamentStatus, TournamentType, PhaseType, UserStatus };
