# GharKoHisaab (घरको हिसाब) 🏡📄

**GharKoHisaab** is a premium, offline-first mobile checkbook and calculator application tailored specifically for the rental ecosystem in Kathmandu, Nepal. It simplifies property management, room billing, utility calculations (like sub-metered electricity), and rent ledger tracking for both landlords (housekeepers) and tenants.

---

## ✨ Key Features

### 1. 🎛️ Intelligent Billing & Meter Calculations
*   **Automatic Sub-Meter Math:** Input current and previous electricity sub-meter readings, and the app automatically calculates the total based on custom rates (e.g., Rs. 10 - 15/unit).
*   **Flexible Utilities:** Supports flat-rate or split bills for community water, waste management, and internet.
*   **Automated Scheduling:** Invoice notifications trigger automatically on the monthly anniversary of a tenant's tenancy start date.

### 2. 🔒 Secure Cash Receipts (Double-Confirmation Flow)
To eliminate disputes over cash rent payments:
*   **For app users:** The housekeeper logs a cash transaction, prompting the tenant to approve it using their secure app PIN or fingerprint signature.
*   **For non-app users:** The tenant signs physically on the housekeeper's screen, and the app validates the receipt by sending a secure SMS OTP to the tenant's phone.
*   Once confirmed, receipts are locked as **immutable accounting records** to prevent retrospective editing or fraud.

### 3. 📷 Secure Document Capture
*   Directly capture or upload tenant government IDs (e.g., Citizenship/Nagarikta, Driving Licenses) and digital wallet payment receipts (e.g., screenshots of eSewa, Khalti, or FonePay transactions).

### 4. 💬 Community Verification & Profiles
*   **Tenant Reviews:** Landlords can rate and comment on tenant behavior, helping keep the renting ecosystem transparent.
*   **Property Reviews:** Tenants can leave public feedback on properties and landlord responsiveness, helping future renters make informed decisions.
*   Reviews are safeguarded by requiring a verified, active, or past tenancy agreement.

### 5. 📣 Public Room Postings (Posting Vacant Rooms)
*   **Post Publicly:** Housekeepers can flag any vacant room as "Post Publicly" (सार्वजनिक विज्ञापन) to list it on a public search feed.
*   **Search and Discover:** Prospective tenants in Kathmandu can query and discover vacant rooms, complete with rent, location, and owner contact details.

---

## 🛠️ Tech Stack

*   **Frontend:** React Native (Expo SDK 57)
*   **Engine:** Hermes JavaScript Engine (optimized for memory efficiency on budget Android devices)
*   **Language:** TypeScript
*   **Local Database:** SQLite / WatermelonDB (Offline-first local cache)
*   **Backend & Sync Engine:** Supabase (PostgreSQL with RLS policy security)
*   **Styling Theme:** Warm Neutrals (Slate Blue primary, Forest Green/Terracotta accents, Soft Cream backgrounds)

---

## 📂 Directory Structure

```
GharKoHisaab/
├── assets/                  # Icons, splash screen, and app assets
├── src/
│   ├── components/          # Shared atom UI elements (Button, Input, Card, Text)
│   ├── constants/           # Styling tokens, colors, themes, layout sizes
│   ├── database/            # SQLite schema configuration and migrations
│   ├── features/            # Feature-sliced modules (Auth, Property, Billing, Reviews)
│   ├── hooks/               # Custom React hooks (useCamera, useSync, etc.)
│   ├── navigation/          # React Navigation setup
│   ├── services/            # Supabase and SMS API connection wrappers
│   └── utils/               # Billing arithmetic, date utilities, conversion helpers
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
├── index.ts                 # Main app entrypoint
└── tsconfig.json            # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and the Expo CLI installed on your development machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/trvst-svg/GharKoHisaab.git
   cd GharKoHisaab
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the Metro bundler to run the application:
```bash
npm start
```

*   Press **a** to run on an Android emulator/device.
*   Press **i** to run on an iOS simulator/device.
*   Press **w** to run on a web browser.
