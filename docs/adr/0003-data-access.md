# ADR 0003: Centralized data access

- Status: Accepted
- Date: 2026-09-21

## Decision

Keep Supabase clients, repositories, and query DTOs in `src/lib/data-access`; keep calculations in `src/lib/domain`.

## Rationale

This keeps presentational components focused on rendering, makes authorization and validation reviewable, and provides a stable boundary for future integrations or a different persistence implementation.
