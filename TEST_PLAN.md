# BOSK CRM — Test Plan

## Approach
Test each module individually. For each module:
1. **Views** — Are all views present and rendering?
2. **Logic** — Does CRUD actually work? Data flows correctly?
3. **UX/UI** — Follows guidelines? (SlidePanel/Sheet for edits, no popups, ConfirmDialog only for destructive)
4. **Completeness** — All fields present? Nothing missing?

---

## Module 1: Dashboard
| Test | Expected | Status |
|------|----------|--------|
| Stats cards clickable (link to relevant page) | Click "Today's appointments" → /calendar | ❌ |
| Stats show real data | Total clients, appointments today, revenue | ❌ |
| Today's appointment list with actions | Click → navigate to appointment or open Sheet | ❌ |
| Notification bell with unread count (red badge) | Shows pending items (new bookings, reviews) | ❌ |
| Welcome message shows user name | "Welkom terug, Admin Beheerder" | ✅ |

## Module 2: Calendar
| Test | Expected | Status |
|------|----------|--------|
| Week view renders with appointments | Time grid, colored blocks | ✅ |
| List view renders | Card list for selected date | ✅ |
| Kanban view renders | 4 status columns | ✅ |
| Click appointment → Sheet (not popup) | Right-side panel with details | ✅ |
| Click empty slot → create Sheet | Pre-filled date/time | ✅ |
| Drag and drop to reschedule | Move appointment to different slot | ❌ |
| Status transition buttons work | Confirm/Start/Complete/Cancel | ✅ |
| Create invoice from completed | Button in detail Sheet | ✅ |

## Module 3: Clients
| Test | Expected | Status |
|------|----------|--------|
| List page with search | Table, clickable rows | ✅ |
| Create page (full page, not popup) | /clients/new with all fields | ✅ |
| Edit page | /clients/:id/edit pre-filled | ✅ |
| Detail page with tabs | Info, History, Notes | ✅ |
| **Missing fields**: gender, locale, address, city, postal_code | Full contact info | ❌ |
| **Call log / communication history** | Log calls, emails, SMS | ❌ |
| **Notes with rich text** | TipTap editor for notes | ❌ |
| **Photo upload** (before/after) | Attach photos to client | ❌ |
| Delete client with ConfirmDialog | Destructive confirmation | ❌ |

## Module 4: Services
| Test | Expected | Status |
|------|----------|--------|
| List page grouped by category | Accordion with services | ✅ |
| Create page (full page) | /services/new | ✅ |
| Edit page | /services/:id/edit | ✅ |
| Detail page | /services/:id read-only | ✅ |
| Delete with ConfirmDialog | Destructive confirmation | ✅ |
| Price input in euros (not cents) | €89.00 not 8900 | ✅ |
| Category CRUD | Create/edit categories | ❌ |

## Module 5: Employees
| Test | Expected | Status |
|------|----------|--------|
| Employee list page | /employees with cards/table | ❌ |
| Employee detail page | Profile, schedule, reviews | ❌ |
| Staff vs freelancer badge | Visual distinction | ❌ |
| Working hours editor | Per-day time slots, connected to API | ❌ |
| Average rating display | Stars + count | ❌ |
| Availability calendar | Visual schedule | ❌ |

## Module 6: Invoices
| Test | Expected | Status |
|------|----------|--------|
| Invoice list | Table with status badges | ✅ |
| Create from appointment | One-click invoice | ✅ |
| Send to Moneybird | API integration | ✅ |
| Mark as paid | Status transition | ✅ |
| Invoice detail page | /invoices/:id | ❌ |

## Module 7: Reviews
| Test | Expected | Status |
|------|----------|--------|
| Review list page | All reviews with filters | ❌ |
| Publish/unpublish toggle | Moderation | ❌ |
| Star rating display | ★★★★☆ visual | ❌ |
| Reviews on employee profile | Tab or section | ❌ |
| Reviews on booking widget | Public display | ❌ |

## Module 8: Integrations
| Test | Expected | Status |
|------|----------|--------|
| Integration marketplace | Cards with status | ✅ |
| Moneybird config | API token + test | ✅ |
| Sync buttons work | Contacts + products | ✅ |

## Module 9: Notifications
| Test | Expected | Status |
|------|----------|--------|
| Notification bell in header | Red badge with count | ❌ |
| New booking notification | When client books online | ❌ |
| New review notification | When client leaves review | ❌ |
| Notification dropdown | List of recent notifications | ❌ |

## Cross-cutting
| Test | Expected | Status |
|------|----------|--------|
| Uses @opencivics/ui design system | Sheet, Dialog, Sidebar, Table, etc. | ❌ |
| Consistent button variants | Primary, secondary, danger, ghost | ❌ |
| All forms use react-hook-form + zod | Validation on all inputs | ⚠️ |
| i18n complete (NL/EN/RU) | All strings translated | ⚠️ |
| Responsive (mobile-friendly) | Works on tablet/phone | ❌ |

---

## Priority Order
1. **Port UI to @opencivics/ui design system** (foundation for everything)
2. **Dashboard** — make it functional and clickable
3. **Clients** — complete all missing fields + call log
4. **Employees** — full management page
5. **Calendar** — drag & drop
6. **Notifications** — header bell + dropdown
7. **Reviews** — management page
