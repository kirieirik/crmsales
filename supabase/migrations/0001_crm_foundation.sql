-- CRM foundation schema.
-- Apply with Supabase CLI migrations; do not run this file from the browser.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'sales');
create type public.customer_status as enum ('prospect', 'active', 'inactive', 'lost');
create type public.customer_type as enum ('small_business', 'medium_business', 'enterprise', 'public_sector', 'partner');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'converted', 'lost');
create type public.lead_source as enum ('website', 'referral', 'cold_outreach', 'existing_customer', 'trade_show', 'linkedin', 'other');
create type public.opportunity_stage as enum ('new_lead', 'contacted', 'qualified', 'meeting', 'needs_mapped', 'proposal', 'negotiation', 'won', 'lost');
create type public.activity_type as enum ('call', 'email', 'meeting', 'follow_up', 'task', 'note');
create type public.activity_priority as enum ('low', 'normal', 'high');
create type public.activity_status as enum ('open', 'completed', 'cancelled');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'sales',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  company_name text not null,
  organization_number text,
  customer_number text,
  website text,
  phone text,
  email text,
  address text,
  postal_code text,
  city text,
  country text not null default 'Norway',
  industry text,
  customer_status public.customer_status not null default 'prospect',
  customer_type public.customer_type not null default 'small_business',
  potential_value numeric(14, 2) not null default 0 check (potential_value >= 0),
  annual_revenue_estimate numeric(14, 2) check (annual_revenue_estimate is null or annual_revenue_estimate >= 0),
  employee_count integer check (employee_count is null or employee_count >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  job_title text,
  email text,
  phone text,
  mobile text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  source public.lead_source not null default 'other',
  status public.lead_status not null default 'new',
  estimated_value numeric(14, 2) not null default 0 check (estimated_value >= 0),
  notes text,
  converted_customer_id uuid references public.customers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  contact_id uuid references public.contacts(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text,
  stage public.opportunity_stage not null default 'new_lead',
  value numeric(14, 2) not null default 0 check (value >= 0),
  probability smallint not null default 10 check (probability between 0 and 100),
  expected_close_date date,
  lost_reason text,
  won_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  type public.activity_type not null,
  title text not null,
  description text,
  due_date timestamptz,
  completed_at timestamptz,
  priority public.activity_priority not null default 'normal',
  status public.activity_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_has_parent check (customer_id is not null or opportunity_id is not null)
);

-- A new Supabase Auth user becomes the first member of a private workspace.
-- This runs server-side so the browser never needs permission to create tenants.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_organization_id uuid;
begin
  insert into public.organizations (name, slug)
  values (
    coalesce(new.raw_user_meta_data ->> 'company_name', split_part(new.email, '@', 1) || ' workspace'),
    'workspace-' || replace(new.id::text, '-', '')
  )
  returning id into new_organization_id;

  insert into public.profiles (id, organization_id, full_name, email, role)
  values (
    new.id,
    new_organization_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'admin'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create index customers_organization_id_idx on public.customers(organization_id);
create index customers_owner_id_idx on public.customers(owner_id);
create index customers_status_idx on public.customers(customer_status);
create index contacts_customer_id_idx on public.contacts(customer_id);
create index leads_organization_id_idx on public.leads(organization_id);
create index leads_owner_id_idx on public.leads(owner_id);
create index leads_status_idx on public.leads(status);
create index opportunities_customer_id_idx on public.opportunities(customer_id);
create index opportunities_owner_id_idx on public.opportunities(owner_id);
create index opportunities_stage_idx on public.opportunities(stage);
create index activities_customer_id_idx on public.activities(customer_id);
create index activities_opportunity_id_idx on public.activities(opportunity_id);
create index activities_owner_id_idx on public.activities(owner_id);
create index activities_due_date_idx on public.activities(due_date);
create index activities_created_at_idx on public.activities(created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['organizations', 'profiles', 'customers', 'contacts', 'leads', 'opportunities', 'activities'] loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create policy "Members can view their organization" on public.organizations
  for select using (id = public.current_organization_id());

create policy "Members can view organization profiles" on public.profiles
  for select using (organization_id = public.current_organization_id());

create policy "Members can manage organization customers" on public.customers
  for all using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "Members can manage organization contacts" on public.contacts
  for all using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "Members can manage organization leads" on public.leads
  for all using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "Members can manage organization opportunities" on public.opportunities
  for all using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());

create policy "Members can manage organization activities" on public.activities
  for all using (organization_id = public.current_organization_id())
  with check (organization_id = public.current_organization_id());
