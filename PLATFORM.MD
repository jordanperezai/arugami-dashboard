# arugami Dashboard — Platform Map
*Traceable “what exists” map for the client-facing product.*

**LastSynced:** 2026-02-14  
**Scope:** `apps/arugami-dashboard`

---

## Purpose

This file exists so humans + agents have one reliable map of:
- Routes (screens)
- Key workflows
- “Owner” files (where truth lives in code)

Update this file when you change:
- routes/pages
- major dashboard workflows
- auth/onboarding logic
- API routes that back UI behavior

---

## Routes (Screens)

### `/login`
- Owner code: `apps/arugami-dashboard/app/login/page.tsx`
- Notes: guarded by middleware redirect rules

### `/onboarding`
- Owner code: `apps/arugami-dashboard/app/onboarding/page.tsx`
- Integrations OAuth entry points:
  - `apps/arugami-dashboard/app/api/oauth/[provider]/authorize/route.ts`
  - `apps/arugami-dashboard/app/api/oauth/[provider]/callback/route.ts`

### `/welcome`
- Owner code: `apps/arugami-dashboard/app/welcome/page.tsx`
- Flow: payment -> reveal -> priorities -> password -> dashboard handoff
- Handoff behavior: routes to `/dashboard?launch=concierge` to spotlight AI concierge actions on first load

### `/dashboard`
- Owner code: `apps/arugami-dashboard/app/dashboard/page.tsx`
- Components:
  - `apps/arugami-dashboard/app/dashboard/components/*`
  - `apps/arugami-dashboard/app/dashboard/components/ClientActivationPanel.tsx` (activation status + AI concierge launcher)
  - `apps/arugami-dashboard/app/dashboard/components/BillingActivationCard.tsx` (in-dashboard invoice/payment CTA + paid/canceled states)
- Auth gate:
  - `apps/arugami-dashboard/middleware.ts`

### `/dashboard/settings`
- Owner code: `apps/arugami-dashboard/app/dashboard/settings/page.tsx`

---

## Key Workflows

### Auth session + route protection
- Middleware: `apps/arugami-dashboard/middleware.ts`
- Supabase server client usage: `@supabase/ssr` inside server components/routes

### OAuth integrations (connect tools)
- Config + token exchange: `apps/arugami-dashboard/lib/oauth-config.ts`
- State signing + returnTo normalization: `apps/arugami-dashboard/lib/oauthState.ts`
- Credential encryption at rest: `apps/arugami-dashboard/lib/integrations/credentialsCrypto.ts`
- Persistence: Supabase table `integrations` (`credentials_encrypted`)

### “Cubita First Ride” data surfaces (Supabase)
- `clients`
- `integrations`
- `agent_runs`
- `reports`

### Stripe billing from dashboard
- API route: `apps/arugami-dashboard/app/api/stripe/create-dashboard-checkout/route.ts`
- Behavior: authenticated client can launch Stripe Checkout from dashboard without welcome token
- Return paths: `/dashboard?billing=success&launch=concierge` or `/dashboard?billing=canceled`
