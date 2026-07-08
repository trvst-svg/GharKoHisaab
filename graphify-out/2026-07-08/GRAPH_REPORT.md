# Graph Report - GharKoHisaab  (2026-07-08)

## Corpus Check
- 44 files · ~44,932 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 292 nodes · 577 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9d88ca79`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_CheckoutController.ts|CheckoutController.ts]]
- [[_COMMUNITY_SQLite Database Connection|SQLite Database Connection]]
- [[_COMMUNITY_Production Dependencies|Production Dependencies]]
- [[_COMMUNITY_AgreementModel.ts|AgreementModel.ts]]
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
1. `getDrizzleDB()` - 44 edges
2. `getDB()` - 23 edges
3. `NepaliDate` - 12 edges
4. `expo` - 11 edges
5. `WebSqliteExecuteResult` - 11 edges
6. `initConnection()` - 11 edges
7. `WebSqliteStatement` - 10 edges
8. `WebSqliteDb` - 10 edges
9. `useInvoiceController()` - 10 edges
10. `useCheckoutController()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `TenantScreen()` --references--> `react`  [EXTRACTED]
  src/features/tenant/TenantScreen.tsx → package.json
- `getCheckoutSettlement()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `getReviewsForTenant()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/reviews/ReviewModel.ts → src/database/connection.ts
- `initAgreementSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/agreement/AgreementModel.ts → src/database/connection.ts
- `initInvoiceSchema()` --calls--> `getDB()`  [EXTRACTED]
  src/features/invoice/InvoiceModel.ts → src/database/connection.ts

## Import Cycles
- None detected.

## Communities (17 total, 4 thin omitted)

### Community 0 - "CheckoutController.ts"
Cohesion: 0.18
Nodes (16): App(), ThemeColorsType, ThemeName, THEMES, LanguageType, t(), TRANSLATIONS, ThemeContext (+8 more)

### Community 1 - "SQLite Database Connection"
Cohesion: 0.13
Nodes (11): getTable(), mapToDrizzleFormat(), parseDeleteParams(), parseInsertParams(), parseSelectColumns(), parseSelectParams(), parseUpdateParams(), saveTable() (+3 more)

### Community 2 - "Production Dependencies"
Cohesion: 0.40
Nodes (11): getDrizzleDB(), usePropertyController(), addHouse(), addRoom(), deleteRoom(), getHouses(), getRoomsForHouse(), House (+3 more)

### Community 3 - "AgreementModel.ts"
Cohesion: 0.17
Nodes (12): SignaturePadProps, styles, tenancyAgreements, AgreementControllerArgs, useAgreementController(), AgreementModal(), AgreementModalProps, styles (+4 more)

### Community 4 - "Expo Mobile Config"
Cohesion: 0.12
Nodes (26): checkoutSettlements, houses, invoices, meterReadings, payments, propertyReviews, roomPostings, rooms (+18 more)

### Community 5 - "Property Management & Dashboard"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 6 - "Marketplace & Room Listings"
Cohesion: 0.07
Nodes (28): dependencies, drizzle-orm, expo, expo-crypto, expo-image-picker, expo-local-authentication, expo-sqlite, expo-status-bar (+20 more)

### Community 7 - "Tenant Onboarding Features"
Cohesion: 0.17
Nodes (17): react, initConnection(), MarketplaceFeed(), styles, useListingController(), useMarketplaceController(), addRoomPosting(), deleteRoomPosting() (+9 more)

### Community 8 - "Bikram Sambat Date Converters"
Cohesion: 0.16
Nodes (18): AppLockOverlay(), AppLockOverlayProps, styles, getDB(), initCheckoutSchema(), usePaymentController(), PaymentModal(), PaymentModalProps (+10 more)

### Community 9 - "Web SQL Query Driver"
Cohesion: 0.10
Nodes (20): 💬 Community Verification & Profiles, For App Users, For Non-App Users, 🚀 Getting Started, GharKoHisaab (घरको हिसाब) 🏡📄, 📌 Highlights, Installation, 🎛️ Intelligent Billing & Meter Calculations (+12 more)

### Community 11 - "TypeScript Configuration"
Cohesion: 0.09
Nodes (23): getCycleDates(), getSafeNepaliDate(), useCheckoutController(), CheckoutModal(), CheckoutModalProps, styles, addCheckoutSettlement(), terminateTenancy() (+15 more)

### Community 12 - "Jest Test Setup"
Cohesion: 0.40
Nodes (4): compilerOptions, strict, extends, include

## Knowledge Gaps
- **83 isolated node(s):** `TRANSLATIONS`, `ThemeContext`, `styles`, `name`, `slug` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TenantScreen()` connect `Tenant Onboarding Features` to `Expo Mobile Config`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Marketplace & Room Listings` to `Tenant Onboarding Features`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Why does `react` connect `Tenant Onboarding Features` to `Marketplace & Room Listings`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **What connects `TRANSLATIONS`, `ThemeContext`, `styles` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SQLite Database Connection` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Expo Mobile Config` be split into smaller, more focused modules?**
  _Cohesion score 0.11827956989247312 - nodes in this community are weakly interconnected._
- **Should `Property Management & Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._