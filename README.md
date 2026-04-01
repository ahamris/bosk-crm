# BOSK CRM

> Beauty & Skin Clinic Management — Gouda, Nederland

Modern CRM platform for beauty salons and skin clinics. Appointment scheduling, client management, POS, marketing, and clinic-specific treatment tracking.

## Features

- **Online Calendar** — Drag-and-drop scheduling with day/week/employee/room views
- **Online Booking** — 24/7 self-service booking widget, embeddable on any website
- **Client Management** — Profiles, visit history, before/after photos, consultation notes
- **Service Catalog** — Categories, pricing, duration, buffer times, room/equipment allocation
- **Point of Sale** — Checkout, Mollie payments (iDEAL, cards), invoices, receipts
- **Staff Management** — Roles, availability, multi-location scheduling, performance tracking
- **Inventory** — Products, stock tracking, automated reorder, supplier management
- **Marketing** — Newsletters, segmentation, rebook reminders, discount codes, loyalty program
- **Treatment Plans** — Multi-session plans, progress tracking, skin analysis (clinic-specific)
- **Reports** — Revenue, employee performance, client analytics, occupancy rates
- **Trilingual** — Nederlands, English, Русский

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Laravel 13 (PHP 8.4) — API-first |
| Frontend | React 19 + Vite + TypeScript |
| Database | PostgreSQL 16 |
| Search | Typesense 27.1 |
| Cache | Redis 7 |
| Auth | Sanctum + Spatie Permissions |
| Payments | Mollie |
| i18n | Laravel Lang + react-i18next |

## Getting Started

### Prerequisites

- PHP 8.4+
- PostgreSQL 16+
- Redis 7+
- Node.js 22+
- Composer 2+

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### API Documentation

Available at `/api/documentation` when the backend is running (powered by Scramble).

## Project Structure

```
bosk-crm/
├── backend/          # Laravel 13 API
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── ...
│   ├── database/migrations/
│   ├── routes/api/
│   └── tests/
├── frontend/         # React 19 SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   └── services/
│   └── ...
└── docs/
```

## Roadmap

See [PLAN.md](PLAN.md) for the full feature roadmap.

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Foundation (Auth, i18n, Staff) | 🚧 In Progress |
| 2 | Core Scheduling (Calendar, Booking) | ⏳ Planned |
| 3 | Client Management (CRM, Forms) | ⏳ Planned |
| 4 | Sales & Inventory (POS, Stock) | ⏳ Planned |
| 5 | Marketing & Loyalty | ⏳ Planned |
| 6 | Reporting & Analytics | ⏳ Planned |
| 7 | Clinic-Specific (Treatments, Skin) | ⏳ Planned |

## License

Proprietary — All rights reserved.
