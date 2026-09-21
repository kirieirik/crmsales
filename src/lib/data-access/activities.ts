import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const activityTypes = ["call", "email", "meeting", "follow_up", "task", "note"] as const;
const activityPriorities = ["low", "normal", "high"] as const;

export const activityFormSchema = z.object({
  title: z.string().trim().min(2, "Skriv inn en tittel."),
  type: z.enum(activityTypes),
  priority: z.enum(activityPriorities),
  dueDate: z.string().optional(),
  customerId: z.string().uuid().optional().or(z.literal("")),
  opportunityId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional(),
}).refine((value) => value.customerId || value.opportunityId, { message: "Knytt aktiviteten til en kunde eller mulighet.", path: ["customerId"] });

export type ActivityFormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean };
export type ActivityListItem = { id: string; title: string; type: string; priority: string; status: string; due_date: string | null; description: string | null; customer: { company_name: string } | null; opportunity: { title: string } | null };
export type ActivityParentOption = { id: string; label: string };

export async function listActivities(): Promise<ActivityListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("activities").select("id, title, type, priority, status, due_date, description, customer:customers(company_name), opportunity:opportunities(title)").order("status", { ascending: true }).order("due_date", { ascending: true });
  if (error) throw new Error("Aktiviteter kunne ikke hentes.");
  return (data ?? []).map((item) => ({ ...item, customer: Array.isArray(item.customer) ? item.customer[0] ?? null : item.customer, opportunity: Array.isArray(item.opportunity) ? item.opportunity[0] ?? null : item.opportunity })) as ActivityListItem[];
}

export async function listActivityParents() {
  const supabase = await createSupabaseServerClient();
  const [{ data: customers, error: customerError }, { data: opportunities, error: opportunityError }] = await Promise.all([
    supabase.from("customers").select("id, company_name").order("company_name"),
    supabase.from("opportunities").select("id, title").order("title"),
  ]);
  if (customerError || opportunityError) throw new Error("Koblinger kunne ikke hentes.");
  return { customers: (customers ?? []).map((item) => ({ id: item.id, label: item.company_name })), opportunities: (opportunities ?? []).map((item) => ({ id: item.id, label: item.title })) };
}

export async function createActivity(input: unknown): Promise<ActivityFormState> {
  const parsed = activityFormSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn for å opprette en aktivitet." };
  const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile) return { error: "Brukerprofilen mangler organisasjonstilknytning." };
  const { error } = await supabase.from("activities").insert({ organization_id: profile.organization_id, owner_id: user.id, title: parsed.data.title, type: parsed.data.type, priority: parsed.data.priority, due_date: parsed.data.dueDate || null, customer_id: parsed.data.customerId || null, opportunity_id: parsed.data.opportunityId || null, description: parsed.data.description || null });
  return error ? { error: "Aktiviteten kunne ikke opprettes." } : { success: true };
}

export async function completeActivity(activityId: string): Promise<ActivityFormState> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." };
  const { error } = await supabase.from("activities").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", activityId);
  return error ? { error: "Aktiviteten kunne ikke fullføres." } : { success: true };
}
