# Graph Report - GharKoHisaab  (2026-07-06)

## Corpus Check
- 39 files · ~39,272 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 242 nodes · 469 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6f9e518`
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
- [[_COMMUNITY_Jest Test Setup|Jest Test Setup]]

## God Nodes (most connected - your core abstractions)
1. `getDrizzleDB()` - 38 edges
2. `getDB()` - 17 edges
3. `NepaliDate` - 12 edges
4. `expo` - 11 edges
5. `WebSqliteExecuteResult` - 11 edges
6. `initConnection()` - 11 edges
7. `WebSqliteStatement` - 10 edges
8. `WebSqliteDb` - 10 edges
9. `useCheckoutController()` - 8 edges
10. `useInvoiceController()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `TenantScreen()` --references--> `react`  [EXTRACTED]
  src/features/tenant/TenantScreen.tsx → package.json
- `getCheckoutSettlement()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `CheckoutModal()` --calls--> `useCheckoutController()`  [EXTRACTED]
  src/features/checkout/CheckoutModal.tsx → src/features/checkout/CheckoutController.ts
- `MarketplaceFeed()` --calls--> `useMarketplaceController()`  [EXTRACTED]
  src/features/postings/MarketplaceFeed.tsx → src/features/postings/PostingController.ts
- `PropertyScreen()` --calls--> `usePropertyController()`  [EXTRACTED]
  src/features/property/PropertyScreen.tsx → src/features/property/PropertyController.ts

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "Database Schema Definitions"
Cohesion: 0.10
Nodes (15): App(), SignaturePadProps, styles, COLORS, AgreementModalProps, styles, CheckoutModal(), CheckoutModalProps (+7 more)

### Community 1 - "SQLite Database Connection"
Cohesion: 0.13
Nodes (11): getTable(), mapToDrizzleFormat(), parseDeleteParams(), parseInsertParams(), parseSelectColumns(), parseSelectParams(), parseUpdateParams(), saveTable() (+3 more)

### Community 2 - "Production Dependencies"
Cohesion: 0.13
Nodes (16): getCycleDates(), getSafeNepaliDate(), useCheckoutController(), addCheckoutSettlement(), terminateTenancy(), useInvoiceController(), addInvoice(), addMeterReading() (+8 more)

### Community 3 - "UI Components & Invoice View"
Cohesion: 0.08
Nodes (23): devDependencies, drizzle-kit, jest, jest-expo, react-test-renderer, @testing-library/react-native, @types/jest, @types/react (+15 more)

### Community 4 - "Expo Mobile Config"
Cohesion: 0.12
Nodes (24): checkoutSettlements, houses, meterReadings, roomPostings, rooms, tenancies, tenancyAgreements, tenants (+16 more)

### Community 5 - "Property Management & Dashboard"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 6 - "Marketplace & Room Listings"
Cohesion: 0.12
Nodes (16): dependencies, drizzle-orm, expo, expo-asset, expo-crypto, expo-image-picker, expo-sqlite, expo-status-bar (+8 more)

### Community 7 - "Tenant Onboarding Features"
Cohesion: 0.32
Nodes (12): getDB(), initConnection(), useListingController(), useMarketplaceController(), addRoomPosting(), deleteRoomPosting(), getAllPublicPostings(), getPostingForRoom() (+4 more)

### Community 8 - "Bikram Sambat Date Converters"
Cohesion: 0.40
Nodes (11): getDrizzleDB(), usePropertyController(), addHouse(), addRoom(), deleteRoom(), getHouses(), getRoomsForHouse(), House (+3 more)

### Community 9 - "Web SQL Query Driver"
Cohesion: 0.25
Nodes (4): InvoiceSectionProps, styles, PaymentModalProps, styles

### Community 11 - "TypeScript Configuration"
Cohesion: 0.36
Nodes (9): invoices, payments, usePaymentController(), addPayment(), getPaymentsForInvoice(), getTotalPaidForInvoice(), initPaymentSchema(), Payment (+1 more)

### Community 12 - "Jest Test Setup"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, types, extends, include

## Knowledge Gaps
- **68 isolated node(s):** `AgreementModalProps`, `styles`, `InvoiceSectionProps`, `styles`, `PaymentModalProps` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TenantScreen()` connect `Marketplace & Room Listings` to `Database Schema Definitions`, `Expo Mobile Config`, `Tenant Onboarding Features`?**
  _High betweenness centrality (0.246) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Marketplace & Room Listings` to `UI Components & Invoice View`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **What connects `AgreementModalProps`, `styles`, `InvoiceSectionProps` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Database Schema Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.09686609686609686 - nodes in this community are weakly interconnected._
- **Should `SQLite Database Connection` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Production Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.12873563218390804 - nodes in this community are weakly interconnected._
- **Should `UI Components & Invoice View` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._