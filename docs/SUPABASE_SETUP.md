# Supabase setup

This project expects a Supabase project for authentication and PostgreSQL. Do not paste keys into chat or commit them to Git.

## 1. Create the project

1. Open the Supabase dashboard and create a new project.
2. Choose a strong database password and store it in your password manager.
3. In **Project Settings > API**, copy the **Project URL** and the browser-safe **Publishable key** (called `anon` in older projects).
4. In **Authentication > Providers > Email**, enable Email provider. Keep email confirmation disabled for the first local smoke test, or configure SMTP before enabling it.

## 2. Configure the local app

From the repository root:

```bash
cp .env.example .env.local
```

Edit `.env.local` locally and set:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

The service-role key is not required for the current app. Leave `SUPABASE_SERVICE_ROLE_KEY` empty unless a future server-only administrative task explicitly needs it.

## 3. Apply the database migration

### Dashboard SQL Editor

For the first setup, open **SQL Editor > New query**, paste the contents of `supabase/migrations/0001_crm_foundation.sql`, and run it once. The migration creates the tables, indexes, constraints, RLS policies, and an Auth trigger that creates a workspace/profile for every new user.

### Supabase CLI

For repeatable team development, install the Supabase CLI, then from the repository root:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

Do not run the migration through both methods. Use the dashboard once for a quick first setup, or use the CLI as the ongoing source of truth.

## 4. Create the first user

In **Authentication > Users**, choose **Add user**, enter your email and a password, and create the user. The database trigger will create:

- one organization named from the user's email
- one `admin` profile linked to that organization

Then visit `http://localhost:3000/login` and sign in.

## 5. Verify the connection

Restart the development server after changing `.env.local`:

```bash
npm run dev
```

The login page should show the sign-in form rather than the configuration warning. After signing in, `/dashboard` should load. If the migration has not run, authentication may succeed but the protected application will not have a profile to authorize data queries.

## Security checklist

- Use only the publishable/anon key in `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` variable or browser component.
- Keep `.env.local` untracked.
- Leave RLS enabled on every application table.
- Add future schema changes as numbered migration files.