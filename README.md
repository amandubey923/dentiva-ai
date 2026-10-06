# Dentiva AI — Healthcare Platform Foundation

> **AI-powered dental care platform** built on Next.js 16 (App Router), Clerk authentication, Vapi voice AI, Prisma ORM over Neon PostgreSQL, and Resend transactional email. Designed as a production-hardened foundation that can evolve into a general multi-specialty, multi-tenant healthcare SaaS.

**Live:** https://dentiva-ai-aman.netlify.app &nbsp;|&nbsp; **Repo:** https://github.com/amandubey923/dentiva-ai

---

## Overview

Dentiva AI enables patients to discover dental specialists, book appointments, and get real-time AI voice consultations with a dental assistant — 24/7. Authenticated users manage their appointment history and health overview through a streaming dashboard. Administrators manage the doctor roster and review appointment status through a protected admin panel.

The codebase has been professionally audited and hardened: authentication guards, server-side input validation, database indexes, parallelised server actions, streaming Suspense UI, and a 99.9% favicon payload reduction are all in place. The architecture is purposefully modular to support a growth path toward a general healthcare platform.

---

## Product Vision

| Stage | Status | Description |
|---|---|---|
| Dental-specific MVP | ✅ Implemented | Booking, AI voice assistant, admin dashboard, transactional email |
| Hardened foundation | ✅ Implemented | Auth, authorization, server-side validation, DB indexes, Suspense streaming |
| General healthcare platform | 🔮 Architectural Direction | Multi-specialty, multi-clinic, pluggable AI models |
| Multi-tenant enterprise SaaS | 🔮 Future Architecture | Tenant isolation, RBAC/ABAC, audit logs, compliance readiness |

---

## Current Capabilities

| Feature | Status | Notes |
|---|---|---|
| Landing page (marketing) | ✅ | Server-rendered, no DB call for anonymous visitors |
| Clerk authentication (email/OAuth) | ✅ | Social login, session management |
| User sync to PostgreSQL | ✅ | Auto-creates DB user record on first login |
| Patient dashboard | ✅ | Streaming Suspense, parallel queries |
| Appointment booking (multi-step) | ✅ | Doctor selection → date/time → confirmation → email |
| Booked-slot conflict prevention | ✅ | Server-side race-condition guard |
| AI voice consultation | ✅ | Vapi WebRTC, plan-gated |
| Subscription plan management | ✅ | Clerk-native `PricingTable` with `ai_basic`/`ai_pro` plans |
| Transactional email | ✅ | Resend + React Email, auth-gated API endpoint |
| Admin dashboard | ✅ | Doctor CRUD, appointment status management |
| Route-level auth middleware | ✅ | Clerk `clerkMiddleware` + `createRouteMatcher` |
| Loading/error boundaries | ✅ | All routes have `loading.tsx` + `error.tsx` |
| Database indexing | ✅ | 6 indexes on high-traffic columns |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│   Landing · Dashboard · Appointments · Voice · Admin   │
│   React 19 + TanStack Query + shadcn/ui + Tailwind 4   │
└────────────────────┬────────────────────────────────────┘
                     │ RSC / CSR
┌────────────────────▼────────────────────────────────────┐
│                 NEXT.JS 16 APP ROUTER                   │
│                                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │  Middleware  │  │  Server Pages │  │ API Routes  │  │
│  │  (Clerk Auth)│  │  + Suspense   │  │ (REST)      │  │
│  └──────────────┘  └───────┬───────┘  └──────┬──────┘  │
│                            │                  │         │
│               ┌────────────▼──────────────────▼──────┐ │
│               │        Server Actions (lib/actions/)  │ │
│               │  users · doctors · appointments ·     │ │
│               │  dashboard (unified parallel action)  │ │
│               └─────────────────┬────────────────────┘ │
└─────────────────────────────────┼───────────────────────┘
                                  │
        ┌─────────────────────────┼───────────────────┐
        │                         │                   │
┌───────▼───────┐   ┌─────────────▼────┐   ┌─────────▼──────┐
│  Neon Postgres │   │  Clerk Auth API  │   │  External SaaS │
│  (Prisma ORM) │   │  (JWT sessions)  │   │  Vapi · Resend │
└───────────────┘   └──────────────────┘   └────────────────┘
```

### Rendering Model

| Route | Rendering | Reason |
|---|---|---|
| `/` | Dynamic SSR | Clerk session check + user sync |
| `/dashboard` | Streaming SSR + Suspense | Parallel DB queries, skeleton fallback |
| `/appointments` | Static shell + CSR | TanStack Query hydration |
| `/voice` | Dynamic SSR | Plan entitlement check before render |
| `/pro` | Dynamic SSR | Clerk session required |
| `/admin` | Dynamic SSR | Email-based admin check |
| `/api/send-appointment-email` | API Route (POST) | Auth-gated transactional email |

---

## End-to-End Workflows

### 1. Authentication & Onboarding
```
Visitor → / (landing) → Clerk modal (sign-up/in) → Clerk JWT session
→ page.tsx (Server): currentUser() → syncUser() [upsert DB record]
→ redirect("/dashboard")
```

### 2. Patient Appointment Booking
```
/appointments (CSR) → DoctorSelectionStep (useAvailableDoctors query)
→ TimeSelectionStep (useBookedTimeSlots [doctorId, date] query)
→ BookingConfirmationStep (submit form)
→ bookAppointment() server action:
    ├─ auth() → getAuthenticatedDbUser()
    ├─ Validate: time slot in VALID_TIME_SLOTS
    ├─ Validate: date not in past
    ├─ Doctor existence check (isActive: true)
    ├─ Race-condition guard (findFirst on same slot)
    └─ prisma.appointment.create()
