# BakiBook Mobile (React Native + Expo)

Cross-platform **Android** app for BakiBook — role-based UI for **shopkeepers** and **customers**, connected to the existing Node.js API. (iOS is not configured.)

## Architecture

```
React Native + Expo (mobile/)
        ↓
Node.js + Express API (server/)  — same backend as web
        ↓
MongoDB Atlas
```

Auth uses the existing **JWT API** (`/api/auth/login`, `/api/auth/register`). Firebase Phone OTP and FCM can be added in a later phase.

## Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on your phone, or Android Studio for emulators
- Backend running (`npm run dev` from project root)
- Phone and PC on the **same Wi‑Fi** (for physical device testing)

## Setup

```bash
# From project root — install mobile deps
npm run install:mobile

# Configure API URL (see below)
cp mobile/.env.example mobile/.env
```

### API URL

| Environment | `EXPO_PUBLIC_API_URL` |
|-------------|------------------------|
| Android emulator | `http://10.0.2.2:5001/api` |
| Physical device | `http://<YOUR_PC_LAN_IP>:5001/api` |

If unset, Expo uses your dev machine IP from Metro (works for many setups).

Find your LAN IP: `ipconfig` (Windows) → IPv4 Address.

## Run

```bash
# Terminal 1 — API + web (optional)
npm run dev

# Terminal 2 — mobile
npm run dev:mobile
```

Scan the QR code with Expo Go (Android).

| Command | Description |
|---------|-------------|
| `npm run dev:mobile` | Start Expo dev server |
| `npm run android --prefix mobile` | Open on Android emulator/device |

## Demo accounts

Same as web (after `npm run seed --prefix server -- --force`):

| Role | Email | Password |
|------|-------|----------|
| Shopkeeper | `shopkeeper@bakibook.demo` | `Demo@123` |
| Customer | `ram@email.com` | `Demo@123` |

## Screens

### Shopkeeper

- Splash, Login, Register
- Dashboard (outstanding, customers, payments, quick actions)
- Customer list (cards with View / Credit / Payment)
- Customer profile (transactions, payments, notes, QR)
- Add customer, add credit, record payment
- QR scanner → opens customer profile
- Reports (daily / weekly / monthly) + PDF export
- Settings

### Customer (same app, different tabs)

- My Due
- Ledger
- Payments
- Profile
- Link shops (pending invitations)

## Build for Google Play (Android)

**Full step-by-step guide:** [GOOGLE_PLAY.md](GOOGLE_PLAY.md)  
**Deploy API on Railway:** [../deploy/railway/DEPLOY_RAILWAY.md](../deploy/railway/DEPLOY_RAILWAY.md)

Quick path:

1. Deploy backend to **HTTPS** (required for real users).
2. Update `eas.json` with your API URL, or set an EAS secret:
   ```bash
   npx eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://api.yourdomain.com/api"
   ```
3. One-time setup:
   ```bash
   cd mobile
   npm install
   npx eas login
   npx eas init
   ```
4. Build signed AAB for Play Store:
   ```bash
   npm run build:android
   ```
5. Upload to [Google Play Console](https://play.google.com/console) (manual) or:
   ```bash
   npm run submit:android
   ```

| Item | Value |
|------|-------|
| Package name | `com.bakibook.app` |
| Build output | `.aab` (Android App Bundle) |
| Play Developer fee | $25 one-time |

## Project structure

```
mobile/
├── App.tsx
├── app.json
├── src/
│   ├── api/           # HTTP clients (mirrors web client)
│   ├── components/
│   ├── contexts/      # Auth
│   ├── navigation/
│   ├── screens/
│   │   ├── auth/
│   │   ├── shopkeeper/
│   │   └── customer/
│   ├── theme/
│   └── utils/
└── .env.example
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Network request failed | Check `EXPO_PUBLIC_API_URL`, backend on port 5001, same Wi‑Fi |
| Camera not working | Grant permission; use a real device for QR |
| Login works on web but not mobile | Use LAN IP, not `localhost`, on physical device |
