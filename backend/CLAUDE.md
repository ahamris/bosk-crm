# BOSK CRM — Backend

## What is this?

API-first Laravel 13 backend for BOSK CRM, a beauty and skin clinic management system.
No Blade views — the frontend is a separate React SPA.

## Tech Stack

- **Laravel 13** (PHP 8.4)
- **PostgreSQL 16** (DB_CONNECTION=pgsql)
- **Laravel Sanctum** — token-based API auth
- **Spatie Permission** — RBAC (roles: owner, manager, employee, receptionist)
- **Spatie Activity Log** — audit trail
- **Scramble** — auto-generated OpenAPI docs at `/docs/api`

## Architecture

- All responses are JSON (no views)
- API routes prefixed with `/api/v1/` (set in `bootstrap/app.php`)
- Controllers: `app/Http/Controllers/Api/V1/`
- Resources: `app/Http/Resources/V1/`
- Form Requests: `app/Http/Requests/V1/`
- Models: `app/Models/`
- Routes: `routes/api.php`

## Models & Relationships

- **Location** — has many: services, clients, appointments, employee profiles, working hours
- **ServiceCategory** — has many services
- **Service** — belongs to location + category, has many appointments
- **Client** — belongs to location, has many appointments + notes
- **User** — has roles, employee profile, working hours, appointments
- **EmployeeProfile** — belongs to user + location (specializations JSON, bio NL/EN/RU)
- **WorkingHour** — per user per location per day_of_week
- **Appointment** — status machine (scheduled -> confirmed -> in_progress -> completed; or cancelled/no_show)
- **ClientNote** — belongs to client + author (user)

## Key Conventions

- Prices stored as cents (`price_cents` integer), exposed as `price` float in resources
- Multilingual fields: `*_nl`, `*_en`, `*_ru`
- Appointment status transitions enforced in model (`canTransitionTo()`)
- Nested routes: services, clients, appointments are scoped under locations
- Employees are users with an `employee_profile` record
- Search on clients: `?search=term` filters first_name/last_name/email/phone

## Running

```bash
composer install
cp .env.example .env
php artisan key:generate
# Create bosk_crm database in PostgreSQL
php artisan migrate
php artisan db:seed
php artisan serve
```

## Default Users (after seeding)

- **Admin**: admin@bosk.nl / password (role: owner)
- **Employees**: sophie@bosk.nl, elena@bosk.nl, lisa@bosk.nl / password

## API Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout          (auth)
GET    /api/v1/auth/me               (auth)

GET    /api/v1/dashboard             (auth)

CRUD   /api/v1/locations             (auth)
CRUD   /api/v1/locations/{id}/services     (auth)
CRUD   /api/v1/locations/{id}/clients      (auth)
CRUD   /api/v1/locations/{id}/appointments (auth)

CRUD   /api/v1/service-categories    (auth)

GET    /api/v1/employees             (auth)
GET    /api/v1/employees/{id}        (auth)
GET    /api/v1/employees/{id}/availability?date=YYYY-MM-DD (auth)
CRUD   /api/v1/employees/{id}/working-hours (auth)
```
