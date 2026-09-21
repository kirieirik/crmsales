import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const customerFormSchema = z.object({
  companyName: z.string().trim().min(2, "Skriv inn et kundenavn."),
  organizationNumber: z.string().trim().max(32).optional(),
  email: z.string().trim().email("Skriv inn en gyldig e-postadresse.").optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional(),
  website: z.string().trim().max(255).optional(),
  address: z.string().trim().max(255).optional(),
  postalCode: z.string().trim().max(16).optional(),
  city: z.string().trim().max(100).optional(),
  industry: z.string().trim().max(100).optional(),
  customerType: z.enum(["small_business", "medium_business", "enterprise", "public_sector", "partner"]),
  potentialValue: z.coerce.number().min(0, "Potensial kan ikke være negativt."),
  notes: z.string().trim().max(2000).optional(),
});

export type CustomerFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export type CustomerListItem = {
  id: string;
  company_name: string;
  city: string | null;
  industry: string | null;
  customer_status: string;
  customer_type: string;
  potential_value: number | string;
  created_at: string;
};

export type ContactListItem = {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  is_primary: boolean;
};

export type CustomerDetail = CustomerListItem & {
  organization_number: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  contacts: ContactListItem[];
};

export type ContactFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function listCustomers(): Promise<CustomerListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, company_name, city, industry, customer_status, customer_type, potential_value, created_at")
    .order("company_name", { ascending: true });

  if (error) {
    throw new Error("Kundene kunne ikke hentes.");
  }

  return (data ?? []) as CustomerListItem[];
}

export async function getCustomerDetail(customerId: string): Promise<CustomerDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, company_name, organization_number, city, industry, phone, email, notes, customer_status, customer_type, potential_value, created_at, contacts(id, first_name, last_name, job_title, email, phone, mobile, is_primary)")
    .eq("id", customerId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    contacts: (data.contacts ?? []) as ContactListItem[],
  } as CustomerDetail;
}

export async function createCustomer(input: unknown): Promise<CustomerFormState> {
  const parsed = customerFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Du må være logget inn for å opprette en kunde." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Brukerprofilen din mangler en organisasjonstilknytning." };
  }

  const { error } = await supabase.from("customers").insert({
    organization_id: profile.organization_id,
    owner_id: user.id,
    company_name: parsed.data.companyName,
    organization_number: parsed.data.organizationNumber || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    website: parsed.data.website || null,
    address: parsed.data.address || null,
    postal_code: parsed.data.postalCode || null,
    city: parsed.data.city || null,
    industry: parsed.data.industry || null,
    customer_type: parsed.data.customerType,
    potential_value: parsed.data.potentialValue,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: "Kunden kunne ikke opprettes. Prøv igjen." };
  }

  return { success: true };
}

const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, "Skriv inn fornavn."),
  lastName: z.string().trim().min(1, "Skriv inn etternavn."),
  jobTitle: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Skriv inn en gyldig e-postadresse.").optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional(),
  mobile: z.string().trim().max(32).optional(),
  isPrimary: z.coerce.boolean().optional(),
});

export async function createContact(customerId: string, input: unknown): Promise<ContactFormState> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn for å legge til en kontakt." };

  const { data: profile, error: profileError } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
  if (profileError || !profile) return { error: "Brukerprofilen din mangler en organisasjonstilknytning." };

  const { error } = await supabase.from("contacts").insert({
    organization_id: profile.organization_id,
    customer_id: customerId,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    job_title: parsed.data.jobTitle || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    mobile: parsed.data.mobile || null,
    is_primary: parsed.data.isPrimary ?? false,
  });

  return error ? { error: "Kontakten kunne ikke opprettes. Prøv igjen." } : { success: true };
}