→ Confirmation step shown
→ POST /api/send-appointment-email (auth-gated)
    └─ Resend.emails.send() → patient inbox
→ TanStack Query cache invalidated (getUserAppointments + getBookedTimeSlots)
```

### 3. AI Voice Consultation
```
User navigates to /voice (SSR)
→ auth().has({ plan: "ai_basic" | "ai_pro" }) checked server-side
→ If no plan: ProPlanRequired UI rendered
→ If plan active: VapiWidget (client component) rendered
→ User clicks "Start Call"
→ vapi.start(NEXT_PUBLIC_VAPI_ASSISTANT_ID)
→ Vapi WebRTC session established (browser ↔ Vapi cloud)
→ Real-time speech events: call-start · speech-start · speech-end · message · error
→ Transcript displayed in scrollable message container
→ User clicks "End Call" → vapi.stop() → button resets for new call
```

### 4. Admin Workflow
```
Admin navigates to /admin (SSR)
→ currentUser() → email compared against ADMIN_EMAIL env var
→ Non-admin: redirect("/dashboard")
→ Admin: AdminDashboardClient renders
→ useGetAppointments() → getAppointments() server action
→ useGetDoctors() → getDoctors() server action (includes appointment count)
→ Admin creates doctor: createDoctor() → verifyAdmin() → prisma.doctor.create()
→ Admin marks appointment complete: updateAppointmentStatus() → isAdminUser() → prisma.appointment.update()
```

### 5. Dashboard Data Fetch
```
/dashboard (SSR)
→ getDashboardData() server action (single unified call):
    ├─ auth() → userId
    ├─ Promise.all([currentUser(), prisma.user.findUnique()])
    └─ Promise.all([count total, count completed, findMany appointments])
→ DashboardContent renders with pre-fetched props
→ WelcomeSection · MainActions · ActivityOverview (NextAppointment · DentalHealthOverview)
```

---

## Frontend Architecture

### Page/Route Structure
```
src/app/
├── page.tsx               # Landing (SSR, anonymous-safe)
├── layout.tsx             # Root shell: ClerkProvider + TanStackProvider + Toaster
├── dashboard/             # Patient dashboard (Suspense streaming)
├── appointments/          # Booking flow (client-rendered multi-step form)
├── voice/                 # AI voice call (plan-gated)
├── pro/                   # Upgrade/pricing (Clerk PricingTable)
├── admin/                 # Admin panel (email-restricted)
└── api/send-appointment-email/  # Transactional email endpoint
```

### Component Domains
| Domain | Location | Responsibility |
|---|---|---|
| Landing | `components/landing/` | Hero, HowItWorks, WhatToAsk, PricingSection, CTA, Footer |
| Dashboard | `components/dashboard/` | WelcomeSection, ActivityOverview, NextAppointment, DentalHealthOverview, MainActions |
| Appointments | `components/appointments/` | DoctorSelectionStep, TimeSelectionStep, BookingConfirmationStep, UpcomingAppointments, DoctorInfo, ProgressSteps |
| Voice | `components/voice/` | VapiWidget (client), WelcomeSection, FeatureCards, ProPlanRequired |
| Admin | `components/admin/` | AdminDashboardClient, DoctorsManagement, AddDoctorDialog, EditDoctorDialog, DoctorFormFields, RecentAppointments, AdminStats |
| Email | `components/emails/` | AppointmentConfirmationEmail (React Email template) |
| UI primitives | `components/ui/` | Full shadcn/ui component library (30+ components) |

### Client vs. Server Responsibilities
| Responsibility | Where |
|---|---|
| Data fetching (dashboard) | Server Action (`getDashboardData`) |
| Data fetching (appointments, doctors) | TanStack Query on client via Server Actions |
| Form state | `react-hook-form` + Zod (implicit via resolvers) |
| Toast notifications | `sonner` |
| Calendar / date picker | `react-day-picker` |
| Charts | `recharts` |
| Auth session | Clerk server SDK (`auth()`, `currentUser()`) in Server Actions and Pages |
| Plan entitlement check | Clerk `auth().has()` on server |

### Loading & Error States
Every protected route has a sibling `loading.tsx` (skeleton) and `error.tsx` (boundary with retry button). The dashboard additionally uses inline `<Suspense>` fallbacks for streaming.

---

## Backend Architecture

### Server Actions (`src/lib/actions/`)

| Action File | Functions | Auth Required |
|---|---|---|
| `users.ts` | `syncUser()` | Clerk `currentUser()` |
| `dashboard.ts` | `getDashboardData()` | Clerk `auth()` (throws if unauthenticated) |
| `appointments.ts` | `getAppointments()` · `getUserAppointments()` · `getUserAppointmentStats()` · `getBookedTimeSlots()` · `bookAppointment()` · `updateAppointmentStatus()` | User auth for user actions; admin email check for status update |
| `doctors.ts` | `getDoctors()` · `createDoctor()` · `updateDoctor()` · `getAvailableDoctors()` | Admin check via `verifyAdmin()` for mutations |

### API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/send-appointment-email` | POST | Clerk `auth()` required | Sends appointment confirmation email via Resend |

