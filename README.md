# @pipeworx/stratz

[STRATZ GraphQL](https://docs.stratz.com/) MCP — Dota 2 stats (heroes, matches, leagues, pro players). Free token at stratz.com/api.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Stratz data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
