# Bill Maker — India-first billing PWA

A web-first, mobile-friendly bill generator inspired by billgenerator.in — reimagined for a cleaner UX, faster export, and every Indian bill type in one builder.

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase (Postgres + Auth) · client-side PDF via jsPDF + html2canvas.
- **Documents:** GST Tax Invoice · Bill of Supply · Cash Bill · Proforma · Quotation · Receipt · Delivery Challan · Purchase Order.
- **Templates:** Classic · Modern · Minimal · Corporate · GST Compact.
- **India-specific:** GSTIN format + checksum validation, state code lookup, place-of-supply CGST/SGST vs IGST, HSN/SAC starter list, ₹ formatting with lakh/crore, amount in words in Indian format.
- **Share:** Download PDF · Web Share API · WhatsApp (wa.me + PDF attachment) · Email (mailto with PDF) · shareable public link `/b/[shortId]`.
- **PWA:** installable on Android/iOS, offline shell, service worker.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in Supabase keys (optional for local use)
npm run dev
```

Visit http://localhost:3000.

The app is **fully usable without Supabase** — every entity is stored in `localStorage`. Add Supabase keys when you want cross-device sync.

## Supabase setup (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL editor**, paste and run [`supabase/schema.sql`](./supabase/schema.sql).
3. In **Storage**, create three buckets: `logos` (public), `signatures` (public), `bill-pdfs` (private).
4. In **Auth → Providers**, enable Email/Password and (optionally) Google.
5. Copy your project URL + anon key into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Row-level security is turned on — each user only sees their own bills, clients and products. The `bills` table also allows public read by `short_id` so shareable links work without login.

## Deployment

- **Vercel** is the fastest path: import the repo, add the three env vars above, and deploy.
- The service worker only registers in production builds.

## Project layout

```
src/
  app/                 # Next.js routes
    (app)/             # authenticated app shell (dashboard, bills, clients, products, business)
    b/[shortId]/       # public read-only bill view
    login/  signup/    # Supabase auth pages
    page.tsx           # marketing landing page
  components/
    bill/              # BillBuilder + template renderers
    layout/  ui/       # shell, header, footer + design-system primitives
  lib/
    indian/            # GSTIN, INR, HSN, tax, state helpers (pure functions)
    pdf/               # html2canvas + jsPDF export
    share/             # WhatsApp / email / Web Share
    store/local.ts     # localStorage repo (Supabase repo can be layered on top)
    supabase/          # browser + server clients
    types.ts           # domain types
supabase/schema.sql    # Postgres schema + RLS policies
public/                # PWA manifest, icon, service worker
```

## Roadmap ideas

- Recurring invoices, payment reminders.
- E-invoice / IRN integration (once GSTN sandbox access is available).
- Multi-currency + FX for exporters.
- Team seats and role-based access.
- Analytics: outstanding, aging, top clients.
- WhatsApp Cloud API (server-side send with delivery receipts).
