# BakiBook

**Digital credit management for local shops** — track customer dues (baki), record credit purchases and payments, link customers to a self-service portal, and run reports from one place.

Built as a full-stack web application with separate experiences for **shopkeepers**, **customers**, and **platform admins**.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Running the app](#running-the-app)
- [Demo accounts](#demo-accounts)
- [User roles & routes](#user-roles--routes)
- [API overview](#api-overview)
- [Data models](#data-models)
- [Key concepts](#key-concepts)
- [Production deployment](#production-deployment)
- [Scripts reference](#scripts-reference)

---

## Overview

BakiBook replaces paper khata (credit ledgers) with a digital system tailored for Nepali shopkeepers:

- Shopkeepers register customers, add credit against products, and record payments.
- Customers can link their account, view ledgers, pay via eSewa/Khalti/bank transfer (with screenshot submission), and message the shop.
- Admins verify shops, manage users, and view platform analytics.

The app uses **JWT authentication**, **MongoDB** for persistence, **Socket.IO** for real-time notifications and messages, and optional **Cloudinary** for image uploads.

---

## Features

### Shopkeeper

| Area | Capabilities |
|------|----------------|
| **Dashboard** | Outstanding totals, recent activity, due reminders, aging breakdown |
| **Customers** | CRUD, QR codes, credit scores, link status, per-customer PDF report |
| **Credits & payments** | Add credit (line items), record payments, unified activity list (paginated) |
| **Payment submissions** | Review customer-submitted payments (accept / reject / report) |
| **Ledger** | Running balance, grouped **Paid** entries (credit + payment combined) |
| **Dues & reminders** | Outstanding/overdue lists, send due reminders |
| **Reports & PDF** | Daily/weekly/monthly summaries, credits, payments, products, activity, complete report |
| **Analytics** | Credit/payment trends, top customers |
| **Settings** | Full-page profile: account, shop details, security, preferences; geolocation for shop address |
| **Messages** | Real-time chat with linked customers |

### Customer portal

| Area | Capabilities |
|------|----------------|
| **Link shops** | Accept/reject shop link requests via email match |
| **Ledger** | View purchases and payments across linked shops |
| **Pay online** | Submit payment for full bill, single item, or custom amount (with screenshot) |
| **Transactions** | See unpaid items and pay per product |
| **Messages** | Chat with shopkeepers |
| **Profile** | Account and security settings |

### Admin

| Area | Capabilities |
|------|----------------|
| **Shops** | Verify or reject shopkeeper registrations |
| **Users** | Browse platform users |
| **Analytics** | Platform-wide charts (users, shops, trends) |
| **Legal** | Edit Terms & Conditions and data policy content |

### Cross-cutting

- Email/password and **Google OAuth** sign-in
- Email verification and password reset
- In-app notifications (real-time via Socket.IO)
- Legal pages (terms, data policy)
- Responsive shopkeeper, customer, and admin layouts

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 18, Vite 6, React Router 7, Lucide icons, Socket.IO client |
| **Backend** | Node.js, Express 4, MongoDB + Mongoose 8 |
| **Auth** | JWT, bcrypt, Google OAuth (`google-auth-library`) |
| **Realtime** | Socket.IO |
| **Email** | Nodemailer (Gmail app password) |
| **Uploads** | Multer + Cloudinary (fallback: local `/uploads`) |
| **Dev** | Concurrently, Nodemon |

---

## Project structure

```
BakiBook/
├── client/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/     # UI, layouts, shopkeeper/customer shells
│   │   ├── contexts/       # Socket, app dialogs
│   │   ├── hooks/          # useApi, useProfileSettings, pagination
│   │   ├── pages/          # Route pages (shopkeeper, customer, admin, auth)
│   │   ├── routes/         # AppRoutes.jsx
│   │   ├── services/       # API clients (/api/*)
│   │   └── utils/          # PDF export, formatting, location
│   └── vite.config.js      # Dev proxy → backend :5001
│
├── server/                 # Express API
│   ├── config/             # DB, email, Cloudinary, socket, upload
│   ├── controllers/        # Route handlers
│   ├── middleware/         # JWT protect, role guards
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── utils/              # Balance, ledger grouping, seed, formatters
│   └── index.js            # Entry point; serves client/dist in production
│
├── package.json            # Root scripts (dev, build, start)
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** Atlas cluster or local MongoDB instance
- **npm** 9+

Optional but recommended for full functionality:

- Gmail account with **App Password** (transactional email)
- **Google Cloud OAuth** client ID (Google sign-in)
- **Cloudinary** account (profile/shop/payment images)

---

## Installation

```bash
# Clone the repository, then from the project root:
npm run install:all
```

This installs dependencies for the root workspace, `server/`, and `client/`.

### Configure environment

```bash
# Backend
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, etc.

# Frontend
cp client/.env.example client/.env
# Set VITE_GOOGLE_CLIENT_ID if using Google login
```

---

## Environment variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5001`; Vite proxy expects this) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `CLIENT_URL` | Frontend origin for email links (e.g. `http://localhost:3000`) |
| `SERVER_URL` | Public API URL (e.g. `http://localhost:5001`) |
| `NODE_ENV` | `development` or `production` |
| `EMAIL_USER` | Gmail address for sending mail |
| `EMAIL_APP_PASSWORD` | Gmail app password |
| `EMAIL_FROM` | From header (e.g. `BakiBook <you@gmail.com>`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (must match client) |
| `CLOUDINARY_URL` | Optional; omit to store uploads locally |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_EMAILS` | Optional comma-separated extra admin emails |

See `server/.env.example` for a template.

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for `@react-oauth/google` |

---

## Running the app

### Development (recommended)

Runs API and Vite dev server together:

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001 |
| Health check | http://localhost:5001/api/health |

Vite proxies `/api`, `/socket.io`, and `/uploads` to the backend.

### Backend only

```bash
npm run dev --prefix server
```

### Frontend only

```bash
npm run dev --prefix client
```

### Production build

```bash
npm run build          # Builds client → client/dist
npm start              # Serves API + static client (NODE_ENV=production)
```

When `NODE_ENV=production`, Express serves `client/dist` and handles SPA routing.

### Seed demo data

Demo data is attempted automatically on server start. To force re-seed:

```bash
npm run seed --prefix server -- --force
```

---

## Demo accounts

After seeding (default password **`Demo@123`**):

| Role | Email | Password |
|------|-------|----------|
| Shopkeeper | `shopkeeper@bakibook.demo` | `Demo@123` |
| Customer | `ram@email.com` | `Demo@123` |

Admin login uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env` (defaults in `.env.example`: `admin@bakibook.com` / `admin123`).

---

## User roles & routes

| Role | Entry after login | Base paths |
|------|-------------------|------------|
| **Shopkeeper** | `/dashboard` | `/dashboard`, `/shop/*` |
| **Customer** | `/portal` (or `/portal/link-shops` if pending links) | `/portal/*` |
| **Admin** | `/admin` | `/admin/*` |

### Shopkeeper routes (high level)

- `/dashboard` — shopkeeper home (stats, quick actions)
- `/shop/customers` — customer list & profiles
- `/shop/transactions` — credits & payments activity
- `/shop/payment-submissions` — review customer payments
- `/shop/ledger/:customerId` — customer ledger
- `/shop/reports` — reports & PDF export
- `/shop/settings` — account & shop profile

### Customer routes

- `/portal` — dashboard
- `/portal/link-shops` — pending link requests
- `/portal/shops` — linked shops
- `/portal/transactions` — pay for items or full bills
- `/portal/ledger` — combined ledger
- `/portal/payments` — payment history
- `/portal/profile` — settings

Route definitions: `client/src/routes/AppRoutes.jsx`

---

## API overview

Base URL: `/api`

| Prefix | Purpose |
|--------|---------|
| `/auth` | Register, login, Google auth, profile, email verify, password reset |
| `/customers` | Shopkeeper customer CRUD |
| `/transactions` | Credit (purchase) records |
| `/payments` | Payment records |
| `/payment-submissions` | Shopkeeper review of customer submissions |
| `/portal` | Customer portal data & submit payment |
| `/ledger` | Ledgers, dues, reminders, notifications |
| `/shop` | Dashboard, reports, analytics, activity |
| `/shared/:customerId` | Shared credit account (shopkeeper + customer) |
| `/paid-entries` | Archive/hide grouped paid ledger rows |
| `/links` | Customer–shop linking |
| `/messages` | Conversations & chat |
| `/admin` | Platform admin |
| `/upload` | Image uploads |
| `/geocode` | Reverse geocode for shop location |
| `/legal` | Terms & policy documents |

All protected routes expect:

```
Authorization: Bearer <jwt_token>
```

Token is stored in `localStorage` under `bakibook_token`.

---

## Data models

| Model | Purpose |
|-------|---------|
| `User` | Shopkeeper or customer account; shop profile & verification |
| `Customer` | Shopkeeper’s customer record; balance, link status, QR code |
| `Transaction` | Credit purchase (items, total, note) |
| `Payment` | Payment received; may link to transaction/item |
| `PaymentSubmission` | Customer-submitted payment awaiting review |
| `Notification` | In-app alerts |
| `Message` | Chat messages between shopkeeper and customer |
| `LegalDocument` | CMS-style legal content |

Schemas: `server/models/`

---

## Key concepts

### Credit & balance

- Adding **credit** increases a customer’s `balance` (amount owed).
- Recording **payment** decreases balance (via `server/utils/customerBalance.js`).
- **Credit score** is computed from payment behaviour and outstanding age.

### Product-linked payments

Payments can target:

- **Full transaction** (`payType: transaction`)
- **Single line item** (`payType: item`)
- **Custom amount** (`payType: custom` / manual shopkeeper entry)

When a product-linked payment is completed, the ledger shows one **Paid** row combining credit and payment details.

### Ledger visibility (independent per side)

- **Customer archive** — hides a paid entry from the customer view only (`customerArchived` on `Payment`).
- **Shopkeeper remove** — hides from shopkeeper view only (`shopkeeperHidden`).

Underlying records and balances are unchanged.

### Shop verification

Shopkeepers submit shop details in Settings. Admins approve or reject via `/admin/shops`. Status: `incomplete` → `pending` → `verified` / `rejected`.

### Customer linking

Shopkeepers add customers with an email. Customers sign up with the same email and accept the link at `/portal/link-shops`. Once linked, both sides share the same ledger via `/api/shared/:customerId`.

### PDF reports

- **Shop reports** — browser print dialog → Save as PDF (`client/src/utils/shopReportPdf.js`).
- **Customer report** — full per-customer history PDF from customer profile or ledger pages.

---

## Production deployment

1. Set `NODE_ENV=production` on the server.
2. Set `CLIENT_URL` and `SERVER_URL` to your production domains.
3. Build the client: `npm run build`.
4. Start the server: `npm start` (serves API + static frontend on `PORT`).
5. Use HTTPS in production; configure CORS if frontend and API are on different origins.
6. Ensure MongoDB Atlas network access allows your server IP.

---

## Scripts reference

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all dependencies |
| `npm run dev` | Start server + client in development |
| `npm run build` | Build client for production |
| `npm start` | Start production server |
| `npm run dev --prefix server` | API only (nodemon) |
| `npm run dev --prefix client` | Vite dev server only |
| `npm run seed --prefix server -- --force` | Re-seed demo data |

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| API connection failed | Server running on `5001`; `MONGODB_URI` valid |
| Google login fails | `GOOGLE_CLIENT_ID` matches in server & client `.env` |
| Emails not sending | Gmail app password; `EMAIL_*` vars set |
| Images not uploading | `CLOUDINARY_URL` or local `server/uploads/` writable |
| Port in use | Change `PORT` in `server/.env` and update `vite.config.js` proxy target |

---

## Mobile app (Android & iOS)

A React Native + Expo app lives in `mobile/`. **Google Play publishing:** see [mobile/GOOGLE_PLAY.md](mobile/GOOGLE_PLAY.md).

```bash
npm run install:mobile
cp mobile/.env.example mobile/.env   # set EXPO_PUBLIC_API_URL to your LAN IP
npm run dev:full                   # API + Expo together
```

See [mobile/README.md](mobile/README.md) for device setup and demo logins.

---

This project was developed as a Final Year Project. All rights reserved by the author unless otherwise stated.

---

## Author

**BakiBook** — Digital Credit Management System  
London Metropolitan University · Final Year Project
