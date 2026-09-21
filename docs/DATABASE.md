# Database

## Current migration

`supabase/migrations/0001_crm_foundation.sql` is the initial schema. `0002_lead_conversion.sql` adds conversion links and the atomic conversion function. `0003_team_memberships.sql` updates Auth onboarding so invited users join an existing organization. `0004_fix_team_auth_trigger.sql` fixes enum handling during Auth user creation. Apply migrations through the Supabase CLI or SQL editor in order; do not create production tables manually in the dashboard.

## Tables

- `organizations`: workspace boundary.
- `profiles`: authenticated users, organization membership, role, and display data.
- `customers`: company records and commercial potential.
- `contacts`: people belonging to customers.
- `leads`: pre-customer sales signals and conversion link.
- `opportunities`: pipeline deals, value, probability, stage, and close date.
- `activities`: planned and completed customer or opportunity work.

Lead conversion runs inside `public.convert_lead`, which creates a customer, optional contact, and opportunity in one transaction, then marks the original lead as converted with links to the created records.

## Integrity and money

UUIDs identify records. Foreign keys use restrictive deletion for ownership relationships and cascading deletion for tenant-owned records where appropriate. Money uses `numeric(14, 2)`, never floating point. Probability is constrained to 0-100, and non-negative values are enforced in PostgreSQL.

## Indexes

Organization, owner, status, stage, customer, opportunity, due date, and creation-date indexes are included for the expected list and dashboard queries. Composite indexes can be added after query plans show a need.

## RLS strategy

Every business table has `organization_id` and RLS enabled. `current_organization_id()` resolves the authenticated user's organization through `profiles`. Policies allow members to access only rows in that organization. The service-role key bypasses RLS and must remain server-only.

## Migration and backup

Use `supabase db diff` and reviewed migration files for schema changes. Test migrations against a disposable local or staging project before production. Supabase backups and point-in-time recovery should be enabled according to the deployment plan; restore drills belong in production hardening.

## Import strategy

Phase 9 should accept CSV with a preview step. The importer will map documented headers, validate required fields with the same domain schemas used by forms, report row-level errors, and detect likely duplicates using organization number, normalized email, and company name. Malformed rows must be rejected or explicitly corrected; no silent imports.

## Future extensions

Quotes, quote lines, products, product variants, orders, documents, integration connections, and audit events should be separate tables with organization ownership. Quote and order lines should snapshot descriptions, prices, discounts, and VAT so later catalog edits cannot rewrite historical documents.
