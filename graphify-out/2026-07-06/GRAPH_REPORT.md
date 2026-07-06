# Graph Report - GharKoHisaab  (2026-07-06)

## Corpus Check
- 45 files · ~43,535 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 306 nodes · 605 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a6cb72ee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_dbIntegration.test.ts|dbIntegration.test.ts]]
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
- [[_COMMUNITY_E2ECompleteUI.test.tsx|E2ECompleteUI.test.tsx]]
- [[_COMMUNITY_PaymentModel.ts|PaymentModel.ts]]

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
- `updateRoomStatus()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/property/PropertyModel.ts → src/database/connection.ts
- `CheckoutModal()` --calls--> `useCheckoutController()`  [EXTRACTED]
  src/features/checkout/CheckoutModal.tsx → src/features/checkout/CheckoutController.ts
- `InvoiceSection()` --calls--> `useInvoiceController()`  [EXTRACTED]
  src/features/invoice/InvoiceSection.tsx → src/features/invoice/InvoiceController.ts

## Import Cycles
- None detected.

## Communities (20 total, 4 thin omitted)

### Community 0 - "dbIntegration.test.ts"
Cohesion: 0.21
Nodes (19): initConnection(), store, checkoutSettlements, tenancies, useCheckoutController(), addCheckoutSettlement(), CheckoutSettlement, getCheckoutSettlement() (+11 more)

### Community 1 - "SQLite Database Connection"
Cohesion: 0.13
Nodes (11): getTable(), mapToDrizzleFormat(), parseDeleteParams(), parseInsertParams(), parseSelectColumns(), parseSelectParams(), parseUpdateParams(), saveTable() (+3 more)

### Community 2 - "Production Dependencies"
Cohesion: 0.19
Nodes (13): App(), usePropertyController(), addHouse(), addRoom(), deleteRoom(), getHouses(), getRoomsForHouse(), House (+5 more)

### Community 3 - "UI Components & Invoice View"
Cohesion: 0.08
Nodes (23): devDependencies, drizzle-kit, jest, jest-expo, react-test-renderer, @testing-library/react-native, @types/jest, @types/react (+15 more)

### Community 4 - "Expo Mobile Config"
Cohesion: 0.16
Nodes (27): getDB(), getDrizzleDB(), invoices, meterReadings, payments, propertyReviews, rooms, tenancyAgreements (+19 more)

### Community 5 - "Property Management & Dashboard"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 6 - "Marketplace & Room Listings"
Cohesion: 0.12
Nodes (16): dependencies, drizzle-orm, expo, expo-asset, expo-crypto, expo-image-picker, expo-sqlite, expo-status-bar (+8 more)

### Community 7 - "Tenant Onboarding Features"
Cohesion: 0.23
Nodes (14): houses, roomPostings, MarketplaceFeed(), styles, useListingController(), useMarketplaceController(), addRoomPosting(), deleteRoomPosting() (+6 more)

### Community 8 - "Bikram Sambat Date Converters"
Cohesion: 0.10
Nodes (21): SignaturePadProps, styles, COLORS, AgreementControllerArgs, useAgreementController(), AgreementModal(), AgreementModalProps, styles (+13 more)

### Community 9 - "Web SQL Query Driver"
Cohesion: 0.10
Nodes (20): 💬 Community Verification & Profiles, For App Users, For Non-App Users, 🚀 Getting Started, GharKoHisaab (घरको हिसाब) 🏡📄, 📌 Highlights, Installation, 🎛️ Intelligent Billing & Meter Calculations (+12 more)

### Community 11 - "TypeScript Configuration"
Cohesion: 0.15
Nodes (4): getCycleDates(), getSafeNepaliDate(), nepali-date-converter, NepaliDate

### Community 12 - "Jest Test Setup"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, types, extends, include

### Community 18 - "E2ECompleteUI.test.tsx"
Cohesion: 0.10
Nodes (19): mockConfirmAgreement, mockConfirmCheckout, mockConfirmPayment, mockCreateProperty, mockCreateRoom, mockDeleteRoom, mockOnboardTenant, mockSetAddress (+11 more)

### Community 19 - "PaymentModel.ts"
Cohesion: 0.50
Nodes (7): usePaymentController(), addPayment(), getPaymentsForInvoice(), getTotalPaidForInvoice(), initPaymentSchema(), Payment, syncInvoiceStatus()

## Knowledge Gaps
- **109 isolated node(s):** `mockCreateProperty`, `mockCreateRoom`, `mockDeleteRoom`, `mockSetAddress`, `mockSetRoomNumber` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TenantScreen()` connect `Marketplace & Room Listings` to `Bikram Sambat Date Converters`, `Expo Mobile Config`, `Tenant Onboarding Features`?**
  _High betweenness centrality (0.165) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Marketplace & Room Listings` to `UI Components & Invoice View`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **What connects `mockCreateProperty`, `mockCreateRoom`, `mockDeleteRoom` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SQLite Database Connection` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `UI Components & Invoice View` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Property Management & Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Marketplace & Room Listings` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._