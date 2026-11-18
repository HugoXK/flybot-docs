# Ask DeepWiki

DeepWiki indexes the [FlyBot repository](https://github.com/ThinkFlowLab/FlyBot) and answers with links back to the source. It is a third-party, model-generated index; this documentation and the repository are canonical.

## Two ways to ask

- **Use the corner widget.** The `Ask DeepWiki` button at the bottom-right opens a panel. **Chat** asks without leaving the page; **Open page** jumps to the DeepWiki page. The widget calls DeepWiki's public MCP endpoint directly — no key, no backend, and no question leaves the browser except to DeepWiki.
- **Use your agent.** Connect the same MCP server to Claude Code, Codex, OpenCode or DeepSeek Harness and ask from inside your agent.

## Ask from your agent (MCP)

DeepWiki exposes a free, no-authentication MCP server at `https://mcp.deepwiki.com/mcp` (streamable HTTP). The endpoint is CORS-enabled, which is why the corner widget can call it from a static page.

```sh
claude mcp add -s user -t http deepwiki https://mcp.deepwiki.com/mcp
```

For a client that reads JSON:

```json
{
  "mcpServers": {
    "deepwiki": { "url": "https://mcp.deepwiki.com/mcp" }
  }
}
```

Available tools: `ask_wiki_question`, `read_wiki_structure`, `read_wiki_contents`.

## Good questions to start with

- How does the Chief split a job across the Bot tree?
- How does a workflow run move across the board?
- How do I connect Bot Social and share one Bot?
- Where does a Bot keep memory and files between turns?

DeepWiki is best for "where is this in the code" and "how does this mechanism work". For a command, see [Getting started](getting-started.md); for the runtime boundary, see [Architecture](architecture.md).

## It can be wrong

DeepWiki is an external service. Verify a load-bearing answer against the source link it returns, or against these docs. If a page is missing or stale, open [the DeepWiki page](https://deepwiki.com/ThinkFlowLab/FlyBot) once to refresh its index.

## Index status

DeepWiki indexes `ThinkFlowLab/FlyBot`. The corner widget asks this repository directly.
