-- Lead conversion keeps the original lead and records the created CRM records.

alter table public.leads
  add column converted_contact_id uuid references public.contacts(id) on delete set null,
  add column converted_opportunity_id uuid references public.opportunities(id) on delete set null,
  add column converted_at timestamptz;

create index leads_converted_customer_id_idx on public.leads(converted_customer_id);
create index leads_converted_opportunity_id_idx on public.leads(converted_opportunity_id);

create or replace function public.convert_lead(target_lead_id uuid)
returns table (customer_id uuid, contact_id uuid, opportunity_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  lead_record public.leads%rowtype;
  new_customer_id uuid;
  new_contact_id uuid;
  new_opportunity_id uuid;
  contact_display_name text;
  contact_first_name text;
  contact_last_name text;
begin
  select * into lead_record
  from public.leads
  where id = target_lead_id
    and organization_id = public.current_organization_id()
  for update;

  if not found then
    raise exception 'Lead not found';
  end if;

  if lead_record.status = 'converted' or lead_record.converted_customer_id is not null then
    raise exception 'Lead already converted';
  end if;

  insert into public.customers (
    organization_id, owner_id, company_name, email, phone, customer_status,
    customer_type, potential_value, notes
  ) values (
    lead_record.organization_id, auth.uid(), lead_record.company_name,
    lead_record.email, lead_record.phone, 'prospect', 'small_business',
    lead_record.estimated_value, lead_record.notes
  ) returning id into new_customer_id;

  if lead_record.contact_name is not null or lead_record.email is not null or lead_record.phone is not null then
    contact_display_name := coalesce(nullif(trim(lead_record.contact_name), ''), 'Ukjent kontakt');
    contact_first_name := split_part(contact_display_name, ' ', 1);
    contact_last_name := nullif(trim(substr(contact_display_name, length(contact_first_name) + 1)), '');
    contact_last_name := coalesce(contact_last_name, contact_first_name);

    insert into public.contacts (
      organization_id, customer_id, first_name, last_name, email, phone, is_primary
    ) values (
      lead_record.organization_id, new_customer_id, contact_first_name,
      contact_last_name, lead_record.email, lead_record.phone, true
    ) returning id into new_contact_id;
  end if;

  insert into public.opportunities (
    organization_id, customer_id, contact_id, owner_id, title, description,
    stage, value, probability
  ) values (
    lead_record.organization_id, new_customer_id, new_contact_id, auth.uid(),
    'Oppfølging: ' || lead_record.company_name, lead_record.notes, 'new_lead',
    lead_record.estimated_value, 10
  ) returning id into new_opportunity_id;

  update public.leads
  set status = 'converted', converted_customer_id = new_customer_id,
      converted_contact_id = new_contact_id, converted_opportunity_id = new_opportunity_id,
      converted_at = now()
  where id = target_lead_id;

  return query select new_customer_id, new_contact_id, new_opportunity_id;
end;
$$;

revoke all on function public.convert_lead(uuid) from public;
grant execute on function public.convert_lead(uuid) to authenticated;
