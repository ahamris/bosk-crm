# BOSK CRM — Beauty & Skin Clinic Gouda

## Project Overview

**Client**: BOSK — Schoonheidssalon & Huidkliniek, Gouda
**Type**: SaaS CRM — appointment scheduling, POS, client management, marketing
**Languages**: Nederlands (primary), English, Русский (Russian)
**Inspired by**: [Salonized](https://www.salonized.com/en/features) — feature parity + clinic-specific additions

## Tech Stack

| Component       | Technology                                          |
|-----------------|-----------------------------------------------------|
| Backend         | Laravel 13, PHP 8.4 (API-first, geen Blade)         |
| Frontend        | React 19 + Vite + TypeScript                        |
| UI Kit          | @opencivics/ui (Catalyst + Tailwind)                |
| Database        | PostgreSQL 16                                       |
| Cache/Queue     | Redis 7                                             |
| Search          | Typesense 27.1 (via Laravel Scout)                  |
| Auth            | Laravel Sanctum + Spatie Permissions (RBAC)          |
| i18n            | Backend: Laravel Lang, Frontend: react-i18next       |
| API Docs        | OpenAPI 3.1 (dedoc/scramble)                         |
| Payments        | Mollie (iDEAL, cards, Apple/Google Pay)              |
| SMS/Email       | Resend (email) + MessageBird (SMS)                   |
| Calendar Sync   | Google Calendar API (two-way)                        |
| Monitoring      | Laravel Pulse + Horizon                              |

## Infrastructure

| Parameter       | Value                                               |
|-----------------|-----------------------------------------------------|
| Host            | Proxmox homelab (`172.24.0.251`)                    |
| VMID            | **300**                                             |
| Hostname        | `bosk-crm`                                          |
| IP              | `172.24.0.30`                                       |
| OS              | Ubuntu 24.04 LTS                                    |
| Resources       | 4 cores, 4GB RAM, 2GB swap, 32GB ZFS                |
| Storage         | `zfs-pve-01`                                        |

---

## Feature Roadmap

### Phase 1 — Foundation (Sprint 1-2)

#### 1.1 Authentication & Multi-tenancy
- [ ] Sanctum API auth (login, register, forgot password)
- [ ] RBAC: Owner, Manager, Employee, Receptionist
- [ ] Multi-location support (single account, multiple salons)
- [ ] 2FA (TOTP)
- [ ] User activity audit log (Spatie Activitylog)

#### 1.2 i18n — Trilingual Support
- [ ] Laravel Lang + JSON translation files (nl, en, ru)
- [ ] react-i18next with namespace-per-module
- [ ] Language switcher in UI (flag selector)
- [ ] RTL-ready layout (future-proof)
- [ ] Locale-aware date/time/currency formatting

#### 1.3 Staff Management
- [ ] Employee profiles (name, photo, bio, specializations)
- [ ] Working hours & availability per employee
- [ ] Multi-location scheduling (employee works at multiple locations)
- [ ] Role-based calendar views (restrict what employees see)
- [ ] Employee performance dashboard (revenue, clients, hours)

---

### Phase 2 — Core Scheduling (Sprint 3-4)

#### 2.1 Service Catalog
- [ ] Services CRUD (name, duration, price, category, description)
- [ ] Service categories (Skin treatments, Beauty, Wellness, etc.)
- [ ] Processing & buffer time per service
- [ ] Room/equipment requirements per service
- [ ] Service availability rules (days, times, booking limits)
- [ ] Trilingual service descriptions

#### 2.2 Online Calendar
- [ ] Drag-and-drop calendar (day/week/employee/room views)
- [ ] Double-booking prevention
- [ ] Recurring appointments
- [ ] Google Calendar two-way sync
- [ ] Calendar sharing (iCal export)
- [ ] Color-coded by service type / employee
- [ ] Calendar preview toggle while booking

#### 2.3 Online Booking Widget
- [ ] Embeddable booking widget (iframe + JS snippet)
- [ ] 24/7 self-service booking
- [ ] Service → employee → date/time flow
- [ ] Automatic confirmation emails (trilingual)
- [ ] Online rescheduling & cancellation
- [ ] Booking terms checkbox
- [ ] Client notes during booking
- [ ] Employee availability view (next available dates)
- [ ] Reserve with Google integration

---

### Phase 3 — Client Management (Sprint 5-6)

#### 3.1 CRM / Client Profiles
- [ ] Client database with Typesense search (name, email, phone)
- [ ] Visit history & payment history timeline
- [ ] Before/after photo gallery per client
- [ ] Consultation notes per visit
- [ ] Client tags & segments (VIP, new, inactive, etc.)
- [ ] Client activity log
- [ ] GDPR data export & deletion

#### 3.2 Digital Forms
- [ ] Intake/consultation form builder (drag-and-drop)
- [ ] Pre-appointment form sending (email link)
- [ ] Medical history forms (skin clinic specific)
- [ ] Consent forms with digital signature
- [ ] Allergy & contraindication tracking
- [ ] Form templates library (trilingual)

#### 3.3 Communication
- [ ] Automated appointment reminders (email + SMS)
- [ ] Customizable reminder timing (24h, 2h before)
- [ ] Birthday messages (auto-send)
- [ ] Post-appointment feedback requests
- [ ] Two-way SMS (future)

---

### Phase 4 — Sales & Inventory (Sprint 7-8)

#### 4.1 Point of Sale (POS)
- [ ] Digital cash register
- [ ] Service + product checkout in one transaction
- [ ] Mollie payment integration (iDEAL, cards, contactless)
- [ ] Automated invoices & digital receipts (trilingual)
- [ ] Daily income tracking & end-of-day reconciliation
- [ ] Barcode scanner support
- [ ] Tip handling
- [ ] Split payments

#### 4.2 Gift Cards & Prepaid
- [ ] Gift voucher creation & redemption
- [ ] Online gift card sales widget
- [ ] Prepaid/credit cards (buy €100, get €110)
- [ ] Voucher balance tracking
- [ ] Expiration management

#### 4.3 Inventory Management
- [ ] Product catalog (brands, categories, SKUs)
- [ ] Stock tracking (min/max thresholds)
- [ ] Automated reorder suggestions
- [ ] Supplier management & email ordering
- [ ] Product sales per employee reporting
- [ ] Stock value reporting

---

### Phase 5 — Marketing & Loyalty (Sprint 9-10)

#### 5.1 Loyalty Program
- [ ] Points-based rewards system (configurable earn/redeem rates)
- [ ] Digital loyalty cards
- [ ] Tier system (Bronze, Silver, Gold, Platinum)
- [ ] Points redemption at checkout
- [ ] Loyalty dashboard for clients

#### 5.2 Marketing Tools
- [ ] Email newsletter builder (drag-and-drop, trilingual)
- [ ] Client segmentation (filters: last visit, service type, spend)
- [ ] Rebook reminders (automated after X days)
- [ ] Last-minute discount slots (fill empty calendar gaps)
- [ ] Dynamic pricing (off-peak/premium hours)
- [ ] Discount codes (percentage / fixed amount)
- [ ] Waiting list (per service/date)

#### 5.3 Reviews & Reputation
- [ ] Post-visit feedback collection (1-5 stars + comment)
- [ ] Review widget for website embedding
- [ ] Google Reviews integration (push satisfied clients)
- [ ] Review response from dashboard

---

### Phase 6 — Reporting & Analytics (Sprint 11-12)

#### 6.1 Business Reports
- [ ] Revenue dashboard (daily/weekly/monthly/yearly)
- [ ] Period-to-period comparison
- [ ] Revenue by service, employee, location
- [ ] Occupancy rate (booked hours vs available hours)
- [ ] No-show & cancellation rates
- [ ] New vs returning client ratio
- [ ] Daily email summary report

#### 6.2 Employee Reports
- [ ] Revenue per employee
- [ ] Services performed per employee
- [ ] Product sales per employee
- [ ] Client retention per employee
- [ ] Working hours & utilization

#### 6.3 Client Analytics
- [ ] Client lifetime value (CLV)
- [ ] Visit frequency analysis
- [ ] Service preferences
- [ ] Churn risk detection
- [ ] Acquisition source tracking

---

### Phase 7 — Clinic-Specific Features (Sprint 13-14)

> Differentiators beyond Salonized — specific to skin clinics

#### 7.1 Treatment Plans
- [ ] Multi-session treatment plans (e.g., 6x laser, 4x peel)
- [ ] Treatment progress tracking with photos
- [ ] Automatic next-session scheduling
- [ ] Treatment plan pricing (package deals)
- [ ] Medical contraindication warnings

#### 7.2 Skin Analysis
- [ ] Skin type assessment forms
- [ ] Product recommendation engine based on skin profile
- [ ] Before/after comparison viewer (side-by-side)
- [ ] Treatment outcome tracking

#### 7.3 Compliance (Skin Clinic)
- [ ] Medical disclaimer management
- [ ] Informed consent per treatment type
- [ ] Patch test tracking & reminders
- [ ] Incident reporting

---

## API Structure

```
/api/v1/
├── auth/                    # Login, register, 2FA, password reset
├── users/                   # Staff management
├── locations/               # Multi-location management
├── services/                # Service catalog
├── appointments/            # Calendar & bookings
├── clients/                 # CRM
├── forms/                   # Digital forms & consents
├── pos/                     # Point of sale & transactions
├── inventory/               # Products & stock
│   ├── products/
│   ├── suppliers/
│   └── orders/
├── vouchers/                # Gift cards & prepaid
├── loyalty/                 # Points & rewards
├── marketing/               # Campaigns, newsletters, discounts
│   ├── campaigns/
│   ├── segments/
│   └── discounts/
├── reviews/                 # Feedback & reviews
├── reports/                 # Analytics & exports
├── treatments/              # Treatment plans (clinic-specific)
├── search/                  # Typesense search
├── booking/                 # Public booking widget API
└── webhooks/                # Mollie, Google Calendar, etc.
```

## Frontend Structure

```
src/
├── components/              # Shared UI components
├── layouts/                 # App shell, sidebar, public
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── calendar/
│   ├── clients/
│   ├── services/
│   ├── pos/
│   ├── inventory/
│   ├── marketing/
│   ├── reports/
│   ├── treatments/
│   └── settings/
├── features/                # Feature-specific logic
├── hooks/
├── services/                # API clients
├── i18n/
│   ├── nl/                  # Nederlands
│   ├── en/                  # English
│   └── ru/                  # Русский
├── types/
└── stores/                  # Zustand state
```

## Database Key Models

```
users, locations, user_locations (pivot)
services, service_categories, rooms, equipment
appointments, recurring_rules, appointment_services
clients, client_notes, client_photos, client_tags
forms, form_fields, form_submissions
transactions, transaction_items, invoices
products, product_categories, suppliers, stock_movements
vouchers, prepaid_cards
loyalty_points, loyalty_tiers, loyalty_redemptions
campaigns, segments, discount_codes
reviews, review_responses
treatment_plans, treatment_sessions, treatment_photos
```

## Development Workflow

1. **Plan** — Feature spec + API design
2. **Verify** — Review with stakeholder
3. **Act** — Implement (API → Frontend → i18n)
4. **Test** — Pest tests per user story
5. **Release** — Deploy to `bosk-crm` LXC (172.24.0.30)

## Quick Start

```bash
# SSH into container
ssh root@172.24.0.30

# Stack install (to be automated)
# PHP 8.4, PostgreSQL 16, Redis 7, Typesense, Nginx, Node 22
```
