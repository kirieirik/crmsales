import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const leadFormSchema = z.object({
  companyName: z.string().trim().min(2, "Skriv inn et firmanavn."),
  contactName: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Skriv inn en gyldig e-postadresse.").optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional(),
  source: z.enum(["website", "referral", "cold_outreach", "existing_customer", "trade_show", "linkedin", "other"]),
  estimatedValue: z.coerce.number().min(0, "Estimert verdi kan ikke være negativ."),
  notes: z.string().trim().max(2000).optional(),
});

export type LeadFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export type LeadListItem = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  estimated_value: number | string;
  created_at: string;
};

export async function listLeads(): Promise<LeadListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, company_name, contact_name, email, phone, source, status, estimated_value, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Leads kunne ikke hentes.");
  return (data ?? []) as LeadListItem[];
}

export async function createLead(input: unknown): Promise<LeadFormState> {
  const parsed = leadFormSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn for å opprette et lead." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return { error: "Brukerprofilen din mangler en organisasjonstilknytning." };

  const { error } = await supabase.from("leads").insert({
    organization_id: profile.organization_id,
    owner_id: user.id,
    company_name: parsed.data.companyName,
    contact_name: parsed.data.contactName || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    source: parsed.data.source,
    estimated_value: parsed.data.estimatedValue,
    notes: parsed.data.notes || null,
  });

  return error ? { error: "Leadet kunne ikke opprettes. Prøv igjen." } : { success: true };
}
