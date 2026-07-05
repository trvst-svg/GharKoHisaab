# Graph Report - .  (2026-07-06)

## Corpus Check
- Corpus is ~38,733 words - fits in a single context window. You may not need a graph.

## Summary
- 242 nodes · 486 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

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
- `TenantScreen()` --references--> `react`  [EXTRACTED]
  src/features/tenant/TenantScreen.tsx → package.json
- `getCheckoutSettlement()` --calls--> `getDrizzleDB()`  [EXTRACTED]
  src/features/checkout/CheckoutModel.ts → src/database/connection.ts
- `CheckoutModal()` --calls--> `useCheckoutController()`  [EXTRACTED]
  src/features/checkout/CheckoutModal.tsx → src/features/checkout/CheckoutController.ts
- `InvoiceSection()` --calls--> `useInvoiceController()`  [EXTRACTED]
  src/features/invoice/InvoiceSection.tsx → src/features/invoice/InvoiceController.ts
- `PaymentModal()` --calls--> `usePaymentController()`  [EXTRACTED]
  src/features/payment/PaymentModal.tsx → src/features/payment/PaymentController.ts

## Import Cycles
- None detected.

## Communities (14 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (19): App(), SignaturePadProps, styles, COLORS, CheckoutModal(), CheckoutModalProps, styles, InvoiceSection() (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (11): getTable(), mapToDrizzleFormat(), parseDeleteParams(), parseInsertParams(), parseSelectColumns(), parseSelectParams(), parseUpdateParams(), saveTable() (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (16): getCycleDates(), getSafeNepaliDate(), useCheckoutController(), addCheckoutSettlement(), terminateTenancy(), useInvoiceController(), addInvoice(), addMeterReading() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (23): devDependencies, drizzle-kit, jest, jest-expo, react-test-renderer, @testing-library/react-native, @types/jest, @types/react (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (17): checkoutSettlements, houses, meterReadings, roomPostings, rooms, tenancies, tenants, CheckoutSettlement (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (19): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (16): dependencies, drizzle-orm, expo, expo-asset, expo-crypto, expo-image-picker, expo-sqlite, expo-status-bar (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.32
Nodes (12): getDB(), initConnection(), useListingController(), useMarketplaceController(), addRoomPosting(), deleteRoomPosting(), getAllPublicPostings(), getPostingForRoom() (+4 more)

### Community 8 - "Community 8"
Cohesion: 0.40
Nodes (11): getDrizzleDB(), usePropertyController(), addHouse(), addRoom(), deleteRoom(), getHouses(), getRoomsForHouse(), House (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (10): tenancyAgreements, AgreementControllerArgs, useAgreementController(), AgreementModal(), AgreementModalProps, styles, Agreement, getAgreementForTenancy() (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.36
Nodes (9): invoices, payments, usePaymentController(), addPayment(), getPaymentsForInvoice(), getTotalPaidForInvoice(), initPaymentSchema(), Payment (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (5): compilerOptions, strict, types, extends, include

## Knowledge Gaps
- **68 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `TenantScreen()` connect `Community 6` to `Community 0`, `Community 4`, `Community 7`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 6` to `Community 3`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09247311827956989 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12873563218390804 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._