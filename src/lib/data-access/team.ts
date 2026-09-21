import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const inviteSchema = z.object({ email: z.string().trim().email("Skriv inn en gyldig e-postadresse."), fullName: z.string().trim().min(2, "Skriv inn navn.") });
export type InviteFormState = { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean };
export type TeamMember = { id: string; full_name: string; email: string; role: string; created_at: string };

async function getAdminContext() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Du må være logget inn." as const };
  const { data: profile } = await supabase.from("profiles").select("organization_id, role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Bare administratorer kan invitere brukere." as const };
  return { supabase, user, organizationId: profile.organization_id };
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("id, full_name, email, role, created_at").order("created_at");
  if (error) throw new Error("Teammedlemmer kunne ikke hentes.");
  return (data ?? []) as TeamMember[];
}

export async function inviteTeamMember(input: unknown): Promise<InviteFormState> {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: { full_name: parsed.data.fullName, organization_id: context.organizationId },
    });
    return error ? { error: "Invitasjonen kunne ikke sendes." } : { success: true };
  } catch {
    return { error: "Serveren mangler SUPABASE_SERVICE_ROLE_KEY. Legg den inn i Vercel og lokalt før invitasjoner tas i bruk." };
  }
}
