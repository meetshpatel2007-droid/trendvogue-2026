# 👗 TREND VOGUE — Full-Stack Premium Clothing E-Commerce Platform

A production-grade, full-stack online fashion store and back-office administrative platform built with **Next.js (App Router)**, **TypeScript**, **Plain PostgreSQL**, **Prisma ORM**, **Zustand**, **GSAP**, and **Framer Motion**.

---

## 🌟 App Flow & Role-Based Access Control

```
1. Cinematic Intro (GSAP 3D reveal, shutter wipe, 1x per session)
        ↓
2. Animated Landing Page (Publicly browsable storefront for all visitors)
        ↓
3. Login / Register Screen (/login & /register)
   - New user → Register → account created with role: USER
   - Existing user / Admin → Login with email + password
        ↓
4. Role Check on Successful Login
   ┌───────────────────────────────────┬────────────────────────────────────┐
   │ role === "ADMIN"                  │ role === "USER"                    │
   │ → Redirect to /admin              │ → Redirect to / (Main Storefront   │
   │   (Executive Back-Office CMS)     │   Shopping & Customer Portal)      │
   └───────────────────────────────────┴────────────────────────────────────┘
```

### Route Guards & Middleware
- `/admin/*`: Strictly guarded. Only accounts with `role: ADMIN` can access. Unauthenticated users are redirected to `/login?redirect=/admin`. Logged-in `USER` role is redirected to `/`.
- `/cart`, `/checkout`, `/orders`, `/wishlist`, `/profile`: Guarded for authenticated accounts (`USER` or `ADMIN`).

---

## 🔐 Seeded Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `Meet2026@gmail.com` | `Meet@@2026` | Full Back-Office CMS (`/admin`), inventory CRUD, fulfillment, users, reports |
| **Customer** | `user@trendvogue.com` | `User@12345` | Storefront shopping (`/`), cart, wishlist, checkout, live order tracking |
| **Self-Registered** | *Any email* | *Your password* | Auto-assigned `role: USER` with full customer shopping privileges |

> ℹ️ The admin account is seeded via `frontend/prisma/seed.ts` using `bcrypt.hash("Meet@@2026", 10)`. The login authentication runs through the exact same `/api/auth/login` endpoint with zero hardcoded credentials.

---

## 📁 Repository Structure

```
TrendVogue/
├── docker-compose.yml            # Local standalone PostgreSQL 15 database service
├── frontend/                     # Next.js App Router application (UI + API, single deployable)
│   ├── prisma/
│   │   ├── schema.prisma         # Relational PostgreSQL database schema
│   │   └── seed.ts               # Seeder for 20 products, categories & Meet2026@gmail.com
│   ├── src/
│   │   ├── app/
│   │   │   ├── (site)/           # Customer storefront routes (/, /shop, /product, /cart, /checkout, /orders, /profile, /wishlist)
│   │   │   ├── (auth)/           # Authentication (login, register, forgot-password, reset-password)
│   │   │   ├── (admin)/admin/    # Administrative back-office CMS (dashboard, products, orders, categories, users, reviews, reports)
│   │   │   └── api/              # Secure REST API route handlers
│   │   ├── components/           # UI components, GSAP intro, cart drawer, delivery tracker
│   │   ├── store/                # Zustand stores (auth, cart, wishlist, theme)
│   │   ├── lib/                  # Auth utilities, API response wrappers
│   │   ├── server/               # Server-only code used by API routes & middleware
│   │   │   ├── lib/              # Prisma singleton, JWT, bcrypt, delivery estimation
│   │   │   └── schemas/          # Zod validation schemas
│   │   └── styles/globals.css    # AMOLED Dark & Light design system
│   ├── package.json
│   └── next.config.js
│
└── demo/                         # Standalone interactive live demo viewer
    ├── index.html                # Full client-side simulation with GSAP, confetti, cart, checkout, & admin CMS
    └── server.ps1                # Native Windows HTTP server serving on http://localhost:3000
```

---

## 🚀 Setup & Execution Guide

### 1. Start Local PostgreSQL Database
```bash
docker compose up -d
```

### 2. Install Dependencies & Seed Database
```bash
cd frontend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 3. Launch Development Server
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌐 Instant Local Preview (Without Node.js Installed)

You can run the interactive demo immediately on your computer:
1. Open your browser and visit: **`http://localhost:3000`** (or open [`demo/index.html`](file:///c:/SE%20PROJECT/TrendVogue/demo/index.html)).
2. Sign in as Admin: `Meet2026@gmail.com` / `Meet@@2026` to test the `/admin` CMS.
3. Sign in as Customer: `user@trendvogue.com` / `User@12345` (or register a new account) to test the shopping storefront.
