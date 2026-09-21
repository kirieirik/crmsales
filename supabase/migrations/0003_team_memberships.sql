-- Invitees join the inviter's existing organization instead of receiving a new workspace.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_organization_id uuid;
  new_organization_id uuid;
begin
  if (new.raw_user_meta_data ->> 'organization_id') ~ '^[0-9a-fA-F-]{36}$' then
    requested_organization_id := (new.raw_user_meta_data ->> 'organization_id')::uuid;
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
    case when new_organization_id = requested_organization_id then 'sales' else 'admin' end
  );

  return new;
end;
$$;
