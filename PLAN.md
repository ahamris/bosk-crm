# BOSK CRM — Beauty & Skin Clinic Gouda

## Project Overview

**Client**: BOSK — Schoonheidssalon & Huidkliniek, Gouda
**Type**: SaaS CRM — appointment scheduling, client management, invoicing via Moneybird
**Languages**: Nederlands (primary), English, Русский (Russian)
**Inspired by**: [Salonized](https://www.salonized.com/en/features)

## Tech Stack

| Component       | Technology                                          |
|-----------------|-----------------------------------------------------|
| Backend         | Laravel 13, PHP 8.4 (API-first)                     |
| Frontend        | React 19 + Vite + TypeScript + Tailwind CSS v4      |
| Database        | PostgreSQL 16                                       |
| Cache/Queue     | Redis 7                                             |
| Search          | Typesense 27.1 (via Laravel Scout)                  |
| Auth            | Laravel Sanctum + Spatie Permissions (RBAC)          |
| i18n            | Laravel Lang + react-i18next                         |
| Invoicing       | Moneybird (native API integration)                   |
| API Docs        | OpenAPI 3.1 (dedoc/scramble)                         |

## Infrastructure

| Parameter       | Value                                               |
|-----------------|-----------------------------------------------------|
| Host            | Proxmox homelab (`172.24.0.251`)                    |
| VMID            | **300** (`bosk-crm`)                                |
| IP              | `172.24.0.30`                                       |
| OS              | Ubuntu 24.04 LTS                                    |
| Resources       | 4 cores, 4GB RAM, 2GB swap, 32GB ZFS                |

---

## UX Design Principles

> These rules apply to ALL pages. No exceptions.

### 1. No Popups for CRUD
- **Modals/popups** are ONLY for confirmations, alerts, and notifications
- **SlidePanel** (slides in from the right) for quick create/edit forms
- **Full pages** for detailed create/edit/view with all fields

### 2. Navigation Patterns
| Action       | UI Pattern                                     |
|-------------|------------------------------------------------|
| Quick create | SlidePanel (right side, 400px)                |
| Quick edit   | SlidePanel (right side, 400px)                |
| Full create  | Dedicated page `/services/new`                |
| Full edit    | Dedicated page `/services/:id/edit`           |
| View detail  | Dedicated page `/services/:id`                |
| Delete       | Confirmation dialog (modal OK here)           |
| Status change| Inline button / SlidePanel                    |

### 3. Calendar Views
The calendar supports 3 views, switchable via tabs:
- **Week view** — Traditional time grid (columns = days, rows = hours)
- **List view** — Chronological list of appointments for selected date/range
- **Kanban view** — Columns by status (Scheduled → Confirmed → In Progress → Completed)

### 4. Component Architecture
```
src/components/
├── ui/                    # Atomic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Table.tsx
│   ├── SlidePanel.tsx     # Right-side panel for quick edits
│   ├── ConfirmDialog.tsx  # Only modal — for delete/destructive actions
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── LanguageSwitcher.tsx
├── layout/
│   ├── AppLayout.tsx
│   ├── AuthLayout.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
```

---

## Data Model

### Users & Roles
```
users (id, name, email, password, type: 'staff'|'freelancer')
  → RBAC roles: owner, manager, employee, receptionist, freelancer
  → employee_profiles (bio, specializations, avatar, is_active)
  → working_hours (per location, per day)
```

### Staff vs Freelancers
| Field          | Staff Employee           | Freelancer                    |
|---------------|--------------------------|-------------------------------|
| Type          | `staff`                   | `freelancer`                  |
| Schedule      | Fixed working hours       | Sets own availability         |
| Pay           | Salary (external)         | Per-appointment commission     |
| Locations     | Assigned by manager       | Chooses where to work         |
| Dashboard     | Sees own appointments     | Sees own + can accept/decline |

### Reviews
```
reviews (id, client_id, appointment_id, employee_user_id, rating 1-5, 
         comment, is_published, created_at)
```
- Clients leave reviews after completed appointments
- Auto-request via email (future)
- Published reviews visible on booking widget + employee profile
- Average rating shown on employee cards

---

## Route Structure

### Frontend Routes
```
/                           Dashboard
/calendar                   Calendar (week/list/kanban views)
/appointments/new           Create appointment (full page)
/appointments/:id           View appointment detail
/appointments/:id/edit      Edit appointment

/clients                    Client list
/clients/new                Create client (full page)
/clients/:id                Client detail (info + history + notes)
/clients/:id/edit           Edit client

/services                   Service list (grouped by category)
/services/new               Create service (full page)
/services/:id               Service detail
/services/:id/edit          Edit service

/employees                  Employee/freelancer list
/employees/new              Add employee
/employees/:id              Employee profile (schedule + reviews)
/employees/:id/edit         Edit employee

/invoices                   Invoice list
/invoices/:id               Invoice detail

/reviews                    Review management

/settings                   General settings
/integrations               Integration marketplace
/ai                         AI Assistant

/booking/:locationId        Public booking (no auth)
/login                      Login
/register                   Register
```

### API Routes (64+)
```
/api/v1/
├── auth/                    login, register, logout, me
├── dashboard
├── locations/               CRUD
│   └── {location}/
│       ├── services/        CRUD
│       ├── clients/         CRUD
│       │   └── {client}/notes/  CRUD
│       ├── appointments/    CRUD + transition
│       └── invoices/        CRUD + send + mark-paid
├── service-categories/      CRUD (with nested services)
├── employees/               list, show, availability
│   └── {employee}/working-hours/  CRUD
├── reviews/                 CRUD + publish/unpublish
├── integrations/            CRUD + test + sync
├── booking/{location}/      public: services, availability, book
└── search/                  Typesense (future)
```

---

## Feature Status

### Phase 1 — Foundation ✅
- [x] Sanctum auth (login, register, logout, me)
- [x] RBAC: Owner, Manager, Employee, Receptionist
- [x] Multi-location support
- [x] i18n: NL, EN, RU with react-i18next
- [x] User activity audit log (Spatie Activitylog)

### Phase 2 — Core Scheduling ✅
- [x] Service catalog (10 services, 3 categories, trilingual)
- [x] Online calendar — week view, list view, kanban view
- [x] Drag-and-drop appointment reschedule (@dnd-kit)
- [x] Appointment CRUD with status machine
- [x] Online booking widget (4-step public wizard)
- [x] SlidePanel/Sheet for quick appointment edits

### Phase 3 — Client Management ✅
- [x] Client full CRUD pages (list/create/edit/detail)
- [x] 20+ fields (contact, address, medical, skin type, Moneybird fields)
- [x] Client notes (add/delete, private flag)
- [x] Communication log (call/email/sms/whatsapp)
- [x] Visit history on client detail

### Phase 4 — Moneybird Integration ✅
**Architecture: BOSK = booking + workflow + analytics. Moneybird = accounting truth.**
- [x] Full field mapping (company, address, tax, KvK, IBAN, delivery method)
- [x] Auto-sync: client create/update → Moneybird contact (ClientObserver)
- [x] Auto-invoice: appointment completed → invoice → Moneybird → email to client (AppointmentObserver)
- [x] Webhook receiver: Moneybird payment → BOSK invoice status update + notification
- [x] Auto-register webhook when integration activated
- [x] Integration marketplace UI (Moneybird, Mollie, Google Cal, Mailchimp)
- [ ] Invoice PDF download (from Moneybird API)
- [ ] Bidirectional contact sync (Moneybird → BOSK via webhook)

### Phase 5 — Employee & Freelancer Management ✅
- [x] Employee list with cards, filter tabs (All/Staff/Freelancers)
- [x] Employee detail (Profile, Schedule, Reviews, Performance tabs)
- [x] Staff vs freelancer types
- [x] Working hours CRUD (bulk update API)
- [x] Employee create/edit pages
- [ ] Commission tracking for freelancers
- [ ] Freelancer self-service portal

### Phase 6 — Reviews & Reputation ✅
- [x] Review model + API (CRUD, 15 seeded)
- [x] Reviews management page with star ratings, publish toggle
- [x] Average rating on employee cards + detail
- [x] Public endpoint for booking widget
- [ ] Post-appointment auto review request (email)

### Phase 7 — UX & Design System ✅
- [x] @opencivics/ui (64 components) ported
- [x] Sheet/SlidePanel, ConfirmDialog
- [x] Full CRUD pages for all entities
- [x] Calendar: week + list + kanban + drag-drop

### Phase 8 — Notifications ✅
- [x] Bell icon + red badge + dropdown + mark read
- [x] 5 types: new_booking, new_review, reminder, cancelled, payment_received
- [x] Auto-refresh every 30s
- [ ] Real-time push (WebSocket)

### Phase 9 — Public Pages & Business Logic (Treatwell-inspired) 🚧

#### 9.1 Business Logic — Policies & Rules
```
booking_settings (per location):
  cancellation_window_hours: 24      # Free cancel before X hours
  late_cancel_charge_percent: 100    # Charge % for late cancel
  no_show_charge_percent: 100        # Charge % for no-show
  max_pay_at_venue_bookings: 3       # Limit concurrent PAV bookings
  require_deposit: false             # Require deposit on booking
  deposit_percent: 50                # Deposit amount %
  min_booking_notice_hours: 1        # Minimum advance booking time
  max_booking_advance_days: 90       # How far ahead can book
  auto_confirm: true                 # Auto-confirm or manual review
  cancellation_policy_text_nl/en/ru  # Custom policy text
```

- [ ] Booking settings model + API (per location)
- [ ] No-show tracking (auto-flag serial no-shows)
- [ ] Late cancellation enforcement (charge logic)
- [ ] Deposit/prepay rules for flagged clients
- [ ] Cancellation window validation on booking cancel

#### 9.2 Public Landing Page (`/`)
Treatwell-inspired homepage for BOSK Gouda:
- [ ] Hero section: clinic name, tagline, search/CTA button
- [ ] Trending treatments carousel (top 6 services)
- [ ] 3-column benefits (Professional care, Book 24/7, Trusted reviews)
- [ ] Team showcase (employee cards with ratings)
- [ ] Reviews carousel (latest published reviews)
- [ ] Service categories grid with icons
- [ ] Opening hours + location map
- [ ] Footer: contact, policies, social links

#### 9.3 Public Salon/Venue Page (`/salon/:slug`)
Full venue page (like Treatwell place page):
- [ ] Photo gallery (clinic images)
- [ ] Salon info header (name, rating, review count, address)
- [ ] Service menu (collapsible categories, price, duration, "Select" buttons)
- [ ] Meet the team (staff cards with individual ratings + specializations)
- [ ] Reviews section (filterable by service type, star rating)
- [ ] About section (clinic description, trilingual)
- [ ] Opening hours (day-by-day grid)
- [ ] Location + map
- [ ] Amenities/features (wheelchair, WiFi, parking, etc.)
- [ ] Booking CTA (sticky on mobile)

#### 9.4 Enhanced Booking Flow
Upgrade from current 4-step wizard:
- [ ] Multi-service cart (add multiple services to one booking)
- [ ] Service packages (bundled services at discount)
- [ ] Staff selection with individual availability + ratings
- [ ] Cancellation policy display before confirmation
- [ ] Terms & conditions checkbox
- [ ] Marketing consent checkbox (GDPR)
- [ ] Booking confirmation page with reference number
- [ ] "Pay at venue" vs "Pay online" options (future: Mollie)

#### 9.5 SEO & Public Routes
```
/                         Public landing page
/salon/:slug              Venue/salon page
/salon/:slug/services     Service menu (deep link)
/salon/:slug/reviews      Reviews page
/salon/:slug/team         Team page
/booking/:locationId      Booking wizard (existing, enhanced)
```

### Future Phases
- [ ] Reporting & analytics (revenue dashboards, Recharts)
- [ ] Marketing & loyalty (newsletters, points, discount codes, referrals)
- [ ] Treatment plans (multi-session, skin clinic)
- [ ] AI real integration (scheduling, insights)
- [ ] SMS/email reminders
- [ ] Google Calendar sync
- [ ] Typesense search
- [ ] Mobile PWA
- [ ] Gift cards (purchase + redeem)
- [ ] Online payments (Mollie: iDEAL, card, Apple Pay)

---

## Business Logic Detail

### Booking Lifecycle
```
Client selects service(s) → Picks employee + time → Enters details
  → Accepts policies → Confirms booking
    → Status: SCHEDULED
      → Auto-confirm or manual review
        → CONFIRMED
          → Reminder sent (24h before)
            → Client arrives → IN_PROGRESS → COMPLETED
              → Auto-invoice → Moneybird → Email → Payment
              → Auto-request review (24h after)
            → Client doesn't arrive → NO_SHOW
              → Flag client → Charge card (if prepaid)
          → Client cancels (before window) → CANCELLED (free)
          → Client cancels (after window) → CANCELLED (charged)
```

### No-Show Policy
- First no-show: warning notification to client
- Second no-show: flagged, future bookings require deposit
- Third no-show: flagged as "require prepayment"
- Admin can override flags manually

### Cancellation Logic
```
if (now < appointment.starts_at - location.cancellation_window_hours):
    → Free cancellation
else:
    → Late cancellation
    → Charge: service.price * location.late_cancel_charge_percent / 100
    → If Moneybird active: auto-create cancellation invoice
```

---

## Development Workflow

1. **Plan** — Feature spec + API design
2. **Verify** — Review with stakeholder
3. **Act** — Implement (API → Frontend → i18n)
4. **Test** — Full CRUD test per feature
5. **Release** — Build, deploy to LXC 300 (172.24.0.30)
