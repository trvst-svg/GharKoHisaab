# Graph Report - /Users/suppu/GharKoHisaab  (2026-07-06)

## Corpus Check
- Corpus is ~36,205 words - fits in a single context window. You may not need a graph.

## Summary
- 229 nodes · 447 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Database Schema Definitions|Database Schema Definitions]]
- [[_COMMUNITY_SQLite Database Connection|SQLite Database Connection]]
- [[_COMMUNITY_Production Dependencies|Production Dependencies]]
- [[_COMMUNITY_UI Components & Invoice View|UI Components & Invoice View]]
- [[_COMMUNITY_Expo Mobile Config|Expo Mobile Config]]
- [[_COMMUNITY_Property Management & Dashboard|Property Management & Dashboard]]
- [[_COMMUNITY_Marketplace & Room Listings|Marketplace & Room Listings]]
- [[_COMMUNITY_Tenant Onboarding Features|Tenant Onboarding Features]]
- [[_COMMUNITY_Bikram Sambat Date Converters|Bikram Sambat Date Converters]]
- [[_COMMUNITY_Web SQL Query Driver|Web SQL Query Driver]]
- [[_COMMUNITY_Developer Tooling & Testing|Developer Tooling & Testing]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]

## God Nodes (most connected - your core abstractions)
1. `getDrizzleDB()` - 34 edges
2. `getDB()` - 15 edges
3. `NepaliDate` - 12 edges
4. `expo` - 11 edges
5. `WebSqliteExecuteResult` - 11 edges
6. `WebSqliteStatement` - 10 edges
7. `WebSqliteDb` - 10 edges
8. `initConnection()` - 10 edges
9. `useInvoiceController()` - 10 edges
10. `COLORS` - 8 edges

## Surprising Connections (you probably didn't know these)
- `TenantScreen()` --references--> `react`  [EXTRACTED]
  src/features/tenant/TenantScreen.tsx → package.json
- `getCheckoutSettlement()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `InvoiceSection()` --calls--> `useInvoiceController()`  [EXTRACTED]
  src/features/invoice/InvoiceSection.tsx → src/features/invoice/InvoiceController.ts
- `initCheckoutSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `initInvoiceSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/invoice/InvoiceModel.ts → src/database/connection.ts

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "Database Schema Definitions"
Cohesion: 0.12
Nodes (27): checkoutSettlements, houses, invoices, meterReadings, payments, roomPostings, rooms, tenancies (+19 more)

### Community 1 - "SQLite Database Connection"
Cohesion: 0.13
Nodes (11): getTable(), mapToDrizzleFormat(), parseDeleteParams(), parseInsertParams(), parseSelectColumns(), parseSelectParams(), parseUpdateParams(), saveTable() (+3 more)

### Community 2 - "Production Dependencies"
Cohesion: 0.07
Nodes (27): dependencies, drizzle-orm, expo, expo-asset, expo-crypto, expo-image-picker, expo-sqlite, expo-status-bar (+19 more)

### Community 3 - "UI Components & Invoice View"
Cohesion: 0.15
Nodes (16): SignaturePadProps, styles, COLORS, InvoiceSection(), InvoiceSectionProps, styles, usePaymentController(), PaymentModal() (+8 more)

### Community 4 - "Expo Mobile Config"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 5 - "Property Management & Dashboard"
Cohesion: 0.21
Nodes (14): App(), getDrizzleDB(), usePropertyController(), addHouse(), addRoom(), deleteRoom(), getHouses(), getRoomsForHouse() (+6 more)

### Community 6 - "Marketplace & Room Listings"
Cohesion: 0.25
Nodes (14): getDB(), initConnection(), MarketplaceFeed(), styles, useListingController(), useMarketplaceController(), addRoomPosting(), deleteRoomPosting() (+6 more)

### Community 7 - "Tenant Onboarding Features"
Cohesion: 0.23
Nodes (11): react, useTenantController(), addTenancy(), addTenant(), getActiveTenancyForRoom(), initTenantSchema(), Tenancy, Tenant (+3 more)

### Community 8 - "Bikram Sambat Date Converters"
Cohesion: 0.18
Nodes (4): getCycleDates(), getSafeNepaliDate(), nepali-date-converter, NepaliDate

### Community 10 - "Developer Tooling & Testing"
Cohesion: 0.20
Nodes (10): devDependencies, drizzle-kit, jest, jest-expo, react-test-renderer, @testing-library/react-native, @types/jest, @types/react (+2 more)

### Community 11 - "TypeScript Configuration"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, types, extends, include

## Knowledge Gaps
- **65 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TenantScreen()` connect `Tenant Onboarding Features` to `Marketplace & Room Listings`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Production Dependencies` to `Tenant Onboarding Features`?**
  _High betweenness centrality (0.250) - this node is a cross-community bridge._
- **Why does `react` connect `Tenant Onboarding Features` to `Production Dependencies`?**
  _High betweenness centrality (0.239) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Database Schema Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.11586452762923351 - nodes in this community are weakly interconnected._
- **Should `SQLite Database Connection` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Production Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._