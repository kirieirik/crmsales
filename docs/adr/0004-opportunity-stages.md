# ADR 0004: Opportunity stage representation

- Status: Accepted
- Date: 2026-09-21

## Decision

Represent V1 stages as a PostgreSQL enum with Norwegian-facing labels mapped in application code.

## Rationale

The initial pipeline is known and benefits from database integrity and predictable reports. If customers later need configurable stages, migrate to an organization-scoped stage table without changing opportunity history semantics.
