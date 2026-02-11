# arugami Dashboard — Platform Map
*Traceable “what exists” map for the client-facing product.*

**LastSynced:** 2025-12-22  
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

### `/dashboard`
- Owner code: `apps/arugami-dashboard/app/dashboard/page.tsx`
- Components:
  - `apps/arugami-dashboard/app/dashboard/components/*`
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

