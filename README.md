# mcp-stratz

STRATZ Dota 2 MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 965+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `graphql` | Send an arbitrary GraphQL query (with optional variables) directly to the STRATZ API at api.stratz.com/graphql. Use when no named tool covers the data you need. Requires a STRATZ Bearer token. |
| `hero_stats` | Fetch daily win-rate and pick-rate statistics for a Dota 2 hero by numeric hero_id, optionally filtered to a rank bracket (e.g. HERALD, ARCHON, LEGEND, DIVINE, IMMORTAL). Returns matchCount and winCount per day. |
| `player_matches` | Fetch a Dota 2 player's recent match history by Steam account id. Returns match id, duration, start time, Radiant win flag, heroId and K/D/A. Supports pagination via take/skip. |
| `player_heroes` | Fetch the top heroes played by a Dota 2 player (by Steam account id), ranked by match count — returns heroId, matchCount, and winCount for up to `take` heroes (default 20). |

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

Or connect to the full Pipeworx gateway for access to all 965+ data sources:

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

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
