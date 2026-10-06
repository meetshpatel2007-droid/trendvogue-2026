# Trend Vogue — Full-Stack Clothing E-Commerce Platform

Trend Vogue is a full-stack online fashion store with a customer storefront and an admin back-office. The whole application — UI, REST API, authentication and database access — is a **single Next.js (App Router) project** written in TypeScript, backed by **PostgreSQL** through the **Prisma ORM**.

> **Note for readers and AI assistants:** this README is the complete technical reference for the project. It is written so that a project report (PDF) can be produced from it without reading the source code. Every section states facts taken from the code; section 16 lists the known issues honestly, and section 18 suggests a report outline.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Objectives & Scope](#2-objectives--scope)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Database Design](#6-database-design)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Reference](#8-api-reference)
9. [Pages & User Interface](#9-pages--user-interface)
10. [Client State Management](#10-client-state-management)
11. [Core Business Logic](#11-core-business-logic)
12. [Validation Rules](#12-validation-rules)
13. [Design System](#13-design-system)
14. [Security Measures](#14-security-measures)
15. [Setup, Configuration & Deployment](#15-setup-configuration--deployment)
16. [Known Issues & Limitations](#16-known-issues--limitations)
17. [Future Enhancements](#17-future-enhancements)
18. [Suggested Report Outline](#18-suggested-report-outline)

---

## 1. Project Summary

| Item | Detail |
| :--- | :--- |
| Project name | Trend Vogue |
| Type | B2C e-commerce web application (clothing & beauty) |
| Target market | India (INR currency, 6-digit PIN codes, Indian mobile numbers, `en-IN` formatting) |
| Architecture | Monolithic full-stack Next.js app (frontend + backend in one codebase) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL 15 via Prisma ORM 5 |
| User roles | `USER` (customer) and `ADMIN` (store manager) |
| Product categories | Men, Women, Kids, Beauty |
| Payment methods | Cash on Delivery (COD) and a simulated online payment (`DUMMY_ONLINE`) |
| Codebase size | ≈13,000 lines across 81 TypeScript/TSX files (38 `.tsx`, 43 `.ts`) |
| Deployment target | Vercel (serverless) + any hosted PostgreSQL |
| Git remote | `https://github.com/meetshpatel2007-droid/trendvogue-2026.git` (branch `development`) |

**In one sentence:** customers browse and filter products, add them to a cart or wishlist, check out with a delivery address and receive a PIN-code-based delivery estimate, then track their order through five stages; admins manage products, categories, orders, users and reviews, and view sales analytics and CSV reports.

---

## 2. Objectives & Scope

### Objectives
1. Build a production-style online clothing store with a polished, animated UI.
2. Implement secure, role-based authentication without third-party auth providers.
3. Provide a complete order lifecycle: cart → checkout → order placement → status tracking → delivery → review.
4. Give administrators a back-office (CMS) for inventory, fulfillment, user moderation and reporting.
5. Keep the whole system deployable as one unit (one Next.js app, one database).

### In scope
- Customer registration, login, logout, password reset, profile and address management.
- Product catalogue with search, category, price, size and colour filters, sorting and pagination.
- Cart, wishlist, checkout with COD or simulated online payment.
- Deterministic delivery-date estimation from the PIN code.
- Order history, order detail with a visual delivery tracker, order cancellation.
- Verified-purchase product reviews (only after the order is delivered).
- Admin dashboard (KPIs, charts), product CRUD with image upload, category CRUD, order status management, user blocking, review moderation, sales reports with CSV export.
- Dark / light theme and a one-time cinematic intro animation.

### Out of scope (not implemented)
- Real payment gateway (Razorpay / Stripe etc.) — online payment is simulated.
- Real email delivery — the password-reset link is printed to the server console.
- Returns/refunds, coupons, shipping-partner integration, multi-vendor support.
- Automated tests (there is no test suite in the repository).

---

## 3. Technology Stack

### Core
| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| Framework | Next.js (App Router) | ^15.1 | Pages, layouts, server route handlers (REST API), middleware |
| UI library | React | ^19.0 | Component model |
| Language | TypeScript | ^5.6 | Static typing (`strict: true`) |
| Database | PostgreSQL | 15 (Docker image `postgres:15-alpine`) | Relational data store |
| ORM | Prisma / @prisma/client | ^5.22 | Schema, migrations, type-safe queries |
| Styling | Tailwind CSS v4 + custom CSS variables | ^4.0 | Utility classes + design tokens in `globals.css` |

### Backend libraries
| Library | Purpose |
| :--- | :--- |
| `jose` | Sign and verify JWTs (HS256). Edge-runtime compatible, so it works inside Next.js middleware. |
| `bcryptjs` | Password hashing (12 salt rounds in the app, 10 in the seed script). |
| `zod` | Request-body and query-string validation; the same schemas are reused by client forms. |
| `nanoid` | Random IDs for password-reset tokens (32 chars) and uploaded file names (12 chars). |
| `sharp` | Image processing dependency used by Next.js image optimisation. |

### Frontend libraries
| Library | Purpose |
| :--- | :--- |
| `zustand` | Client state stores (auth, cart, wishlist, theme); `persist` middleware saves to `localStorage`. |
| `react-hook-form` + `@hookform/resolvers` | Form state, with Zod resolvers for validation. |
| `gsap` | Cinematic intro animation timeline. |
| `framer-motion` | Page and component transitions, micro-interactions. |
| `lenis` / `@studio-freight/lenis` | Smooth scrolling. |
| `recharts` | Installed for charts but **not currently used** (the dashboard has no charts yet). |
| `@dnd-kit/*` | Installed for drag-and-drop but **not currently used** in any component. |
| `@radix-ui/*` | Accessible primitives: dialog, dropdown, accordion, tabs, select, slider, checkbox, toast, avatar, tooltip, progress. |
| `lucide-react` | Icon set. |
| `sonner` | Toast notifications. |
| `canvas-confetti` | Celebration effect on the landing page. |
| `date-fns` | Date utilities. |
| `clsx`, `tailwind-merge`, `class-variance-authority` | Class-name composition (`cn()` helper). |

### Tooling
ESLint 9 with `eslint-config-next`, PostCSS with `@tailwindcss/postcss`, Docker Compose for the local database, Vercel for hosting.

---

## 4. System Architecture

### 4.1 High-level view

Trend Vogue is a **monolith**: the browser talks to one Next.js server, which renders pages *and* serves the JSON API. There is no separate backend service.

```mermaid
flowchart LR
    B[Browser<br/>React 19 + Zustand] -- "HTML / RSC" --> N
    B -- "fetch /api/* (JSON, cookies)" --> N
    subgraph N[Next.js 15 server]
      M[middleware.ts<br/>JWT route guard] --> P[App Router pages<br/>src/app/(site|auth|admin)]
      A[Route handlers<br/>src/app/api/**/route.ts]
      A --> S[src/server<br/>Prisma · JWT · bcrypt · Zod · delivery estimator]
    end
    S -- Prisma Client --> D[(PostgreSQL 15)]
    A -- "writes images" --> F[/public/uploads/]
```

### 4.2 Request lifecycle (example: placing an order)
1. The browser sends `POST /api/orders` with the `access_token` cookie attached automatically.
2. The route handler calls `getServerUser()` (`src/lib/auth.ts`), which reads the cookie and verifies the JWT with `jose`.
3. The body is validated with `createOrderSchema` (Zod). Invalid input → HTTP 422.
4. Business logic runs (stock check, address resolution, delivery estimate).
5. Prisma executes an interactive **database transaction**: create order + items, decrement stock, clear cart.
6. The handler returns `{ success: true, data: {...} }` with HTTP 201.

### 4.3 Uniform API response format
All handlers use helpers in `src/lib/api-helpers.ts`:

```json
// success
{ "success": true,  "data": { ... } }
// failure
{ "success": false, "error": "Human-readable message" }
```

Status codes used: `200` OK, `201` Created, `400` Bad request / business-rule failure, `401` Not logged in, `403` Forbidden (wrong role or blocked), `404` Not found, `409` Conflict (duplicate email / duplicate review), `422` Validation error, `500` Server error.

Paginated endpoints add a `pagination` object: `{ total, page, limit, pages, hasNext, hasPrev }`.

### 4.4 Code layers
| Layer | Location | Responsibility |
| :--- | :--- | :--- |
| Presentation | `src/app/(site)`, `(auth)`, `(admin)`, `src/components` | Pages, layouts, UI components |
| Client state | `src/store` | Zustand stores |
| Edge guard | `src/middleware.ts` | Redirects based on JWT role before a page renders |
| API | `src/app/api/**/route.ts` | HTTP handlers (controllers) |
| Server domain | `src/server/lib`, `src/server/schemas` | DB client, auth crypto, validation, delivery logic |
| Persistence | `prisma/schema.prisma`, PostgreSQL | Data model and storage |

---

## 5. Folder Structure

```
frontend/                               # Repository root (single Next.js app)
├── docker-compose.yml                  # Local PostgreSQL 15 (host port 5433 → container 5432)
├── next.config.js                      # Next.js config (image domains, server externals)
├── vercel.json                         # Vercel build/install commands
├── tsconfig.json                       # TS config; alias "@/*" → "./src/*"
├── package.json
├── .env.example                        # Template for required environment variables
├── prisma/
│   ├── schema.prisma                   # Database schema (10 models, 4 enums)
│   ├── seed.ts                         # Seeds 4 categories, 3 users, 20 products
│   └── migrations/20261006111543_init/ # Initial SQL migration
└── src/
    ├── middleware.ts                   # Route protection (guest / auth / admin)
    ├── app/
    │   ├── layout.tsx                  # Root layout: fonts, metadata, ThemeProvider, AuthInitializer, Toaster
    │   ├── (site)/                     # Customer storefront (route group, no URL prefix)
    │   │   ├── layout.tsx              # Navbar + CartDrawer + Footer
    │   │   ├── page.tsx                # Landing page  → /
    │   │   ├── shop/page.tsx           # Catalogue     → /shop
    │   │   ├── shop/[category]/page.tsx#               → /shop/men, /shop/women …
    │   │   ├── product/[id]/page.tsx   # Product detail → /product/:id
    │   │   ├── cart/page.tsx           # → /cart
    │   │   ├── checkout/page.tsx       # → /checkout
    │   │   ├── orders/page.tsx         # → /orders
    │   │   ├── orders/[id]/page.tsx    # → /orders/:id (delivery tracker)
    │   │   ├── wishlist/page.tsx       # → /wishlist
    │   │   └── profile/page.tsx        # → /profile (details, addresses, password)
    │   ├── (auth)/                     # Login, register, forgot/reset password
    │   ├── (admin)/admin/              # Back-office → /admin/*
    │   │   ├── layout.tsx              # AdminSidebar shell
    │   │   ├── page.tsx                # Dashboard
    │   │   ├── products/ (list, new, [id]/edit)
    │   │   ├── orders/   (list, [id])
    │   │   ├── categories/, users/, reviews/, reports/
    │   └── api/                        # REST API (24 route files)
    │       ├── auth/    (register, login, logout, me, forgot-password, reset-password)
    │       ├── products/ ([id], [id]/reviews)
    │       ├── cart/    ([itemId])
    │       ├── wishlist/
    │       ├── orders/  ([id])
    │       ├── users/me/ (addresses, addresses/[id])
    │       └── admin/   (stats, reports, categories, categories/[id], users, users/[id], reviews/[id], upload)
    ├── components/
    │   ├── admin/      AdminSidebar.tsx, ProductForm.tsx
    │   ├── cart/       CartDrawer.tsx
    │   ├── intro/      CinematicIntro.tsx
    │   ├── layout/     Navbar.tsx, Footer.tsx, ThemeProvider.tsx, AuthInitializer.tsx
    │   ├── orders/     DeliveryTracker.tsx
    │   └── product/    ProductCard.tsx
    ├── lib/
    │   ├── api-helpers.ts              # apiSuccess / apiError / pagination helpers
    │   ├── auth.ts                     # getServerUser / requireAuth / requireAdmin
    │   └── utils.ts                    # cn, formatCurrency (INR), dates, discount %, order status labels
    ├── server/                         # Server-side domain code (formerly a separate "backend" folder)
    │   ├── lib/   prisma.ts, jwt.ts, bcrypt.ts, delivery-estimate.ts
    │   └── schemas/ auth, address, product, order, review (Zod)
    ├── store/      auth.store.ts, cart.store.ts, wishlist.store.ts, theme.store.ts
    ├── styles/     globals.css             # Design tokens, dark/light themes
    └── types/      index.ts
```

> **History:** the project originally had a separate `backend/` folder containing the Prisma schema, seed and shared libraries. It never ran as its own server — Next.js imported it through an `@backend` alias. It was merged into `src/server/` and `prisma/` so the project is a single, self-contained Next.js app.

---

## 6. Database Design

### 6.1 Entity-relationship diagram

```mermaid
erDiagram
    User ||--o{ Address : has
    User ||--o{ Order : places
    User ||--o{ CartItem : has
    User ||--o{ WishlistItem : saves
    User ||--o{ Review : writes
    Category ||--o{ Product : contains
    Product ||--o{ CartItem : "in"
    Product ||--o{ WishlistItem : "in"
    Product ||--o{ OrderItem : "sold as"
    Product ||--o{ Review : receives
    Order ||--|{ OrderItem : contains
```

`PasswordResetToken` is standalone (linked to a user by email, not by foreign key).

### 6.2 Tables

All primary keys are `cuid()` strings. `createdAt` defaults to `now()`; `updatedAt` is maintained by Prisma.

**User**
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | String (PK) | cuid |
| name | String | |
| email | String | **unique** |
| phone | String? | optional, 10-digit Indian mobile |
| passwordHash | String | bcrypt hash, never returned by the API |
| role | Role | `USER` (default) or `ADMIN` |
| isBlocked | Boolean | default `false`; blocked users cannot log in |
| createdAt / updatedAt | DateTime | |

**Category**
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | String (PK) | |
| name | String | e.g. "Men" |
| slug | String | **unique**, used in URLs (`/shop/men`) |
| sortOrder | Int | display order, default 0 |

**Product**
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | String (PK) | |
| name, description | String | |
| price | Float | selling price (INR) |
| mrp | Float | maximum retail price; discount % = (mrp − price) / mrp |
| images | String[] | PostgreSQL text array of URLs |
| sizes | String[] | e.g. `["S","M","L","XL"]` |
| colors | String[] | |
| stockQty | Int | decremented on order, restored on cancel |
| isActive | Boolean | `false` = soft-deleted / hidden |
| categoryId | String (FK → Category) | |

**Address** — `userId` (FK, cascade delete), `line1`, `line2?`, `city`, `state`, `pincode`, `phone`, `isDefault`.

**CartItem** — `userId` (FK, cascade), `productId` (FK), `size`, `color?`, `quantity`. Unique on (`userId`, `productId`, `size`, `color`).

**WishlistItem** — `userId` (FK, cascade), `productId` (FK). Unique on (`userId`, `productId`).

**Order**
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | String (PK) | |
| userId | String (FK → User) | |
| addressSnap | Json | **snapshot** of the delivery address at order time, so later address edits do not change past orders |
| paymentMethod | PaymentMethod | `COD` or `DUMMY_ONLINE` |
| paymentStatus | PaymentStatus | `PENDING` (COD) / `PAID` (online) / `FAILED` |
| status | OrderStatus | default `ORDERED` |
| totalAmount | Float | sum of item price × quantity |
| estimatedDelivery | DateTime | from the delivery estimator |
| pincodeDeliveryTier | String | `"metro"` or `"standard"` |

**OrderItem** — `orderId` (FK), `productId` (FK), `size`, `color?`, `quantity`, `price` (**price captured at purchase time**).

**Review** — `userId`, `productId`, `rating` (1–5), `comment`, `createdAt`. Unique on (`userId`, `productId`) → one review per user per product.

**PasswordResetToken** — `email`, `token` (unique), `expiresAt`, `used`, `createdAt`.

### 6.3 Enums
| Enum | Values |
| :--- | :--- |
| Role | `USER`, `ADMIN` |
| PaymentMethod | `COD`, `DUMMY_ONLINE` |
| PaymentStatus | `PENDING`, `PAID`, `FAILED` |
| OrderStatus | `ORDERED` → `PACKED` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED`, plus `CANCELLED` |

### 6.4 Design decisions
- **Snapshots for history:** orders store a JSON copy of the address and each item's price, so the record of what was bought stays correct even if products or addresses change later.
- **Soft delete for products:** "deleting" a product sets `isActive = false`, so existing order items still reference a valid product.
- **Composite unique keys** stop duplicate cart lines, duplicate wishlist entries and duplicate reviews at the database level.
- **Cascade deletes** only on user-owned, non-financial data (addresses, cart, wishlist); orders are never cascade-deleted.

### 6.5 Seed data (`prisma/seed.ts`)
The seed **wipes all tables**, then creates:
- 4 categories: Men, Women, Kids, Beauty.
- 3 accounts (see table below); the demo customer has a default address in Bengaluru (PIN 560001, a metro PIN).
- 20 products, 5 per category, priced ₹449–₹4,999 (e.g. "Classic Oxford Button-Down Shirt" ₹1,299, "Premium Wool Blend Blazer" ₹4,999, "Embroidered Anarkali Kurta" ₹2,999, "Dinosaur Print Tee — Boys" ₹449, "Luxury Perfume — Oud & Rose" ₹2,499).

| Role | Email | Password | Source |
| :--- | :--- | :--- | :--- |
| Admin (primary) | `Meet2026@gmail.com` | `Meet@@2026` | `ADMIN_SEED_*` env vars, these are the defaults |
| Admin (secondary) | `admin@trendvogue.com` | `Admin@12345` | hard-coded in seed |
| Customer | `user@trendvogue.com` | `User@12345` | hard-coded in seed ("Rahul Sharma") |
| Self-registered | any | any valid | always created with role `USER` |

---

## 7. Authentication & Authorization

### 7.1 Mechanism
- **Stateless JWT authentication** using `jose` with HS256.
- Two tokens are issued on login and registration:

| Token | Cookie name | Lifetime | Secret env var |
| :--- | :--- | :--- | :--- |
| Access token | `access_token` | 15 minutes | `JWT_ACCESS_SECRET` |
| Refresh token | `refresh_token` | 7 days | `JWT_REFRESH_SECRET` |

- Token payload: `{ sub: userId, email, role }`.
- Cookies are `httpOnly` (not readable by JavaScript, which mitigates XSS token theft), `sameSite=lax` (CSRF mitigation), `secure` in production, `path=/`.
- Logout clears both cookies (`maxAge: 0`).

### 7.2 Login flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as /login page
    participant API as POST /api/auth/login
    participant DB as PostgreSQL
    U->>L: email + password
    L->>API: JSON body
    API->>API: Zod validate (422 on error)
    API->>DB: find user by email
    alt not found / wrong password
        API-->>L: 401 "Invalid email or password"
    else isBlocked
        API-->>L: 403 "Account suspended"
    else ok
        API->>API: sign access + refresh JWT
        API-->>L: 200 {user} + Set-Cookie ×2
        L->>U: redirect: ADMIN → /admin, USER → / (or ?redirect=)
    end
```

The same generic error is returned for "no such email" and "wrong password", so attackers cannot tell which emails are registered.

### 7.3 Route protection (two layers)

**Layer 1 — `src/middleware.ts` (page routes, runs before render):**
| Paths | Rule |
| :--- | :--- |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Guest-only. A logged-in ADMIN is redirected to `/admin`, a USER to `/`. |
| `/admin/*` | Not logged in → `/login?redirect=/admin…`. Logged in but not ADMIN → `/`. |
| `/cart`, `/checkout`, `/orders`, `/profile`, `/wishlist` | Not logged in → `/login?redirect=<path>`. |
| everything else | Public. |

The middleware matcher excludes `/api`, `/_next/static`, `/_next/image`, `favicon.ico`, `/public` and `/uploads`.

**Layer 2 — inside every API handler:** handlers call `getServerUser()` and check `user.role`, so the API is protected even if someone calls it directly without going through a page.

### 7.4 Password reset flow
1. `POST /api/auth/forgot-password` with an email. The API **always** answers with the same success message, whether or not the email exists (no account enumeration).
2. If the user exists, it creates a `PasswordResetToken` (nanoid, 32 chars) valid for **1 hour**. The reset URL `NEXT_PUBLIC_APP_URL/reset-password?token=…` is printed to the server console; in development it is also returned as `devResetUrl`.
3. `POST /api/auth/reset-password` with `token`, `password`, `confirmPassword`. It rejects unknown, used or expired tokens, then **in one transaction** updates the password hash and marks the token as used (single-use).

---

## 8. API Reference

Base path: `/api`. Auth: **Public** = no login needed, **User** = any logged-in account, **Admin** = `role === "ADMIN"`.

### 8.1 Auth
| Method | Endpoint | Auth | Body / Query | Result |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Public | `name, email, phone?, password, confirmPassword` | 201 `{user}` + cookies; 409 if email exists |
| POST | `/auth/login` | Public | `email, password` | 200 `{user}` + cookies; 401 / 403 |
| POST | `/auth/logout` | Public | — | clears cookies |
| GET | `/auth/me` | User | — | current user (`id, name, email, phone, role, isBlocked, createdAt`) |
| POST | `/auth/forgot-password` | Public | `email` | generic success message |
| POST | `/auth/reset-password` | Public | `token, password, confirmPassword` | success or 400 |

### 8.2 Products & reviews
| Method | Endpoint | Auth | Details |
| :--- | :--- | :--- | :--- |
| GET | `/products` | Public | Query: `search`, `category` (slug), `minPrice`, `maxPrice`, `sizes` (comma list), `colors` (comma list), `sort` = `newest` (default) \| `price_asc` \| `price_desc` \| `popularity`, `page` (default 1), `limit` (default 12, max 100). Only `isActive` products. Search is case-insensitive on name and description. Popularity = number of order items. Returns products with category and review ratings, plus pagination. |
| POST | `/products` | Admin | Create a product (see validation in §12). |
| GET | `/products/:id` | Public | Product with category and all reviews (with reviewer name). |
| PATCH | `/products/:id` | Admin | Partial update. |
| DELETE | `/products/:id` | Admin | **Soft delete** (`isActive = false`). |
| GET | `/products/:id/reviews` | Public | Reviews, newest first. |
| POST | `/products/:id/reviews` | User | `rating (1–5), comment (≥10 chars)`. 409 if already reviewed; 403 unless the user has a **DELIVERED** order containing this product. |

### 8.3 Cart (server-side)
| Method | Endpoint | Auth | Details |
| :--- | :--- | :--- | :--- |
| GET | `/cart` | User | Cart lines with product info. |
| POST | `/cart` | User | `productId, size, color?, quantity?` — upsert; adds to the quantity if the line already exists. |
| DELETE | `/cart` | User | Clear the whole cart. |
| PATCH | `/cart/:itemId` | User | `quantity` (0 removes the line). |
| DELETE | `/cart/:itemId` | User | Remove one line. |

### 8.4 Wishlist
| Method | Endpoint | Auth | Details |
| :--- | :--- | :--- | :--- |
| GET | `/wishlist` | User | Saved products with category. |
| POST | `/wishlist` | User | `productId` — **toggle**: returns `action: "added"` or `"removed"`. |

### 8.5 Orders
| Method | Endpoint | Auth | Details |
| :--- | :--- | :--- | :--- |
| GET | `/orders` | User / Admin | Users see their own orders; admins see all. `page`, `limit` (default 10). |
| POST | `/orders` | User | `paymentMethod` (`COD` \| `DUMMY_ONLINE`) and either `addressId` or `newAddress {line1, line2?, city, state, pincode, phone}`. See §11.2. Returns the order and a delivery estimate. |
| GET | `/orders/:id` | Owner / Admin | Order with items, product info and customer contact. |
| PATCH | `/orders/:id` | Owner / Admin | `status`. Admins may set any status. Customers may only set `CANCELLED`, and only while the status is `ORDERED` or `PACKED`. Cancelling restores stock. |

### 8.6 User profile & addresses
| Method | Endpoint | Auth | Details |
| :--- | :--- | :--- | :--- |
| GET | `/users/me` | User | Profile, addresses, order count. |
| PATCH | `/users/me` | User | Either profile update (`name?, phone?`) or, if `currentPassword` is present, a password change (`currentPassword, newPassword, confirmPassword`). |
| GET | `/users/me/addresses` | User | List addresses. |
| POST | `/users/me/addresses` | User | Add an address; `isDefault: true` unsets the others. |
| PATCH | `/users/me/addresses/:id` | User | Partial update. |
| DELETE | `/users/me/addresses/:id` | User | Delete. |

### 8.7 Admin
| Method | Endpoint | Details |
| :--- | :--- | :--- |
| GET | `/admin/stats` | KPIs (non-cancelled order count, total revenue, active customers, low-stock products ≤ 5), 8 recent orders, order count per status, daily revenue for the last 7 days (IST), top 5 products by quantity sold. |
| GET | `/admin/reports` | Totals (revenue, order count, average order value, revenue by payment method) plus the latest 50 non-cancelled orders. `?export=csv` downloads `trend_vogue_sales_YYYY-MM-DD.csv` (Order ID, Customer, Email, Total, Payment Method, Status, Created At). |
| GET | `/admin/categories` | Public read (admins also get a product count). |
| POST | `/admin/categories` | `name, slug, sortOrder?` |
| PATCH | `/admin/categories/:id` | Update name / slug / sortOrder. |
| DELETE | `/admin/categories/:id` | Refused (400) if any product belongs to it. |
| GET | `/admin/users` | Customers only (`role = USER`), `search` on name/email, paginated (default 20). |
| GET | `/admin/users/:id` | User with the last 10 orders and addresses. |
| PATCH | `/admin/users/:id` | `isBlocked: boolean` — suspend or reactivate. |
| DELETE | `/admin/reviews/:id` | Remove a review (moderation). |
| POST | `/admin/upload` | `multipart/form-data` field `files`. JPEG/PNG/WebP/AVIF only, max 5 MB each. Saved to `public/uploads/<nanoid>.<ext>`; returns the URLs. |

---

## 9. Pages & User Interface

### 9.1 Customer storefront — `(site)` route group
All storefront pages share a layout with the **Navbar** (search, categories, cart badge, theme toggle, account menu, animated mobile menu), the slide-in **CartDrawer** (closes on Escape, locks body scroll) and the **Footer**.

| URL | Page | Key features |
| :--- | :--- | :--- |
| `/` | Landing page | Promo banner; editorial hero; trust strip; department showcase (Men/Women/Kids/Beauty); curated product grid (12 latest products from the API); flash-sale banner with live countdown timer; brand-story section; customer testimonials; FAQ accordion; VIP newsletter sign-up; interactive delivery-estimate demo widget; confetti effect. Shows the **cinematic intro** once per browser session. |
| `/shop`, `/shop/[category]` | Catalogue | `/shop/[category]` redirects to `/shop?category=<slug>`. Search, category, price-range, size and colour filters; sort; pagination. Uses `GET /api/products`. |
| `/product/[id]` | Product detail | Image gallery, size/colour selection, price/MRP/discount, stock, add to cart / wishlist, reviews. |
| `/cart` | Cart | Edit quantities (capped at stock), remove items, subtotal. |
| `/checkout` | Checkout | Choose a saved address or enter a new one, choose COD or online (simulated), place order, see the estimated delivery date. |
| `/orders` | Order history | List of the customer's orders. |
| `/orders/[id]` | Order detail | **DeliveryTracker** stepper (Ordered → Packed → Shipped → Out for delivery → Delivered), items, address snapshot, cancel button where allowed. |
| `/wishlist` | Wishlist | Saved products (client-side store); move to cart (adds size M, quantity 1), remove one, clear all. |
| `/profile` | Profile | Edit name/phone, manage addresses, change password. |

### 9.2 Authentication — `(auth)` route group
`/login`, `/register`, `/forgot-password`, `/reset-password?token=…` — forms built with React Hook Form + Zod, sharing a common auth layout. After login: ADMIN → `/admin`, USER → `/` or the `?redirect=` target.

### 9.3 Admin back-office — `/admin/*`
A sidebar layout (`AdminSidebar`) with these sections:

| URL | Section | Features |
| :--- | :--- | :--- |
| `/admin` | Dashboard | KPI cards (orders, revenue, active customers, low stock), recent orders, top-selling products. The API also returns 7-day revenue and orders-by-status data, which the page does not display yet. |
| `/admin/products` | Products | Search/filter list, activate/deactivate, delete (soft). |
| `/admin/products/new`, `/admin/products/[id]/edit` | Product form | `ProductForm`: name, description, price, MRP, category, sizes, colours, stock, active flag, multi-image upload (via `/api/admin/upload`). |
| `/admin/orders`, `/admin/orders/[id]` | Orders | Paginated list with a status filter (see §16, issue 16); detail view with status updates through the lifecycle. |
| `/admin/categories` | Categories | Create, rename, reorder, delete (blocked if products exist). |
| `/admin/users` | Users | Search customers, view details, block/unblock. |
| `/admin/reviews` | Reviews | View reviews across products and delete inappropriate ones. |
| `/admin/reports` | Reports | Revenue, order count, AOV, revenue by payment method, CSV export. |

### 9.4 Shared components
| Component | Purpose |
| :--- | :--- |
| `CinematicIntro` | GSAP timeline: wordmark reveal (0–1.2 s), light-sweep shimmer (1.2–2.0 s), hold (2.0–2.8 s), shutter-wipe exit; skip button appears after 1 s; plays once per session (`sessionStorage`). |
| `ProductCard` | Product tile with image, price, MRP strike-through, discount %, wishlist heart, quick add. |
| `CartDrawer` | Slide-over cart. |
| `DeliveryTracker` | Visual order-status stepper. |
| `ThemeProvider` | Applies the dark/light theme and `color-scheme`. |
| `AuthInitializer` | Calls `/api/auth/me` on load to restore the session into the auth store. |

---

## 10. Client State Management

Four **Zustand** stores in `src/store/`:

| Store | Persisted? (`localStorage` key) | State & actions |
| :--- | :--- | :--- |
| `useAuthStore` | No | `user`, `isLoading`, `isHydrated`; `fetchMe()` calls `/api/auth/me`; `logout()` calls `/api/auth/logout`. |
| `useCartStore` | Yes (`tv-cart`) | `items[]` keyed by product + size + colour, `isOpen`; `addItem` (opens the drawer, caps at stock), `removeItem`, `updateQty`, `clearCart`, `getItemCount`, `getSubtotal`. |
| `useWishlistStore` | Yes (`tv-wishlist`) | `items[]`; `toggle`, `remove`, `isInWishlist`, `clear`. |
| `useThemeStore` | Yes (`tv-theme`) | `theme` (`dark` default / `light`); `toggleTheme`, `setTheme`. |

Server data (products, orders, profile) is fetched with `fetch()` inside client components with `credentials: "include"`, so the auth cookies are sent.

---

## 11. Core Business Logic

### 11.1 Delivery-date estimation (`src/server/lib/delivery-estimate.ts`)
A deterministic algorithm (no external API):
1. Take the first 3 digits of the 6-digit PIN code.
2. If they match a **metro prefix**, the tier is `metro` (2–3 business days); otherwise `standard` (4–6 business days).
   Metro prefixes: Delhi 110; Mumbai 400–403; Bengaluru 560; Chennai 600–603; Kolkata 700, 711, 712; Hyderabad 500–502; Ahmedabad 380, 382, 383; Pune 411, 412; Jaipur 302, 303; Lucknow 226, 227.
3. Estimated date = today + 1 business day of handling + the **maximum** days for the tier (a conservative promise).
4. Business days skip **Sundays only** (Saturday delivery is allowed).
5. Returns a label such as "Arriving by Friday, 10 October" (`en-IN` format) and a tier label ("Express Delivery" / "Standard Delivery").

*Example:* a Bengaluru order (PIN 560001) placed on a Monday → +1 handling day (Tue) → +3 business days → **Friday**.

### 11.2 Order placement (`POST /api/orders`)
1. Require login; validate the body.
2. Load the user's cart lines from the database; reject an empty cart.
3. **Stock check:** reject if any product's `stockQty` is below the requested quantity.
4. Resolve the address: a saved address (must belong to the user) or a new one; store it as a JSON snapshot.
5. Calculate the delivery estimate from the PIN code.
6. Total = Σ (current product price × quantity).
7. **Atomic transaction:** create the `Order` with its `OrderItem`s (price captured), set payment status (`COD` → `PENDING`, online → `PAID`), decrement each product's stock, clear the cart. If any step fails, nothing is saved.

### 11.3 Order lifecycle
```
ORDERED → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
   └────────┴──→ CANCELLED (customer: only from ORDERED or PACKED; admin: any time)
```
Cancelling adds each item's quantity back to stock.

### 11.4 Verified-purchase reviews
A customer may review a product only if they have an order with status `DELIVERED` that contains it, and only once (enforced in code and by a unique DB constraint).

### 11.5 Other rules
- Low-stock threshold on the dashboard: `stockQty ≤ 5` (active products only).
- Discount % = `round((mrp − price) / mrp × 100)`.
- Currency formatting: `Intl.NumberFormat("en-IN", { currency: "INR" })` with no decimals.
- A category cannot be deleted while products belong to it.
- Blocked users cannot log in, and `/api/auth/me` returns 403 for them.

---

## 12. Validation Rules

All validation is defined once with **Zod** in `src/server/schemas/` and used on the server (and by client forms).

| Field | Rule |
| :--- | :--- |
| Name | ≥ 2 characters |
| Email | valid email format |
| Phone | Indian mobile: `^[6-9]\d{9}$` (10 digits starting with 6–9); optional at registration |
| Password (register, reset, change) | ≥ 8 characters, at least one uppercase letter and one digit; must match the confirmation |
| PIN code | exactly 6 digits `^\d{6}$` |
| Address line 1 | ≥ 5 characters; city and state ≥ 2 |
| Product | name ≥ 2, description ≥ 10, price & MRP > 0, ≥ 1 image URL, ≥ 1 size, stock integer ≥ 0, category required |
| Product query | `limit` 1–100, `page` ≥ 1, `sort` ∈ {price_asc, price_desc, newest, popularity} |
| Order | `paymentMethod` ∈ {COD, DUMMY_ONLINE}; either `addressId` or `newAddress` required |
| Review | rating integer 1–5, comment ≥ 10 characters |
| Upload | JPEG/PNG/WebP/AVIF, ≤ 5 MB per file |

---

## 13. Design System

- **Themes:** AMOLED-style dark theme (default) and a light theme, switched via CSS custom properties in `src/styles/globals.css` and persisted in `localStorage`.
- **Dark palette:** background `#0A0D10`, surface `#11161D`, accent blue `#2162A1`, highlight yellow `#FFD814`, amber `#F08804`, success `#238636`, error `#E5534B`, primary text `#F0F6FC`, muted text `#8B949E`.
- **Glassmorphism:** translucent navbar (`rgba(10,13,16,0.82)` with a 24 px backdrop blur) and translucent card surfaces.
- **Typography:** Inter (body), Space Grotesk (display headings), Fraunces (editorial serif), loaded from Google Fonts / `next/font`.
- **Motion:** GSAP for the intro, Framer Motion for transitions, Lenis for smooth scrolling.
- **Accessibility:** Radix UI primitives provide keyboard and screen-reader support for dialogs, menus, tabs, accordions and selects.
- **SEO:** root metadata with title template `"%s | Trend Vogue"`, description, keywords, Open Graph (`en_IN`) and Twitter card.

---

## 14. Security Measures

| Threat | Mitigation in this project |
| :--- | :--- |
| Password theft from the DB | bcrypt hashing (12 rounds); hashes are never returned by the API |
| Token theft via XSS | JWTs stored in `httpOnly` cookies, not `localStorage` |
| CSRF | `sameSite=lax` cookies |
| Session hijack window | 15-minute access-token lifetime |
| Privilege escalation | Role checks in middleware **and** in every admin API handler; registration always creates `USER` |
| Insecure direct object reference | Queries are scoped by `userId` (cart, addresses, orders); the order API checks ownership |
| Account enumeration | Generic login error; forgot-password always returns the same message |
| Password-reset abuse | Random 32-char token, 1-hour expiry, single use, updated in a transaction |
| Invalid / malicious input | Zod validation on every write endpoint; Prisma parameterised queries prevent SQL injection |
| Malicious uploads | MIME allow-list, 5 MB limit, random server-generated file names |
| Abusive accounts | Admins can block users; blocked users cannot log in |
| Data integrity | DB transactions for orders and password resets; unique constraints; soft delete of products |

---

## 15. Setup, Configuration & Deployment

### 15.1 Prerequisites
- Node.js **≥ 20.19 or ≥ 22.13** (one ESLint dependency warns on older versions)
- npm 10+
- Docker (for the local database) **or** any PostgreSQL 15 instance (Neon, Supabase, Railway, …)

### 15.2 Environment variables (`.env`)
Copy `.env.example` to `.env`. Both Next.js and the Prisma CLI read `.env`.

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. For the bundled Docker DB: `postgresql://trendvogue:trendvogue@localhost:5433/trend_vogue?schema=public` |
| `JWT_ACCESS_SECRET` | Yes (prod) | Secret for access tokens (≥ 32 random chars). Falls back to an insecure default if missing. |
| `JWT_REFRESH_SECRET` | Yes (prod) | Secret for refresh tokens. |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL used in password-reset links, e.g. `http://localhost:3000` |
| `NODE_ENV` | — | `development` / `production` |
| `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `ADMIN_SEED_NAME` | No | Override the primary admin created by the seed |

### 15.3 Local setup
```bash
# 1. Start PostgreSQL (container "trendvogue_postgres", host port 5433)
docker compose up -d

# 2. Configure environment
cp .env.example .env          # then set DATABASE_URL port to 5433 for Docker

# 3. Install dependencies (also runs `prisma generate`)
npm install

# 4. Create tables
npx prisma migrate dev

# 5. Seed demo data (WARNING: deletes all existing data)
npx tsx prisma/seed.ts

# 6. Run
npm run dev                   # http://localhost:3000
```

### 15.4 npm scripts
| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `next dev` | Development server |
| `build` | `prisma generate && next build` | Production build |
| `start` | `next start` | Run the production build |
| `lint` | `next lint` | ESLint |
| `type-check` | `tsc --noEmit` | TypeScript check |
| `postinstall` | `prisma generate` | Generate the Prisma client after install |

Useful Prisma commands: `npx prisma studio` (DB GUI), `npx prisma migrate reset` (drop and recreate), `npx prisma db push` (sync schema without a migration).

### 15.5 Deployment (Vercel)
- `vercel.json`: framework `nextjs`, build `prisma generate && next build`, install `npm install`.
- `next.config.js` marks `bcryptjs`, `@prisma/client` and `prisma` as `serverExternalPackages` so they are not bundled into serverless functions, and allows remote images from `images.unsplash.com` and `*.supabase.co`.
- Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` and `NEXT_PUBLIC_APP_URL` in the Vercel project settings, then run `npx prisma migrate deploy` and the seed against the production database once.

---

## 16. Known Issues & Limitations

These were found by reviewing the code and are listed so the report can describe the current state honestly.

| # | Area | Issue | Effect |
| :--- | :--- | :--- | :--- |
| 1 | Cart → checkout | The cart lives only in the browser (`useCartStore`, `localStorage`). No page calls `/api/cart`, but `POST /api/orders` reads the cart from the **database**. | Checkout fails with "Your cart is empty" unless the cart is synced to the server first. |
| 2 | Login redirect (fixed) | Previously, `router.push` after login could reuse pages prefetched while logged out (cached redirects to `/login`), and `fetchMe()` read the wrong response field. Login, register and logout now do a full page load, `fetchMe()` reads `data.user` correctly, and the `?redirect=` parameter only accepts same-site paths. | Resolved. |
| 3 | Admin dashboard | The 7-day revenue SQL in `/api/admin/stats` uses `created_at` and `total_amount`, but the real columns are `"createdAt"` and `"totalAmount"`. | The stats endpoint errors, so the dashboard cannot load. |
| 4 | Token refresh | A refresh token is issued, but no endpoint uses it. | Users are effectively logged out after 15 minutes. |
| 5 | Wishlist sync | The wishlist is client-only (`localStorage`) and never synced with `/api/wishlist`. "Move to Cart" always uses size M and a placeholder stock of 50. | Wishlist is lost on another device; size may be wrong. |
| 6 | Address recipient | The `Address` table has no recipient-name column, so addresses store only phone and location. | Orders do not record who should receive the parcel. |
| 7 | Config leftovers | `tsconfig.json` and `next.config.js` still reference the old `../backend/src` alias, and `outputFileTracingRoot` points to the parent folder. | Harmless locally, but should be removed. |
| 8 | DB port | `docker-compose.yml` exposes port **5433**; `.env.example` uses **5432**. | Change the port in `.env` when using Docker. |
| 9 | Seed command | `package.json` has no `prisma.seed` entry, so `npx prisma db seed` does nothing. | Use `npx tsx prisma/seed.ts`. |
| 10 | Image uploads | Files are written to `public/uploads` on the server's disk. | Uploads are lost on Vercel (read-only, ephemeral filesystem); cloud storage is needed. |
| 11 | Email | Reset links are only logged to the console. | Users cannot reset passwords in production without an email service. |
| 12 | Payments | `DUMMY_ONLINE` is marked `PAID` immediately. | No real payment processing. |
| 13 | Concurrency | Stock is checked before the transaction and decremented without a `stockQty >= qty` guard. | Two simultaneous orders could oversell the last unit. |
| 14 | Testing | No unit, integration or end-to-end tests. | Regressions must be caught manually. |
| 15 | Rate limiting | No rate limiting on login, register or forgot-password. | Brute-force attempts are not throttled. |
| 16 | Admin order filter | `/admin/orders` sends a `status` query parameter, but `GET /api/orders` ignores it. | The status filter has no effect. |

---

## 17. Future Enhancements

- Sync the cart and wishlist with the server (fixes issues 1 and 5) and add token refresh (issue 4).
- Real payment gateway (Razorpay / Stripe) with webhook verification.
- Transactional email (Resend / SendGrid) for password resets and order updates.
- Cloud image storage (Supabase Storage / S3 / Cloudinary).
- Coupons, returns and refunds, invoices (PDF), shipment tracking via courier APIs.
- Product variants with stock per size/colour, rating aggregates, recommendations.
- Rate limiting, audit logs, two-factor authentication for admins.
- Automated tests (Vitest for logic, Playwright for end-to-end) and CI.
- Internationalisation and multi-currency support.

---

## 18. Suggested Report Outline

For an AI or person turning this README into a project report (PDF), this structure maps directly onto the sections above:

1. **Title page** — Trend Vogue: Full-Stack Clothing E-Commerce Platform.
2. **Abstract** — from §1 (one paragraph).
3. **Introduction** — problem (online fashion retail), motivation, objectives (§2).
4. **Scope** — in scope / out of scope (§2).
5. **Requirements** — functional: customer features (§9.1), admin features (§9.3); non-functional: security (§14), performance, usability (§13).
6. **Technology stack & justification** — §3.
7. **System design** — architecture diagram and request lifecycle (§4), folder structure (§5).
8. **Database design** — ER diagram, table descriptions, enums, design decisions (§6).
9. **Module descriptions** — Authentication (§7), Product catalogue, Cart & Checkout, Orders & Delivery (§11), Reviews, Admin panel, Reports.
10. **API design** — endpoint tables (§8), response format (§4.3).
11. **Algorithms** — delivery estimation, order transaction, review eligibility (§11).
12. **Validation & security** — §12, §14.
13. **UI / UX design** — design system, themes, animations (§13), page descriptions (§9).
14. **Implementation & deployment** — setup, environment, Vercel (§15).
15. **Testing** — note that testing was manual; list test cases derived from §8 and §11 (e.g. login with a blocked account → 403; review without a delivered order → 403; cancel a SHIPPED order → 400; order with insufficient stock → 400).
16. **Limitations** — §16.
17. **Future scope** — §17.
18. **Conclusion**.
19. **Appendix** — seeded demo accounts (§6.5), environment variables (§15.2).

Mermaid diagrams in §4.1, §6.1 and §7.2 can be rendered to images (for example with mermaid.live) for the PDF.
