# Graph Report - GharKoHisaab  (2026-07-06)

## Corpus Check
- 42 files · ~40,993 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 274 nodes · 487 edges · 18 communities (13 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4b152d9f`
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
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_graphify|graphify.md]]
- [[_COMMUNITY_graphify|graphify.md]]

## God Nodes (most connected - your core abstractions)
1. `getDrizzleDB()` - 38 edges
2. `getDB()` - 17 edges
3. `NepaliDate` - 12 edges
4. `expo` - 11 edges
5. `WebSqliteExecuteResult` - 11 edges
6. `initConnection()` - 11 edges
7. `WebSqliteStatement` - 10 edges
8. `WebSqliteDb` - 10 edges
9. `useInvoiceController()` - 10 edges
10. `COLORS` - 9 edges

## Surprising Connections (you probably didn't know these)
- `getCheckoutSettlement()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `InvoiceSection()` --calls--> `useInvoiceController()`  [EXTRACTED]
  src/features/invoice/InvoiceSection.tsx → src/features/invoice/InvoiceController.ts
- `initAgreementSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/agreement/AgreementModel.ts → src/database/connection.ts
- `initCheckoutSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `initInvoiceSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/invoice/InvoiceModel.ts → src/database/connection.ts

## Import Cycles
- None detected.

## Communities (18 total, 5 thin omitted)

### Community 0 - "Database Schema Definitions"
Cohesion: 0.07
Nodes (17): App(), SignaturePadProps, styles, COLORS, AgreementModalProps, styles, CheckoutModalProps, styles (+9 more)

### Community 1 - "SQLite Database Connection"
Cohesion: 0.13
Nodes (11): getTable(), mapToDrizzleFormat(), parseDeleteParams(), parseInsertParams(), parseSelectColumns(), parseSelectParams(), parseUpdateParams(), saveTable() (+3 more)

### Community 3 - "UI Components & Invoice View"
Cohesion: 0.08
Nodes (23): devDependencies, drizzle-kit, jest, jest-expo, react-test-renderer, @testing-library/react-native, @types/jest, @types/react (+15 more)

### Community 4 - "Expo Mobile Config"
Cohesion: 0.13
Nodes (23): checkoutSettlements, houses, roomPostings, rooms, tenancies, tenancyAgreements, tenants, AgreementControllerArgs (+15 more)

### Community 5 - "Property Management & Dashboard"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 6 - "Marketplace & Room Listings"
Cohesion: 0.13
Nodes (15): dependencies, drizzle-orm, expo, expo-asset, expo-crypto, expo-image-picker, expo-sqlite, expo-status-bar (+7 more)

### Community 7 - "Tenant Onboarding Features"
Cohesion: 0.20
Nodes (23): getDB(), getDrizzleDB(), initConnection(), useListingController(), useMarketplaceController(), addRoomPosting(), deleteRoomPosting(), getAllPublicPostings() (+15 more)

### Community 8 - "Bikram Sambat Date Converters"
Cohesion: 0.36
Nodes (9): invoices, payments, usePaymentController(), addPayment(), getPaymentsForInvoice(), getTotalPaidForInvoice(), initPaymentSchema(), Payment (+1 more)

### Community 9 - "Web SQL Query Driver"
Cohesion: 0.10
Nodes (20): 💬 Community Verification & Profiles, For App Users, For Non-App Users, 🚀 Getting Started, GharKoHisaab (घरको हिसाब) 🏡📄, 📌 Highlights, Installation, 🎛️ Intelligent Billing & Meter Calculations (+12 more)

### Community 11 - "TypeScript Configuration"
Cohesion: 0.12
Nodes (17): meterReadings, getCycleDates(), getSafeNepaliDate(), useCheckoutController(), addCheckoutSettlement(), terminateTenancy(), useInvoiceController(), addInvoice() (+9 more)

### Community 12 - "Jest Test Setup"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, types, extends, include

## Knowledge Gaps
- **88 isolated node(s):** `store`, `AgreementModalProps`, `styles`, `CheckoutModalProps`, `styles` (+83 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDrizzleDB()` connect `Tenant Onboarding Features` to `Bikram Sambat Date Converters`, `SQLite Database Connection`, `TypeScript Configuration`, `Expo Mobile Config`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `WebSqliteExecuteResult` connect `Developer Tooling & Testing` to `SQLite Database Connection`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `store`, `AgreementModalProps`, `styles` to the rest of the system?**
  _88 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Database Schema Definitions` be split into smaller, more focused modules?**
  _Cohesion score 0.07357357357357357 - nodes in this community are weakly interconnected._
- **Should `SQLite Database Connection` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `UI Components & Invoice View` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Expo Mobile Config` be split into smaller, more focused modules?**
  _Cohesion score 0.13054187192118227 - nodes in this community are weakly interconnected._