# GharKoHisaab (घरको हिसाब) 🏡📄

**GharKoHisaab** is a premium, offline-first mobile checkbook and calculator application tailored specifically for the rental ecosystem in Kathmandu, Nepal. It simplifies property management, room billing, utility calculations (such as sub-metered electricity), and rent ledger tracking for both landlords (housekeepers) and tenants.

---

# ✨ Key Features

## 🎛️ Intelligent Billing & Meter Calculations

- **Automatic Sub-Meter Math**
  - Input current and previous electricity sub-meter readings.
  - The app automatically calculates electricity usage using custom rates (e.g. Rs. 10–15 per unit).

- **Flexible Utilities**
  - Supports flat-rate or shared bills for:
    - Community water
    - Waste management
    - Internet

- **Bikram Sambat Scheduling**
  - Invoice reminders are generated automatically on the monthly anniversary of a tenant's tenancy start date using the Bikram Sambat (B.S.) calendar.

---

## 🔒 Secure Cash Receipts (Double Confirmation Flow)

To eliminate disputes over cash rent payments:

### For App Users

1. The landlord records a cash payment.
2. The tenant confirms it using:
   - PIN
   - Fingerprint authentication

### For Non-App Users

1. The tenant signs directly on the landlord's phone.
2. The app sends an SMS OTP to the tenant's registered phone number.
3. After OTP verification, the receipt becomes valid.

✅ Once confirmed, receipts become **immutable accounting records**, preventing edits or fraud.

---

## 📷 Secure Document Capture

Store important tenant documents securely.

Supported documents include:

- Citizenship (नागरिकता)
- Driving License
- Passport
- eSewa payment screenshots
- Khalti payment screenshots
- FonePay receipts

---

## 💬 Community Verification & Profiles

### Tenant Reviews

Landlords can:

- Rate tenants
- Leave behavioural feedback

This promotes a more transparent rental ecosystem.

### Property Reviews

Tenants can leave reviews about:

- Property condition
- Landlord responsiveness
- Overall rental experience

Reviews are only allowed after a verified active or completed tenancy.

---

## 📣 Public Room Listings

### Post Vacant Rooms

Landlords can mark any room as:

**"Post Publicly" (सार्वजनिक विज्ञापन)**

The room will appear in the public rental marketplace.

### Search Available Rooms

Prospective tenants can search vacant rooms across Kathmandu using filters such as:

- Location
- Rent
- Available rooms
- Owner contact details

---

# 🛠️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React Native (Expo SDK 57) |
| Language | TypeScript |
| JavaScript Engine | Hermes |
| Local Database | SQLite |
| Backend & Sync | Supabase (PostgreSQL + RLS) |
| Theme | Warm Neutrals (Slate Blue, Forest Green, Terracotta, Soft Cream) |

---

# 📂 Project Structure

```text
GharKoHisaab/
├── assets/
│   └── Icons, splash screen and static assets
│
├── src/
│   ├── constants/
│   │   └── colors.ts
│   │
│   ├── database/
│   │   └── connection.ts
│   │
│   ├── features/
│   │   ├── property/
│   │   │   ├── PropertyModel.ts
│   │   │   ├── PropertyController.ts
│   │   │   └── PropertyScreen.tsx
│   │   │
│   │   ├── tenant/
│   │   │   ├── TenantModel.ts
│   │   │   ├── TenantController.ts
│   │   │   └── TenantScreen.tsx
│   │   │
│   │   └── invoice/
│   │       ├── InvoiceModel.ts
│   │       ├── InvoiceController.ts
│   │       └── InvoiceSection.tsx
│   │
│   └── types/
│       └── nepali-date-converter.d.ts
│
├── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

---

# 🚀 Getting Started

## Prerequisites

Before running the application, ensure you have installed:

- Node.js
- npm
- Expo CLI

---

## Installation

Clone the repository:

```bash
git clone https://github.com/trvst-svg/GharKoHisaab.git
```

Move into the project directory:

```bash
cd GharKoHisaab
```

Install dependencies:

```bash
npm install
```

---

## Running the App

Start the Expo development server:

```bash
npm start
```

Then choose one of the following:

| Key | Action |
|------|--------|
| **a** | Run on Android |
| **i** | Run on iOS |
| **w** | Run on Web Browser |

---

## 📌 Highlights

- ✅ Offline-first architecture
- ✅ SQLite local database
- ✅ Secure Supabase synchronization
- ✅ Automatic rent & utility calculations
- ✅ Bikram Sambat billing reminders
- ✅ Immutable rent receipts
- ✅ Public room marketplace
- ✅ Tenant & landlord review system
- ✅ Secure KYC document storage