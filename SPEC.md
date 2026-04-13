# SalonFlow MVP — Specification

## 1. Concept & Vision

SalonFlow is a streamlined booking platform built for Austrian KMU salons (hair, beauty, nail). It gives small salon operators a zero-friction admin experience and gives customers a calm, trustworthy booking flow that feels distinctly Austrian — professional, warm, and reliable. The platform handles appointment scheduling, automated SMS reminders via n8n, and client management without requiring expensive SaaS or POS systems.

---

## 2. Design Language

**Aesthetic Direction:** Warm sage-green — inspired by natural tones, salon calm, and understated Alpine elegance. Clean without being clinical.

**Color Palette:**
- Primary: `#8BA888` (Sage Green)
- Primary Dark: `#6B8A68` (Deep Sage)
- Accent: `#D4A574` (Warm Terracotta)
- Background: `#F8F6F2` (Warm Off-White)
- Surface: `#FFFFFF`
- Text Primary: `#2D2D2D`
- Text Secondary: `#6B6B6B`
- Border: `#E5E0D8`
- Error: `#C45C5C`

**Typography:**
- Headings: `DM Sans` (Google Fonts), 600–700 weight
- Body: `DM Sans`, 400–500 weight
- Monospace (times/codes): `JetBrains Mono`

**Spacing System:**
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Container max-width: 480px (customer), 1200px (admin)

**Motion:**
- Duration: 150ms (micro), 250ms (standard), 400ms (page)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Principle: Animate state changes, not layout shifts

---

## 3. Layout & Structure

**Customer Flow:**
- `/book/[slug]` — Salon landing + booking widget (single-page, scroll-driven)
- `/verify-booking` — Confirmation page with booking details + calendar add link

**Salon Admin Flow:**
- `/admin` — Dashboard overview (today's appointments, quick stats)
- `/admin/calendar` — Weekly/monthly calendar view with booking management
- `/admin/customers` — Customer list with booking history
- `/admin/settings` — Business hours, services, SMS templates

**Responsive Strategy:** Mobile-first. Customer booking is 480px max-width centered. Admin is fully responsive with collapsible sidebar on tablet/mobile.

---

## 4. Features & Interactions

**Booking Flow (Customer):**
1. Land on `/book/[slug]` — see salon name, description, services
2. Select service(s) → select date on calendar → select time slot
3. Enter name + phone number (required), optional email
4. Confirm → POST to `/api/bookings` → redirect to `/verify-booking?token=XXX`
5. Booking confirmation shown; SMS sent via n8n webhook within seconds

**Admin Calendar:**
- Week view default, toggle to month
- Each booking shows: client name, service, time, status badge (confirmed/pending/cancelled)
- Click booking → slide-in panel with full details + actions (confirm, cancel, reschedule)
- Drag-to-reschedule (future enhancement, not MVP)

**SMS Reminders (n8n):**
- Trigger: `booking.created`, `booking.reminder` (24h before), `booking.cancelled`
- n8n workflow hits `POST https://api.salonflow.com/hooks/sms` with booking payload
- SMS provider: Austrian-compliant provider (e.g., SMS77 or Placetel)

**Interactions:**
- Time slots: disabled if fully booked (greyed, non-clickable)
- Form validation: inline errors, phone format validation (+43 Austrian format)
- Loading states: skeleton shimmer on calendar, spinner on form submit
- Empty states: friendly illustration + copy ("No slots available — try another day")

---

## 5. Component Inventory

| Component | States | Notes |
|---|---|---|
| `BookingCard` | default, loading, selected, disabled | Used in admin list view |
| `Calendar` | default, loading, error | Month view, day cells clickable |
| `TimeSlotPicker` | available, selected, unavailable, loading | Horizontal scroll on mobile |
| `AdminDashboard` | default, empty, loading | Stats cards + today's list |
| `CustomerList` | default, empty, loading, error | Searchable, paginated table |
| `ServicePicker` | default, selected | Multi-select chips |
| `BookingForm` | idle, submitting, error, success | Name, phone, email fields |
| `StatusBadge` | confirmed, pending, cancelled | Color-coded pill |
| `SlidePanel` | open, closed | Admin booking detail drawer |

---

## 6. Technical Approach

**Stack:**
- Framework: Next.js 15 (App Router)
- Database/Auth: Supabase (Postgres, RLS, anon key auth)
- SMS Automation: n8n (webhook triggers to external SMS provider)
- Styling: CSS Modules + CSS custom properties (no Tailwind)

**Database Schema (Supabase):**

```
salons         — id, name, slug, description, phone, email, address, settings (JSONB)
services       — id, salon_id, name, duration_min, price
bookings       — id, salon_id, service_id, customer_name, phone, email, date, time, status, token
business_hours — id, salon_id, day_of_week, open_time, close_time
```

**API Routes:**
- `POST /api/bookings` — Create booking, generate token, trigger n8n webhook
- `GET /api/bookings/[token]` — Retrieve booking by token (for verify page)
- `PATCH /api/bookings/[id]` — Update status (admin)
- `GET /api/salons/[slug]` — Public salon info + services
- `POST /api/hooks/sms` — n8n webhook endpoint

**Key Decisions:**
- Slugs are unique per salon for clean URLs (`/book/haarschneiderei-mayer`)
- Booking token is a random 32-char string for public verification URL (no auth required for customer view)
- Admin routes are protected by Supabase Auth + session cookies
- n8n polls Supabase via `bookings` table changes or receives webhook on create
