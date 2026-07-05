# Graph Report - GharKoHisaab  (2026-07-06)

## Corpus Check
- 39 files · ~38,733 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 242 nodes · 453 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `17a589c5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_dependencies|dependencies]]

## God Nodes (most connected - your core abstractions)
1. `getDrizzleDB()` - 34 edges
2. `getDB()` - 15 edges
3. `NepaliDate` - 12 edges
4. `expo` - 11 edges
5. `WebSqliteExecuteResult` - 11 edges
6. `WebSqliteStatement` - 10 edges
7. `WebSqliteDb` - 10 edges
8. `useInvoiceController()` - 10 edges
9. `initConnection()` - 9 edges
10. `useCheckoutController()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `initTenantSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/tenant/TenantModel.ts → src/database/connection.ts
- `getCheckoutSettlement()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `addTenancy()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/tenant/TenantModel.ts → src/database/connection.ts
- `addTenant()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/tenant/TenantModel.ts → src/database/connection.ts
- `getActiveTenancyForRoom()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/tenant/TenantModel.ts → src/database/connection.ts

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "Database Schema Definitions"
Cohesion: 0.09
Nodes (22): getCycleDates(), getSafeNepaliDate(), useCheckoutController(), CheckoutModal(), CheckoutModalProps, styles, addCheckoutSettlement(), terminateTenancy() (+14 more)

### Community 1 - "SQLite Database Connection"
Cohesion: 0.13
Nodes (11): getTable(), mapToDrizzleFormat(), parseDeleteParams(), parseInsertParams(), parseSelectColumns(), parseSelectParams(), parseUpdateParams(), saveTable() (+3 more)

### Community 2 - "Production Dependencies"
Cohesion: 0.08
Nodes (23): devDependencies, drizzle-kit, jest, jest-expo, react-test-renderer, @testing-library/react-native, @types/jest, @types/react (+15 more)

### Community 3 - "UI Components & Invoice View"
Cohesion: 0.31
Nodes (10): usePaymentController(), PaymentModal(), PaymentModalProps, styles, addPayment(), getPaymentsForInvoice(), getTotalPaidForInvoice(), initPaymentSchema() (+2 more)

### Community 4 - "Expo Mobile Config"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 5 - "Property Management & Dashboard"
Cohesion: 0.40
Nodes (11): getDrizzleDB(), usePropertyController(), addHouse(), addRoom(), deleteRoom(), getHouses(), getRoomsForHouse(), House (+3 more)

### Community 6 - "Marketplace & Room Listings"
Cohesion: 0.32
Nodes (12): getDB(), initConnection(), useListingController(), useMarketplaceController(), addRoomPosting(), deleteRoomPosting(), getAllPublicPostings(), getPostingForRoom() (+4 more)

### Community 7 - "Tenant Onboarding Features"
Cohesion: 0.12
Nodes (19): checkoutSettlements, houses, invoices, meterReadings, payments, roomPostings, rooms, tenancies (+11 more)

### Community 8 - "Bikram Sambat Date Converters"
Cohesion: 0.19
Nodes (13): AgreementControllerArgs, useAgreementController(), AgreementModal(), AgreementModalProps, styles, Agreement, getAgreementForTenancy(), initAgreementSchema() (+5 more)

### Community 10 - "Developer Tooling & Testing"
Cohesion: 0.16
Nodes (8): App(), SignaturePadProps, styles, COLORS, MarketplaceFeed(), styles, PropertyScreen(), styles

### Community 11 - "TypeScript Configuration"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, types, extends, include

### Community 13 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, drizzle-orm, expo, expo-asset, expo-crypto, expo-image-picker, expo-sqlite, expo-status-bar (+7 more)

## Knowledge Gaps
- **71 isolated node(s):** `AgreementControllerArgs`, `AgreementModalProps`, `styles`, `TenantScreenProps`, `styles` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDrizzleDB()` connect `Property Management & Dashboard` to `Database Schema Definitions`, `SQLite Database Connection`, `UI Components & Invoice View`, `Marketplace & Room Listings`, `Tenant Onboarding Features`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `WebSqliteExecuteResult` connect `Web SQL Query Driver` to `SQLite Database Connection`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `AgreementControllerArgs`, `AgreementModalProps`, `styles` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Database Schema Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.09446693657219973 - nodes in this community are weakly interconnected._
- **Should `SQLite Database Connection` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Production Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Expo Mobile Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._