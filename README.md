# @pipeworx/stratz

[STRATZ GraphQL](https://docs.stratz.com/) MCP — Dota 2 stats (heroes, matches, leagues, pro players). Free token at stratz.com/api.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Auth

- Platform: `PLATFORM_STRATZ_KEY`. BYO: `?_apiKey=…` (Bearer token).

## Tools

- `graphql(query, variables?)` — raw GraphQL passthrough (the most flexible escape hatch)
- `hero(id)` — hero detail (id is Dota 2 hero id)
- `heroes()` — all heroes
- `hero_stats(hero_id, rank?)` — win rate / pick rate by rank tier
- `match(id)` — single match
- `player(steam_account_id)` — player profile
- `player_matches(steam_account_id, take?, skip?, mode?)` — player's recent matches
- `player_heroes(steam_account_id, take?)` — player's top heroes
- `live_matches()` — currently live matches
- `tournament(id)` — tournament detail
- `tournaments(only_premium?)` — list tournaments
- `meta()` — current Dota 2 patch + constants

## Notes

The GraphQL schema is large; `graphql(...)` lets you write any query against it. The named tools are convenience wrappers for common shapes.

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

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

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
