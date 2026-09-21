# ADR 0001: Technology stack

- Status: Accepted
- Date: 2026-09-21

## Decision

Use Next.js App Router, TypeScript, React, Tailwind CSS, Supabase PostgreSQL/Auth/Storage, Zod, and Vercel.

## Rationale

This stack provides server rendering, a small operational footprint, typed application code, managed authentication/database services, and a deployment path suited to a focused internal CRM. It also matches the requested product direction and avoids introducing a separate API service before the domain requires one.
