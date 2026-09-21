-- Fixes Auth user creation when the team-membership trigger assigns the enum role.
-- Run after 0003_team_memberships.sql.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_organization_id uuid;
  new_organization_id uuid;
  requested_organization_text text;
begin
  requested_organization_text := new.raw_user_meta_data ->> 'organization_id';

  if requested_organization_text is not null
     and requested_organization_text ~ '^[0-9a-fA-F-]{36}$' then
    requested_organization_id := requested_organization_text::uuid;
  end if;

  if requested_organization_id is not null and exists (
    select 1 from public.organizations where id = requested_organization_id
  ) then
    new_organization_id := requested_organization_id;
  else
    insert into public.organizations (name, slug)
    values (
      coalesce(new.raw_user_meta_data ->> 'company_name', split_part(new.email, '@', 1) || ' workspace'),
      'workspace-' || replace(new.id::text, '-', '')
    )
    returning id into new_organization_id;
  end if;

  insert into public.profiles (id, organization_id, full_name, email, role)
  values (
    new.id,
    new_organization_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    case
      when new_organization_id = requested_organization_id then 'sales'::public.user_role
      else 'admin'::public.user_role
    end
  );

  return new;
end;
$$;
