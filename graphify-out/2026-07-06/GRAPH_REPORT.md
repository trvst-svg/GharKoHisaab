# Graph Report - GharKoHisaab  (2026-07-06)

## Corpus Check
- 36 files · ~36,205 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 51 nodes · 79 edges · 9 communities (2 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `51a9a06f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_connection.ts|connection.ts]]
- [[_COMMUNITY_getDB|getDB]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_.runAsync|.runAsync]]
- [[_COMMUNITY_WebSqliteStatement|WebSqliteStatement]]
- [[_COMMUNITY_PropertyScreen.tsx|PropertyScreen.tsx]]
- [[_COMMUNITY_.runSync|.runSync]]
- [[_COMMUNITY_WebSqliteDb|WebSqliteDb]]

## God Nodes (most connected - your core abstractions)
1. `WebSqliteExecuteResult` - 11 edges
2. `WebSqliteStatement` - 10 edges
3. `WebSqliteDb` - 10 edges
4. `toCamelCase()` - 6 edges
5. `getTable()` - 4 edges
6. `mapToDrizzleFormat()` - 4 edges
7. `parseSelectParams()` - 3 edges
8. `parseSelectColumns()` - 3 edges
9. `getDB()` - 3 edges
10. `initConnection()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (9 total, 7 thin omitted)

### Community 0 - "connection.ts"
Cohesion: 0.53
Nodes (3): mapToDrizzleFormat(), parseSelectParams(), toCamelCase()

### Community 1 - "getDB"
Cohesion: 0.32
Nodes (6): getDB(), getDrizzleDB(), initConnection(), parseDeleteParams(), parseInsertParams(), saveTable()

## Knowledge Gaps
- **3 isolated node(s):** `styles`, `graphify`, `Workflow: graphify`
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WebSqliteExecuteResult` connect `.runAsync` to `getDB`?**
  _High betweenness centrality (0.306) - this node is a cross-community bridge._
- **Why does `WebSqliteStatement` connect `WebSqliteStatement` to `getDB`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **Why does `WebSqliteDb` connect `WebSqliteDb` to `connection.ts`, `getDB`, `.runSync`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **What connects `styles`, `graphify`, `Workflow: graphify` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._