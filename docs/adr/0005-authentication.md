# ADR 0005: Authentication and roles

- Status: Accepted
- Date: 2026-09-21

## Decision

Use Supabase Auth for identity and a `profiles` table for organization membership, display data, and the initial `admin` or `sales` role.

## Rationale

Identity and session handling stay with a proven provider while application-specific authorization remains in our database. V1 needs simple roles, not a general-purpose permissions engine.
