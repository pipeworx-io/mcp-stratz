interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * STRATZ Dota 2 MCP.
 */


const ENDPOINT = 'https://api.stratz.com/graphql';
const UA = 'STRATZ_API pipeworx-mcp-stratz/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'graphql',
    description: 'Send an arbitrary GraphQL query (with optional variables) directly to the STRATZ API at api.stratz.com/graphql. Use when no named tool covers the data you need. Requires a STRATZ Bearer token.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, variables: { type: 'object' } }, required: ['query'] },
  },
  { name: 'hero', description: 'Fetch a single Dota 2 hero\'s full detail by numeric hero id — display name, short name, roles, and base/gain stats (armor, strength, agility, intelligence, attack range, move speed, vision range).', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
  { name: 'heroes', description: 'Fetch the complete list of all Dota 2 heroes from STRATZ, returning each hero\'s numeric id, name, displayName, and shortName. No arguments required.', inputSchema: { type: 'object', properties: {} } },
  {
    name: 'hero_stats',
    description: 'Fetch daily win-rate and pick-rate statistics for a Dota 2 hero by numeric hero_id, optionally filtered to a rank bracket (e.g. HERALD, ARCHON, LEGEND, DIVINE, IMMORTAL). Returns matchCount and winCount per day.',
    inputSchema: { type: 'object', properties: { hero_id: { type: 'number' }, rank: { type: 'string' } }, required: ['hero_id'] },
  },
  { name: 'match', description: 'Fetch full details of a single Dota 2 match by numeric match id — duration, start time, Radiant/Dire teams, game mode, lobby type, and per-player stats (heroId, K/D/A, GPM, XPM, level).', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
  { name: 'player', description: 'Fetch a Dota 2 player\'s profile by Steam account id — Steam name, profile URL, avatar, total match count, and win count via STRATZ.', inputSchema: { type: 'object', properties: { steam_account_id: { type: 'number' } }, required: ['steam_account_id'] } },
  {
    name: 'player_matches',
    description: "Fetch a Dota 2 player's recent match history by Steam account id. Returns match id, duration, start time, Radiant win flag, heroId and K/D/A. Supports pagination via take/skip.",
    inputSchema: { type: 'object', properties: { steam_account_id: { type: 'number' }, take: { type: 'number' }, skip: { type: 'number' }, mode: { type: 'string' } }, required: ['steam_account_id'] },
  },
  {
    name: 'player_heroes',
    description: "Fetch the top heroes played by a Dota 2 player (by Steam account id), ranked by match count — returns heroId, matchCount, and winCount for up to `take` heroes (default 20).",
    inputSchema: { type: 'object', properties: { steam_account_id: { type: 'number' }, take: { type: 'number' } }, required: ['steam_account_id'] },
  },
  { name: 'live_matches', description: 'Fetch all currently live Dota 2 matches from STRATZ, returning matchId, radiantTeamId, direTeamId, and current game time. No arguments required.', inputSchema: { type: 'object', properties: {} } },
  { name: 'tournament', description: 'Fetch details for a single Dota 2 tournament (league) by numeric id — display name, description, tier, start/end dates, and prize pool.', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
  { name: 'tournaments', description: 'List Dota 2 tournaments from STRATZ ordered by start date (most recent first, up to 50). Pass only_premium=true to restrict to MAJOR and INTERNATIONAL tier events.', inputSchema: { type: 'object', properties: { only_premium: { type: 'boolean' } } } },
  { name: 'meta', description: 'Fetch current Dota 2 meta constants from STRATZ: the list of game versions (patches) with their id and name. No arguments required.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('STRATZ requires an API token. Set PLATFORM_STRATZ_KEY or pass ?_apiKey=… (free at https://stratz.com/api).');
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': UA, Authorization: `Bearer ${apiKey}` };
  const gql = async (query: string, variables: Record<string, unknown> = {}) => {
    const res = await fetch(ENDPOINT, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
    if (res.status === 401 || res.status === 403) throw new Error('STRATZ: invalid API token.');
    if (!res.ok) throw new Error(`STRATZ: ${res.status}`);
    const j = (await res.json()) as { data?: unknown; errors?: unknown };
    if (j.errors) throw new Error(`STRATZ GraphQL: ${JSON.stringify(j.errors)}`);
    return j.data;
  };
  const reqNum = (k: string, ex: string) => {
    const v = args[k];
    if (v == null || typeof v !== 'number') throw new Error(`Required argument "${k}" is missing. Pass a number like ${ex}.`);
    return v;
  };
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'graphql':
      return gql(reqStr('query', '"query { constants { gameMode { id name } } }"'), (args.variables as Record<string, unknown> | undefined) ?? {});
    case 'hero':
      return gql(
        `query Hero($id: Short!) { constants { hero(id: $id) { id name displayName shortName roles { roleId } stats { startingArmor strengthBase strengthGain agilityBase agilityGain intelligenceBase intelligenceGain attackRange attackRate attackSpeed moveSpeed visionDaytimeRange visionNighttimeRange } } } }`,
        { id: reqNum('id', '14') },
      );
    case 'heroes':
      return gql(`query Heroes { constants { heroes { id name displayName shortName } } }`);
    case 'hero_stats':
      return gql(
        `query HeroStats($id: Short!, $rank: [RankBracket!]) { heroStats { winDay(heroIds: [$id], bracketIds: $rank) { day matchCount winCount } } }`,
        { id: reqNum('hero_id', '14'), rank: args.rank ? [String(args.rank)] : null },
      );
    case 'match':
      return gql(
        `query Match($id: Long!) { match(id: $id) { id durationSeconds startDateTime didRadiantWin gameMode lobbyType radiantTeam { id name } direTeam { id name } players { steamAccountId heroId isRadiant kills deaths assists numLastHits goldPerMinute experiencePerMinute level } } }`,
        { id: reqNum('id', '7000000000') },
      );
    case 'player':
      return gql(
        `query Player($id: Long!) { player(steamAccountId: $id) { steamAccountId steamAccount { name profileUri avatar } matchCount winCount } }`,
        { id: reqNum('steam_account_id', '101270074') },
      );
    case 'player_matches':
      return gql(
        `query Matches($id: Long!, $take: Int, $skip: Int) { player(steamAccountId: $id) { matches(request: { take: $take, skip: $skip }) { id durationSeconds startDateTime didRadiantWin heroId kills deaths assists } } }`,
        { id: reqNum('steam_account_id', '101270074'), take: args.take ?? 10, skip: args.skip ?? 0 },
      );
    case 'player_heroes':
      return gql(
        `query Heroes($id: Long!, $take: Int) { player(steamAccountId: $id) { heroesPerformance(take: $take) { heroId matchCount winCount } } }`,
        { id: reqNum('steam_account_id', '101270074'), take: args.take ?? 20 },
      );
    case 'live_matches':
      return gql(`query Live { live { matches { matchId radiantTeamId direTeamId gameTime } } }`);
    case 'tournament':
      return gql(
        `query Tournament($id: Int!) { league(id: $id) { id displayName description tier startDateTime endDateTime prizePool } }`,
        { id: reqNum('id', '15728') },
      );
    case 'tournaments':
      return gql(
        `query Tournaments($premium: [LeagueTier!]) { leagues(request: { tiers: $premium, take: 50, orderBy: START_DATE_TIME_DESC }) { id displayName tier startDateTime endDateTime prizePool } }`,
        { premium: args.only_premium ? ['MAJOR', 'INTERNATIONAL'] : null },
      );
    case 'meta':
      return gql(`query Meta { constants { gameVersions { id name } } }`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
