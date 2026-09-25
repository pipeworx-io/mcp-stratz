# @pipeworx/stratz

[STRATZ GraphQL](https://docs.stratz.com/) MCP — Dota 2 stats (heroes, matches, leagues, pro players). Free token at stratz.com/api.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Auth

- Platform: `PLATFORM_STRATZ_KEY`. BYO: `?_apiKey=…` (Bearer token).

## Tools

- `graphql(query, variables?)` — raw GraphQL passthrough (the most flexible escape hatch)
- `hero(id)` — hero detail (id is Dota 2 hero id)
- `heroes()` — all heroes
- `hero_stats(hero_id, rank?)` — win rate / pick rate by rank tier
- `match(id)` — single match
- `player(steam_account_id)` — player profile
- `player_matches(steam_account_id, take?, skip?)` — player's recent matches, one flat row each (this player's hero, K/D/A, GPM/XPM merged onto the match)
- `player_heroes(steam_account_id, take?)` — player's top heroes
- `live_matches()` — currently live matches
- `tournament(id)` — tournament detail
- `tournaments(only_premium?)` — list tournaments
- `meta()` — current Dota 2 patch + constants

## Notes

The GraphQL schema is large; `graphql(...)` lets you write any query against it. The named tools are convenience wrappers for common shapes.

Field names must match the STRATZ schema exactly — it rejects the first unknown field with `Cannot query field`. Common traps: per-player stats (`heroId`, `kills`, `numLastHits`, `goldPerMinute`) live on `match.players`, not on the match; game modes are `constants { gameModes }`; tournaments order by `FilterOrderBy` (`START_DATE_THEN_TIER`, `LAST_MATCH_TIME`, …). Introspect a type first when unsure: `{ __type(name: "MatchPlayerType") { fields { name } } }`.

Every named tool's query is validated against an introspected STRATZ schema (see the header of `src/index.ts` for the recipe).

## Data source

`https://api.stratz.com/graphql`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "stratz": {
      "url": "https://gateway.pipeworx.io/stratz/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/stratz/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/graphql`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "stratz": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-stratz"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-stratz
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Stratz data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
