# Nordlys CRM

Nordlys CRM is a focused CRM and sales workspace for Norwegian B2B companies selling workwear, corporate clothing, PPE, and related products. The product is designed to help salespeople see who needs attention, what happened last, what should happen next, and which opportunities are worth pursuing.

## Status

**Implemented:**

- Next.js App Router, TypeScript, Tailwind CSS, and ESLint foundation
- Supabase-oriented relational schema with organization boundaries and RLS policies
- Domain documentation, architecture documentation, and ADRs
- CI contract for lint, typecheck, tests, and build
- Initial weighted-pipeline and overdue-activity domain functions with unit tests
- Norwegian Phase 0 workspace entry screen
- Supabase browser/server clients, session proxy, login, and protected dashboard shell
- Customer list and creation workflow with server-side validation and RLS-safe writes
- Customer detail pages and contact creation
- Enhetsregisteret company search for customer form population
- Lead list and creation workflow
- Atomic lead conversion into customer, contact, and opportunity
- Pipeline list, opportunity creation, weighted value, and stage changes
- Activity list, due-date tracking, and completion
- Data-backed dashboard KPIs and daily workspace summaries
- Initial sales reports for pipeline, win rate, sales, leads, and activities
- Team invitations with shared organization visibility

**In progress:**

- Customer editing, customer activity timeline, and audit history

**Planned:**

- Customers, contacts, leads, opportunities, activities, dashboard, reports, and CSV import
- Products, quotes, orders, integrations, and AI-assisted workflows

See [the roadmap](docs/ROADMAP.md) for the phase breakdown.

## Technology

- Next.js App Router and React
- TypeScript with strict checking
- Tailwind CSS
- Supabase PostgreSQL, Auth, and Storage
- Zod for input validation (application integration planned)
- Vitest for unit tests
- Vercel deployment target

## Repository structure

```text
src/app/                  Next.js routes and layouts
src/components/           Shared and feature UI components
src/lib/domain/           Pure business rules and calculations
src/lib/data-access/      Supabase clients, repositories, and queries
supabase/migrations/      Reproducible database migrations
supabase/seed.sql         Development seed entry point
docs/                     Architecture, domain, database, roadmap, and ADRs
.github/workflows/        CI configuration
```

## Prerequisites

- Node.js 22 or newer
- npm
- A Supabase project for database-backed development

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

Set these in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only administrative key; do not expose it to the browser |

## Supabase setup

Install the Supabase CLI, link the project, and apply migrations:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

The schema is in [the initial migration](supabase/migrations/0001_crm_foundation.sql). Follow the [Supabase setup guide](docs/SUPABASE_SETUP.md) to create the project, apply the migration, and create the first user. Seed data is intentionally not marked complete yet; fictional Norwegian development data will be added during Phase 1.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

GitHub Actions runs the same checks on pushes to `main` and pull requests.

## Deployment

Create a Vercel project connected to this repository, configure the environment variables above, and deploy the `main` branch. Apply Supabase migrations separately before enabling database-backed routes. Never put the service-role key in client code or committed files.

## Architecture and domain

- [Architecture](docs/ARCHITECTURE.md): system boundaries, data flow, RLS, deployment, and risks
- [Domain](docs/DOMAIN.md): business concepts and lifecycle transitions
- [Database](docs/DATABASE.md): tables, constraints, indexes, migrations, and import strategy
- [Roadmap](docs/ROADMAP.md): committed V1 scope and future work
- [ADRs](docs/adr/): decisions that affect future implementation

## Implementation checklist

1. Complete Supabase browser/server clients and Auth.
2. Build protected shell and Norwegian navigation.
3. Implement customer/contact repository, validation, and screens.
4. Add lead conversion duplicate detection and review workflow.
5. Implement opportunity pipeline and centralized calculations.
6. Implement activities, timelines, dashboard, and reports.
7. Add realistic fictional seed data and CSV preview/import.
8. Add E2E coverage for critical workflows and complete production hardening.

## Git and contribution conventions

Keep changes in logical units with messages such as `feat(customers): add customer detail page`, `db: add CRM core schema`, or `docs: add architecture documentation`. Keep the main branch deployable, run the quality checks before opening a pull request, and update documentation when a decision or user-visible behavior changes.

## Security

Do not commit `.env.local`, credentials, real customer data, or Supabase service-role keys. Treat RLS as a required authorization boundary and validate all mutation input on the server. Report security issues privately to the repository maintainers rather than opening a public issue with exploit details.

## License

No license has been selected yet. Choose and add a license before distributing the application outside the owning organization.