**Request body:**
```json
{
  "userEmail": "string",
  "doctorName": "string",
  "appointmentDate": "string",
  "appointmentTime": "string",
  "appointmentType": "string",
  "duration": "string",
  "price": "string"
}
```

### Validation

`bookAppointment` enforces server-side:
- All required fields present
- `time` must be one of 12 pre-defined slots
- `date` must not be in the past
- Doctor must exist and be `isActive: true`
- Slot must not already be booked (CONFIRMED or COMPLETED)

`createDoctor` / `updateDoctor` enforce:
- Admin authentication
- `name` and `email` required
- Unique email constraint (explicit check + Prisma P2002 catch)

---

## Database Architecture

### Entity-Relationship Diagram

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│     User     │ 1     * │   Appointment    │ *     1 │    Doctor    │
│──────────────│         │──────────────────│         │──────────────│
│ id (cuid)    │◄────────│ userId (FK)      │─────────►id (cuid)    │
│ clerkId      │         │ doctorId (FK)    │         │ name        │
│ email        │         │ date (DateTime)  │         │ email       │
│ firstName    │         │ time (String)    │         │ phone       │
│ lastName     │         │ duration (Int)   │         │ speciality  │
│ phone        │         │ status (enum)    │         │ bio         │
│ createdAt    │         │ notes            │         │ imageUrl    │
│ updatedAt    │         │ reason           │         │ gender      │
└──────────────┘         │ createdAt        │         │ isActive    │
                         │ updatedAt        │         │ createdAt   │
                         └──────────────────┘         └──────────────┘
