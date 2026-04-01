# Changelog

All notable changes to BOSK CRM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.3.0] - 2026-04-01

### Added
- **Public Booking Widget** — 4-step booking wizard at `/booking/:locationId` (no auth required)
  - Step 1: Service selection grouped by category
  - Step 2: Date picker + available time slots per employee
  - Step 3: Client details form
  - Step 4: Confirmation + booking creation
- **Appointment Status Transitions** — click appointments in calendar to manage status
  - Scheduled → Confirmed → In Progress → Completed
  - Cancel with reason prompt, No-show marking
- **Client Notes** — full notes system on client detail page
  - Add/delete notes with author tracking
  - Private notes toggle
- `in_progress` appointment status support throughout UI
- 51 API routes (was 40)

## [0.2.0] - 2026-04-01

### Added
- Location selector in header (multi-location support)
- Location store with persistence (Zustand)
- `localizedName()` utility for trilingual field display (NL/EN/RU)
- Provision script for LXC stack deployment

### Fixed
- All API calls now use location-scoped routes (`/locations/{id}/...`)
- Field name alignment between frontend and API (starts_at, price_cents, name_nl, etc.)
- Dashboard page matches actual API response structure
- Calendar, clients, services pages use correct field mapping

### Deployed
- Full stack on LXC 300 (PHP 8.4, PostgreSQL 16, Redis 7, Nginx, Typesense 27.1, Node 22)
- Frontend SPA + API running at http://172.24.0.30

## [0.1.0] - 2026-04-01

### Added
- Project initialization with PLAN.md and README.md
- LXC container provisioned (VMID 300, 172.24.0.30, Ubuntu 24.04)
- Feature roadmap based on Salonized analysis (7 phases)
- Laravel 13 backend scaffolding (API-first)
- React 19 frontend scaffolding (Vite + TypeScript)
- Trilingual i18n setup (NL, EN, RU)
