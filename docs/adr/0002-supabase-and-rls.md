# ADR 0002: Supabase and database authorization

- Status: Accepted
- Date: 2026-09-21

## Decision

Use Supabase Auth with PostgreSQL RLS. Every tenant-owned row has `organization_id`; policies derive the active organization from the authenticated profile.

## Rationale

Authorization belongs at the data boundary so an omitted UI filter cannot expose another organization's data. The model supports a future multi-workspace product without adding billing or provisioning complexity now.
