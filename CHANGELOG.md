# Changelog

All notable changes to BOSK CRM will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
