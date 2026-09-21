import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const opportunityFormSchema = z.object({
  customerId: z.string().uuid("Velg en kunde."),
  title: z.string().trim().min(2, "Skriv inn en tittel."),
  value: z.coerce.number().min(0, "Verdi kan ikke være negativ."),
  probability: z.coerce.number().int().min(0).max(100),
  expectedCloseDate: z.string().optional(),
  description: z.string().trim().max(2000).optional(),
});

export const opportunityStages = [
  ["new_lead", "Ny lead"], ["contacted", "Kontaktet"], ["qualified", "Kvalifisert"],
  ["meeting", "Møte"], ["needs_mapped", "Behov kartlagt"], ["proposal", "Tilbud"],
  ["negotiation", "Forhandling"], ["won", "Vunnet"], ["lost", "Tapt"],
] as const;

export type OpportunityFormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean };
export type OpportunityStage = (typeof opportunityStages)[number][0];
export type OpportunityListItem = { id: string; title: string; stage: string; value: number | string; probability: number; expected_close_date: string | null; customer: { company_name: string } | null };

export async function listPipeline(): Promise<OpportunityListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("opportunities").select("id, title, stage, value, probability, expected_close_date, customer:customers(company_name)").order("created_at", { ascending: false });
  if (error) throw new Error("Pipeline kunne ikke hentes.");
  return (data ?? []).map((item) => ({
    ...item,
    customer: Array.isArray(item.customer) ? item.customer[0] ?? null : item.customer,
  })) as OpportunityListItem[];
}

export async function listOpportunityCustomers(): Promise<Array<{ id: string; company_name: string }>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("customers").select("id, company_name").order("company_name");
  if (error) throw new Error("Kunder kunne ikke hentes.");
  return (data ?? []) as Array<{ id: string; company_name: string }>;
}

export async function createOpportunity(input: unknown): Promise<OpportunityFormState> {
  const parsed = opportunityFormSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn for å opprette en mulighet." };
  const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile) return { error: "Brukerprofilen mangler organisasjonstilknytning." };
  const { error } = await supabase.from("opportunities").insert({ organization_id: profile.organization_id, owner_id: user.id, customer_id: parsed.data.customerId, title: parsed.data.title, value: parsed.data.value, probability: parsed.data.probability, expected_close_date: parsed.data.expectedCloseDate || null, description: parsed.data.description || null });
  return error ? { error: "Muligheten kunne ikke opprettes." } : { success: true };
}

export async function updateOpportunityStage(opportunityId: string, stage: string): Promise<OpportunityFormState> {
  if (!opportunityStages.some(([value]) => value === stage)) return { error: "Ugyldig salgsfase." };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." };
  const { error } = await supabase.from("opportunities").update({ stage, won_at: stage === "won" ? new Date().toISOString() : null }).eq("id", opportunityId);
  return error ? { error: "Salgsfasen kunne ikke oppdateres." } : { success: true };
}