```

### Enums

```prisma
enum AppointmentStatus { CONFIRMED  COMPLETED }
enum Gender            { MALE       FEMALE    }
```

### Indexes

| Model | Index | Purpose |
|---|---|---|
| Appointment | `userId` | User's own appointment list |
| Appointment | `doctorId` | Doctor's appointments |
| Appointment | `date` | Date range queries |
| Appointment | `status` | Status filter (admin) |
| Appointment | `[doctorId, date, status]` | Composite: slot conflict detection |
| Doctor | `isActive` | Active doctor queries |

### Data Access Patterns
- All DB access goes through Prisma Client — no raw SQL.
- The Prisma client is a singleton on `globalThis` to prevent connection pool exhaustion on serverless warm containers.
- Cascade deletes: deleting a User cascades to their Appointments; deleting a Doctor cascades to related Appointments.
- User data (PII) is stored: email, first name, last name, optional phone.

---

## Authentication & Authorization

### Authentication (Clerk)
- **Provider:** Clerk (`@clerk/nextjs` v6)
- **Session:** Clerk JWT, managed via edge middleware
- **Login methods:** Email/password, OAuth (configured in Clerk dashboard)
- **Sync:** On first authenticated visit, `syncUser()` upserts the Clerk user to PostgreSQL

### Authorization

| Level | Mechanism | Enforcement Point |
|---|---|---|
| Route protection | `clerkMiddleware` + `createRouteMatcher` | `src/middleware.ts` (edge) |
| Server action auth | `auth()` → throws if no session | Server actions |
| Admin mutation guard | `ADMIN_EMAIL` env var comparison | `verifyAdmin()` in `doctors.ts`, `isAdminUser()` in `appointments.ts` |
| Admin page guard | `currentUser()` + email check + `redirect()` | `admin/page.tsx` (SSR) |
| Plan entitlement | `auth().has({ plan: "..." })` | `voice/page.tsx` (SSR) |

### Protected Routes
`/dashboard/*` · `/appointments/*` · `/voice/*` · `/pro/*` · `/admin/*`

Unauthenticated requests to any protected route are redirected to Clerk sign-in by the middleware.

---

## AI Architecture

### Current Implementation

| Property | Value |
|---|---|
| Provider | [Vapi](https://vapi.ai) |
| SDK | `@vapi-ai/web` v2.5.2 (browser WebRTC) |
| Transport | Real-time WebRTC (browser ↔ Vapi cloud) |
| Assistant | Pre-configured assistant on Vapi dashboard (ID via `NEXT_PUBLIC_VAPI_ASSISTANT_ID`) |
| Access control | Server-side plan check (`auth().has({ plan: "ai_basic" | "ai_pro" })`) before widget renders |
| Client | `src/lib/vapi.ts` — singleton `Vapi` instance initialized with public API key |
| Widget | `components/voice/VapiWidget.tsx` — client component managing call state |

### Voice Call Flow
```
User (browser mic) ──WebRTC──► Vapi Cloud
                                   │
                           Pre-configured LLM
                           (dental-specialised prompt)
                                   │
Vapi Cloud ──WebRTC──► User speaker
                                   │
             speech-start/end/message events → VapiWidget state
```

### AI State Machine (VapiWidget)
```
idle → [Start Call] → connecting → call-start → callActive
callActive → [End Call / error] → callEnded → idle (button resets)
```

Event listeners: `call-start` · `call-end` · `speech-start` · `speech-end` · `message` · `error`

### AI Security Considerations
- ✅ Plan entitlement checked **server-side** before the widget is rendered — the API key never reaches unauthorized users
- ⚠️ `NEXT_PUBLIC_VAPI_API_KEY` is exposed in the browser bundle (required by WebRTC SDK) — Vapi's dashboard should restrict calls to allowed assistant IDs only
- ⚠️ No input content filtering or PII scrubbing before/after voice transmission — handled by Vapi's platform
- ⚠️ Conversation transcripts are held in React state only — not persisted to the database

### 🔮 AI Evolution Path (General Healthcare Platform)

| Concern | Recommended Approach |
|---|---|
| Provider abstraction | AI gateway module: route to Vapi, OpenAI Realtime, or custom LLM per specialty |
| Specialty routing | `specialtyId` on call session → selects correct assistant/prompt |
| Prompt versioning | Store prompt templates in DB with version and specialty tag |
| RAG grounding | Index clinical guidelines, formulary, patient history → embed + vector search |
| PII protection | Strip PII from transcript before any logging or LLM context injection |
| Audit trail | Persist call metadata (start, end, duration, plan, specialty) — not content |
| Human escalation | Trigger live-agent handoff when confidence < threshold or emergency keyword detected |
| Cost controls | Per-user monthly call-minute budget enforced at plan level |

---

## Integrations

| Service | Package | Purpose | Credential |
|---|---|---|---|
| Clerk | `@clerk/nextjs` | Authentication, session, plan management, PricingTable | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` |
| Neon PostgreSQL | `@prisma/client` + `pg` | Primary database (serverless Postgres) | `DATABASE_URL` |
| Vapi | `@vapi-ai/web` | WebRTC AI voice assistant | `NEXT_PUBLIC_VAPI_API_KEY` + `NEXT_PUBLIC_VAPI_ASSISTANT_ID` |
| Resend | `resend` + `@react-email/*` | Transactional appointment confirmation emails | `RESEND_API_KEY` |

---

## Project Structure

```
dentiva-ai/
├── prisma/
│   └── schema.prisma           # DB models: User · Doctor · Appointment
├── public/
│   ├── logo1.png               # App logo (used in voice widget)
│   ├── hero1.png · cta.png     # Landing page images
│   └── *.png                   # Feature / illustration assets
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root: ClerkProvider + TanStackProvider + Toaster
│   │   ├── page.tsx            # Landing / auth redirect
│   │   ├── globals.css         # Tailwind + CSS variables
│   │   ├── favicon.ico         # 48×48 optimized icon (5.7 KB)
│   │   ├── dashboard/          # Patient dashboard (Suspense streaming)
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx     # Skeleton fallback
│   │   │   └── error.tsx       # Error boundary + retry
│   │   ├── appointments/       # Booking flow (client-rendered)
│   │   ├── voice/              # AI voice (plan-gated)
│   │   ├── pro/                # Subscription pricing
│   │   ├── admin/              # Admin panel (email-restricted)
│   │   └── api/
│   │       └── send-appointment-email/route.ts  # Transactional email
│   ├── components/
│   │   ├── landing/            # Marketing sections
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── appointments/       # Booking wizard steps
│   │   ├── voice/              # Voice call UI
│   │   ├── admin/              # Admin management UI
│   │   ├── emails/             # React Email templates
│   │   ├── providers/          # TanStackProvider wrapper
│   │   ├── Navbar.tsx          # Shared navigation
│   │   └── ui/                 # shadcn/ui primitives (30+ components)
│   ├── hooks/
│   │   ├── use-appointment.ts  # TanStack Query: appointments
│   │   ├── use-doctors.ts      # TanStack Query: doctors
│   │   └── use-mobile.ts       # Responsive breakpoint hook
│   ├── lib/
│   │   ├── actions/
│   │   │   ├── appointments.ts # Booking, slot check, admin status update
│   │   │   ├── dashboard.ts    # Unified parallel dashboard action
│   │   │   ├── doctors.ts      # Doctor CRUD (admin-gated)
│   │   │   └── users.ts        # User sync (Clerk → DB)
│   │   ├── prisma.ts           # Singleton Prisma Client
│   │   ├── resend.ts           # Resend client singleton
│   │   ├── vapi.ts             # Vapi client singleton
│   │   └── utils.ts            # cn() · generateAvatar · time slots · appointment types
│   └── middleware.ts           # Clerk auth middleware + route matcher
├── .env.example                # Environment variable template (no secrets)
├── .gitignore                  # .env* excluded, .env.example included
├── biome.json                  # Biome linter/formatter config
├── next.config.ts              # Image optimization (AVIF/WebP), React Compiler
├── tsconfig.json
└── package.json
```

---

## Technology Stack

### Current Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.1 | Full-stack React framework (App Router, RSC, Server Actions) |
| React | 19.2.3 | UI rendering (with React Compiler beta) |
| TypeScript | 5.x | Static typing |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui (Radix UI) | — | Accessible UI component primitives |
| Clerk | 6.x | Authentication, session, subscription plans |
| Prisma | 6.x | ORM + schema migrations |
| Neon | — | Serverless PostgreSQL (via `DATABASE_URL`) |
| Vapi | 2.5.2 | WebRTC AI voice calls |
| TanStack Query | 5.x | Client-side data fetching + cache management |
| Resend | 6.x | Transactional email API |
| React Email | 1.x | Email template rendering |
| Biome | 2.2.0 | Linting + formatting (replaces ESLint + Prettier) |
| Lucide React | 0.451 | Icon library |
| Recharts | 2.x | Dashboard charts |
| Sonner | 2.x | Toast notifications |
| date-fns | 4.x | Date utilities |
| react-hook-form | 7.x | Form state management |
| zod | 4.x | Schema validation (used via `@hookform/resolvers`) |

### 🔮 Future Stack Additions

| Technology | Purpose |
|---|---|
| Redis (Upstash) | Rate limiting, session cache, queue-backed jobs |
| BullMQ | Background job processing (email queues, AI transcription) |
| AWS S3 / Cloudflare R2 | Patient file/document storage |
| OpenTelemetry | Distributed tracing |
| Sentry | Error tracking + performance monitoring |
| Datadog / Grafana | Observability dashboards |
| pgvector | Vector embeddings for clinical RAG |
| Feature flags (LaunchDarkly / Growthbook) | Controlled rollouts |

---

## Security

### ✅ Implemented Controls

| Control | Detail |
|---|---|
| Route authentication | Clerk middleware enforces auth on all private routes at the edge |
| Server action auth | Every mutating server action calls `auth()` and throws on missing session |
| Admin RBAC | `ADMIN_EMAIL` env var compared server-side; separate `verifyAdmin()` helper in every admin mutation |
| Plan entitlement | `auth().has()` checked server-side before voice widget is rendered |
| Email endpoint auth | `POST /api/send-appointment-email` requires valid Clerk session (401 if missing) |
| Input validation | `bookAppointment` validates time slot allowlist, past-date rejection, doctor existence, and slot availability |
| ORM safety | Prisma parameterised queries — no raw SQL injection surface |
| Secret boundary | `RESEND_API_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `ADMIN_EMAIL` are server-only; no `NEXT_PUBLIC_` prefix |
| `.env` git exclusion | `.env*` in `.gitignore`; `.env.example` committed with placeholders only |
| Cascade delete | User/Doctor delete cascades via FK, no orphaned appointment records |
| Favicon payload | Optimized to 5.7 KB (was 4.79 MB — removed massive unoptimized binary) |
| Image optimization | AVIF/WebP formats, remote pattern allowlist in `next.config.ts` |

---

## Security Gaps / Hardening Roadmap

| Gap | Risk | Recommended Fix |
|---|---|---|
| No rate limiting | Email endpoint or booking action can be called in a tight loop | Add Upstash Ratelimit or Next.js middleware-level rate limiting |
| No CSRF token on API route | POST `/api/send-appointment-email` relies on Clerk auth only — no SameSite enforcement beyond browser defaults | Add `SameSite=Strict` cookie policy or CSRF token validation |
| `NEXT_PUBLIC_VAPI_API_KEY` in browser bundle | API key visible to all users | Restrict key scope in Vapi dashboard to this assistant only; rotate periodically |
| Admin authorization by email string | Single-point misconfiguration risk; no audit of admin email changes | Migrate to Clerk `organizationRole` or a DB-backed `role` field; add admin activity audit log |
| No audit logging | Admin mutations (doctor create/update, status change) leave no persistent record | Log admin actions with `actorId`, `action`, `targetId`, `timestamp` to a separate `audit_log` table |
| No request body size limit | Malformed/large body on email API | Add `Content-Length` check or `bodyParser` size limit |
| `console.error` as only logging | No structured log aggregation in production | Add Pino or Winston with JSON log output; ship to Datadog/Loki |
| No HTTP security headers | `X-Frame-Options`, `CSP`, `Referrer-Policy` not set | Add `next.config.ts` `headers()` block |
| No input sanitization on `reason`/`notes` | Free-text stored and displayed; XSS risk in admin UI | Sanitize before DB write and before rendering |
| No pagination on admin appointments | `getAppointments()` capped at 100 rows — not paginated | Implement cursor-based pagination |
| No data encryption at rest | PII fields (email, phone) stored as plaintext | Use Prisma field-level encryption or Neon column encryption for PII fields |
| No session revocation | Clerk sessions are JWT — cannot be immediately invalidated server-side | Enable Clerk session revocation via server-side session management API |
| Healthcare data compliance readiness | No HIPAA BAA, no audit trail, no data retention policy implemented | Implement audit logs, data retention lifecycle, and consult legal before handling protected health information |

> ⚠️ **Note on compliance:** This application handles names, emails, and appointment metadata. It does **not** currently implement the technical, administrative, or physical safeguards required for HIPAA compliance. Do not store clinical records, diagnoses, or Protected Health Information (PHI) until appropriate controls are in place.

---

## Scalability & Maintainability

### Strengths
- App Router RSC + Server Actions eliminates unnecessary client bundle weight
- Parallel DB queries in `getDashboardData()` prevent sequential waterfall
- TanStack Query with per-key cache invalidation prevents stale UI
- Prisma composite indexes cover the critical slot-conflict query path
- Singleton Prisma client prevents connection pool exhaustion on serverless

### Current Bottlenecks

| Bottleneck | Detail |
|---|---|
| Synchronous email send | Email is sent inline in booking flow — a Resend failure blocks the response |
| No background job queue | All work is synchronous in server actions — no retry, no durable task |
| Single-tenant model | Doctor and appointment models have no clinic/tenant discriminator |
| No caching layer | All reads hit Neon directly — no Redis, no `unstable_cache` |
| No observability | No tracing, no structured logs, no uptime monitoring |
| No test coverage | Zero unit, integration, or E2E tests |

### Evolution Path

```
Current (V1)              Intermediate (V2)           Enterprise (V3)
─────────────────         ───────────────────────     ─────────────────────
Single clinic             Multi-clinic SaaS           Multi-tenant platform
Email env-var admin       Clerk org roles + DB RBAC   ABAC + policy engine
Synchronous email         BullMQ email queue          Async notification service
No cache                  Redis cache (Upstash)       CDN + edge cache
No tests                  Vitest unit + Playwright E2E Full CI/CD pipeline
No observability          Sentry + OpenTelemetry      Datadog + SLA monitoring
Single specialty          Multi-specialty routing     Specialty microservices
```

---

## Current Deployment

The application is deployed on **Netlify** (static + serverless functions).

- **Runtime:** Netlify Edge Functions via Next.js adapter
- **Build command:** `prisma generate && next build`
- **Start command:** `next start`
- **Database:** Neon PostgreSQL (serverless, connection pooling via `@prisma/adapter-pg`)
- **Environment:** Variables set in Netlify dashboard (not committed)
- **Images:** External domains allowlisted (`unsplash.com`, `avatar.iran.liara.run`, `img.clerk.com`)
- **No Docker, no Kubernetes, no CI/CD pipeline** currently configured

---

## Production Deployment Evolution

### 🔮 Recommended Production Architecture

```
┌─────────────────────────────────────┐
│           GitHub Actions CI/CD      │
│  lint → type-check → test → build  │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼──────────┐
    │    Vercel / Railway  │   ← Next.js runtime
    │    (Node.js 20+)     │
    └──────────┬───────────┘
               │
    ┌──────────▼───────────┐    ┌──────────────────┐
    │  Neon PostgreSQL      │    │  Upstash Redis   │
    │  + pgBouncer          │    │  (cache + rate   │
    │  (connection pool)    │    │   limit)         │
    └───────────────────────┘    └──────────────────┘
               │
    ┌──────────▼───────────┐
    │  AWS S3 / R2          │   ← Patient docs / assets
    └───────────────────────┘
```

| Concern | Recommendation |
|---|---|
| Secrets | Doppler or HashiCorp Vault — not platform env vars |
| CI/CD | GitHub Actions: Biome lint → `tsc --noEmit` → Vitest → Playwright → deploy |
| Database | Neon with pgBouncer for connection pooling; daily automated snapshots |
| Monitoring | Sentry (errors) + Vercel Analytics or Datadog |
| Rollback | Git-tag releases; Vercel instant rollback to previous deployment |
| Custom domain | Clerk domain allowlist updated; `NEXT_PUBLIC_APP_URL` set to production URL |
| Backups | Neon point-in-time recovery enabled; offsite backup to S3 weekly |
| CDN | Cloudflare in front of Vercel for DDoS mitigation + edge caching |

---

## Environment Configuration

Copy `.env.example` to `.env` and populate all values before running locally.

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk frontend key (safe to expose) |
| `CLERK_SECRET_KEY` | ✅ | Clerk server-side secret — never expose |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string with `sslmode=require` |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | ✅ | Vapi pre-configured assistant ID |
| `NEXT_PUBLIC_VAPI_API_KEY` | ✅ | Vapi public API key (browser-safe per Vapi's model) |
| `ADMIN_EMAIL` | ✅ | Email of the admin user — server-only, never expose |
| `RESEND_API_KEY` | ✅ | Resend API key — server-only, never expose |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL for email links (set to production URL in prod) |

> 🔴 **Important:** Set `NEXT_PUBLIC_APP_URL` to your production domain (`https://your-domain.com`) — the default points to `localhost:3000` which will produce broken email links in production.

---

## Local Development

### Prerequisites
- Node.js 20+
- npm / pnpm / yarn
- A Neon PostgreSQL database (free tier available)
- Clerk account (free tier available)
- Vapi account (optional — voice feature is plan-gated)
- Resend account (optional — email feature)

### Installation

```bash
git clone https://github.com/amandubey923/dentiva-ai.git
cd dentiva-ai
npm install
cp .env.example .env
# Fill in .env values
```

### Development Server

```bash
npm run dev
# App runs at http://localhost:3000
```

### Lint & Format

```bash
npm run lint      # Biome check
npm run format    # Biome format (writes files)
```

### Type Check

```bash
npx tsc --noEmit
```

---

## Database Setup

### First-time setup (create tables)

```bash
npx prisma db push
```

### Generate Prisma client (after schema changes)

```bash
npx prisma generate
```

### Inspect data

```bash
npx prisma studio
```

> ⚠️ Never run `prisma migrate reset` in production — it drops and recreates all tables.

---

## API / Server Actions

### `POST /api/send-appointment-email`

- **Auth:** Clerk session required
- **Body:** `{ userEmail, doctorName, appointmentDate, appointmentTime, appointmentType?, duration?, price? }`
- **Response 200:** `{ message: "Email sent successfully", emailId: string }`
- **Response 400:** `{ error: "Missing required fields" }`
- **Response 401:** `{ error: "Unauthorized" }`
- **Response 500:** `{ error: "Failed to send email" }`

### Server Actions (called directly from client components via TanStack Query)

| Action | Auth | Description |
|---|---|---|
| `syncUser()` | Optional (no-op if unauthenticated) | Upserts Clerk user to DB |
| `getDashboardData()` | Required | Parallel fetch of user, stats, appointments |
| `getUserAppointments()` | Required | User's full appointment list |
| `getUserAppointmentStats()` | Required | Total and completed counts |
| `getBookedTimeSlots(doctorId, date)` | None | Booked slots for a doctor+date |
| `bookAppointment(input)` | Required | Validated appointment creation |
| `getAppointments()` | Admin | All appointments (max 100) |
| `updateAppointmentStatus(input)` | Admin | Toggle CONFIRMED ↔ COMPLETED |
| `getDoctors()` | None | All doctors with appointment count |
| `getAvailableDoctors()` | None | Active doctors only |
| `createDoctor(input)` | Admin | Create doctor record |
| `updateDoctor(input)` | Admin | Update doctor record |

---

## Testing / Quality

| Area | Status | Notes |
|---|---|---|
| Unit tests | ❌ None | No test files found |
| Integration tests | ❌ None | — |
| E2E tests | ❌ None | — |
| Type safety | ✅ TypeScript strict | `tsc --noEmit` passes clean |
| Lint | ✅ Biome 2.2 | Recommended rules + Next.js + React domains |
| Format | ✅ Biome | 2-space indent |
| Build verification | ✅ | `npx next build` passes with 0 errors |

> **Priority testing targets:** booking flow (race condition guard), admin authorization, dashboard data fetching, email delivery.

---

## Observability

| Area | Status |
|---|---|
| Structured logging | ⚠️ `console.error` only |
| Error tracking | ❌ Not configured |
| Performance monitoring | ❌ Not configured |
| Uptime monitoring | ❌ Not configured |
| Database query logging | ⚠️ Dev: warn+error; Prod: error only (Prisma `log`) |

**Recommended:** Add Sentry (`@sentry/nextjs`) for error tracking and performance traces. Add Pino for structured JSON logging compatible with Datadog/Loki.

---

## Healthcare Data & Privacy Considerations

| Data Stored | Location | Classification |
|---|---|---|
| Name (first, last) | PostgreSQL `users` table | PII |
| Email address | PostgreSQL `users` table | PII |
| Phone number | PostgreSQL `users` table | PII |
| Appointment date/time/reason | PostgreSQL `appointments` table | PII + soft-clinical |
| Voice conversation content | React state only (not persisted) | Clinical (transient) |
| Doctor information | PostgreSQL `doctors` table | Non-PII |

**Current posture:**
- PII is stored in plaintext — no field-level encryption
- No data retention or deletion policy implemented
- No patient consent or data processing agreement flow
- Voice calls are not recorded or stored by the application (Vapi handles transport)
- This application is **not HIPAA compliant** in its current form

**Before handling Protected Health Information (PHI):**
- Obtain a HIPAA Business Associate Agreement (BAA) with Clerk, Neon, Resend, and Vapi
- Implement audit logging, data retention policies, breach notification procedures
- Encrypt PII fields at rest
- Add patient consent management

---

## Future General Healthcare Platform Architecture

### 🔮 Domain Architecture (Multi-tenant SaaS)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Healthcare Platform SaaS                     │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Auth Domain  │ Patient Domain│ Provider Domain│ AI Domain        │
│ Clerk Orgs    │ Records       │ Schedules      │ Vapi gateway     │
│ RBAC roles    │ Appointments  │ Availability   │ Specialty routing│
│ Plan mgmt     │ Documents     │ Credentials    │ Prompt versioning│
└──────────────┴──────────────┴──────────────┴────────────────────┘
          │               │              │              │
          └───────────────┼──────────────┼──────────────┘
                          │              │
                 ┌────────▼──────────────▼────────┐
                 │      Shared Infrastructure      │
                 │  Postgres · Redis · S3 · Queue  │
                 └────────────────────────────────┘
```

### Key Architectural Changes Required

| Concern | Change |
|---|---|
| Multi-tenancy | Add `organizationId` / `clinicId` to `Doctor`, `Appointment`, `User` — enforce at query level |
| RBAC | Replace email-string admin check with Clerk `organizationRole` (`admin`, `doctor`, `staff`, `patient`) |
| Audit log | New `AuditLog` table: `actorId`, `action`, `resource`, `resourceId`, `meta`, `timestamp` |
| Specialty | Add `Specialty` model; Doctors belong to specialties; AI assistants are specialty-scoped |
| Availability | Add `DoctorSchedule` model for configurable working hours, not hardcoded time slots |
| Files | Add `Document` model referencing S3 keys; patient can upload referral/insurance docs |
| Notifications | Notification service: queue-backed, multi-channel (email, SMS, push) |
| Background jobs | BullMQ workers for: email delivery, reminder scheduling, AI transcript archiving |
| Search | Full-text search on doctors/appointments; vector search for clinical knowledge base |
| Feature flags | LaunchDarkly or Growthbook for specialty rollouts, A/B experiments |
| API layer | Move from Server Actions to a typed REST or tRPC API for mobile/partner integrations |

---

## Roadmap

### ✅ Completed (V1 Hardening)
- Route authentication middleware
- Server-side appointment validation
- Admin mutation authorization
- Parallelised dashboard action
- Suspense streaming dashboard
- Database performance indexes
- Email endpoint authentication
- Favicon optimization (4.79 MB → 5.7 KB)
- Loading + error boundaries for all routes
- Voice call reconnect fix
- TanStack Query cache key correctness

### 🔮 Planned

**Short-term (V1.1)**
- [ ] HTTP security headers (`CSP`, `X-Frame-Options`, `Referrer-Policy`)
- [ ] Rate limiting on booking + email endpoints
- [ ] Pagination on admin appointment list
- [ ] Unit tests (Vitest) for server actions
- [ ] E2E tests (Playwright) for booking flow
- [ ] Sentry integration

**Medium-term (V2)**
- [ ] Multi-clinic / multi-tenant data model
- [ ] Clerk organization roles (admin, doctor, staff, patient)
- [ ] Doctor availability schedule management
- [ ] Audit log table
- [ ] Background job queue (email, reminders)
- [ ] Patient document upload (S3)
- [ ] SMS appointment reminders

**Long-term (V3 — General Healthcare Platform)**
- [ ] Multi-specialty AI routing
- [ ] Clinical RAG (vector search over guidelines)
- [ ] Mobile app (React Native / Expo)
- [ ] HL7 FHIR API for EHR integration
- [ ] HIPAA compliance readiness (with legal counsel)
- [ ] Partner/B2B API (REST + tRPC)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make changes, ensure `npx tsc --noEmit` and `npm run lint` pass
4. Run `npx next build` to verify no build errors
5. Commit: `git commit -m "feat: describe your change"`
6. Push and open a pull request

Please do not commit `.env` or any real credentials. Use `.env.example` to document new variables.

---

## License

Private repository. All rights reserved.

---

## Author / Project Links

| | |
|---|---|
| **Author** | Aman Kumar Dubey |
| **Live App** | https://dentiva-ai-aman.netlify.app |
| **Repository** | https://github.com/amandubey923/dentiva-ai |
| **Stack** | Next.js 16 · React 19 · Clerk · Prisma · Neon · Vapi · Resend · Tailwind 4 |
