
## graphify

This project has a nodesify-graphify knowledge graph at .graphify/.

CRITICAL RULES:
- Always run graphify commands targeting `src/` (never the root `.`), to avoid indexing `dist/` build artifacts.
- If no `.graphify/graph.json` exists, run `nodesify-graphify run src` to build the graph.
- You are **FORBIDDEN** from using native search tools (Grep, Glob, Search, etc.) as your first step for discovery.
- You **MUST** read .graphify/graph_report.md before doing any file exploration.
- You **MUST** use `nodesify-graphify query "<question>"`, `nodesify-graphify path "<A>" "<B>"`, or `nodesify-graphify explain "<concept>"` via shell commands to locate files, components, and understand cross-module relationships.
- Only use native file reading/searching tools *after* you have queried the graph to find the exact files you need.
- After modifying code files in this session, run `nodesify-graphify update src` to keep the graph current. Then run `nodesify-graphify export --format html --out graph-viz.html` to regenerate the interactive visualization.
- Use `nodesify-graphify status` to check graph freshness before querying.
