# Graph Report - GharKoHisaab  (2026-07-06)

## Corpus Check
- 44 files · ~42,519 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 286 nodes · 586 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `986f7e2a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
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
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_graphify|graphify.md]]

## God Nodes (most connected - your core abstractions)
1. `getDrizzleDB()` - 45 edges
2. `getDB()` - 19 edges
3. `initConnection()` - 13 edges
4. `NepaliDate` - 12 edges
5. `expo` - 11 edges
6. `WebSqliteExecuteResult` - 11 edges
7. `WebSqliteStatement` - 10 edges
8. `WebSqliteDb` - 10 edges
9. `useInvoiceController()` - 10 edges
10. `COLORS` - 9 edges

## Surprising Connections (you probably didn't know these)
- `TenantScreen()` --references--> `react`  [EXTRACTED]
  src/features/tenant/TenantScreen.tsx → package.json
- `getCheckoutSettlement()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `initInvoiceSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/invoice/InvoiceModel.ts → src/database/connection.ts
- `initPaymentSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/payment/PaymentModel.ts → src/database/connection.ts
- `initPostingSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/postings/PostingModel.ts → src/database/connection.ts

## Import Cycles
- None detected.

## Communities (17 total, 4 thin omitted)

### Community 1 - "SQLite Database Connection"
Cohesion: 0.13
Nodes (11): getTable(), mapToDrizzleFormat(), parseDeleteParams(), parseInsertParams(), parseSelectColumns(), parseSelectParams(), parseUpdateParams(), saveTable() (+3 more)

### Community 2 - "Production Dependencies"
Cohesion: 0.21
Nodes (14): App(), getDrizzleDB(), usePropertyController(), addHouse(), addRoom(), deleteRoom(), getHouses(), getRoomsForHouse() (+6 more)

### Community 3 - "UI Components & Invoice View"
Cohesion: 0.08
Nodes (23): devDependencies, drizzle-kit, jest, jest-expo, react-test-renderer, @testing-library/react-native, @types/jest, @types/react (+15 more)

### Community 4 - "Expo Mobile Config"
Cohesion: 0.11
Nodes (35): getDB(), initConnection(), store, checkoutSettlements, invoices, meterReadings, payments, propertyReviews (+27 more)

### Community 5 - "Property Management & Dashboard"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 6 - "Marketplace & Room Listings"
Cohesion: 0.14
Nodes (14): dependencies, drizzle-orm, expo, expo-asset, expo-crypto, expo-image-picker, expo-sqlite, expo-status-bar (+6 more)

### Community 7 - "Tenant Onboarding Features"
Cohesion: 0.14
Nodes (18): react, houses, roomPostings, MarketplaceFeed(), styles, useListingController(), useMarketplaceController(), addRoomPosting() (+10 more)

### Community 8 - "Bikram Sambat Date Converters"
Cohesion: 0.15
Nodes (17): SignaturePadProps, styles, COLORS, useAgreementController(), AgreementModal(), AgreementModalProps, styles, usePaymentController() (+9 more)

### Community 9 - "Web SQL Query Driver"
Cohesion: 0.10
Nodes (20): 💬 Community Verification & Profiles, For App Users, For Non-App Users, 🚀 Getting Started, GharKoHisaab (घरको हिसाब) 🏡📄, 📌 Highlights, Installation, 🎛️ Intelligent Billing & Meter Calculations (+12 more)

### Community 11 - "TypeScript Configuration"
Cohesion: 0.09
Nodes (23): getCycleDates(), getSafeNepaliDate(), useCheckoutController(), CheckoutModal(), CheckoutModalProps, styles, addCheckoutSettlement(), terminateTenancy() (+15 more)

### Community 12 - "Jest Test Setup"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, types, extends, include

## Knowledge Gaps
- **90 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+85 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TenantScreen()` connect `Tenant Onboarding Features` to `Expo Mobile Config`?**
  _High betweenness centrality (0.190) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Marketplace & Room Listings` to `UI Components & Invoice View`, `Tenant Onboarding Features`?**
  _High betweenness centrality (0.186) - this node is a cross-community bridge._
- **Why does `react` connect `Tenant Onboarding Features` to `Marketplace & Room Listings`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _90 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SQLite Database Connection` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `UI Components & Invoice View` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Expo Mobile Config` be split into smaller, more focused modules?**
  _Cohesion score 0.11416490486257928 - nodes in this community are weakly interconnected._