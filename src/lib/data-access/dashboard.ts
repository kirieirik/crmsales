import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardActivity = { id: string; title: string; due_date: string | null; priority: string; customer: { company_name: string } | null };
export type DashboardOpportunity = { id: string; title: string; value: number | string; probability: number; customer: { company_name: string } | null };

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export async function getDashboardData() {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const today = startOfDay(now).toISOString();
  const tomorrow = new Date(startOfDay(now).getTime() + 86_400_000).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString();

  const [profileResult, activitiesResult, leadsResult, opportunitiesResult, customersResult] = await Promise.all([
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return { user: null, profile: null };
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      return { user, profile };
    }),
    supabase.from("activities").select("id, title, due_date, priority, customer:customers(company_name)").eq("status", "open").gte("due_date", today).lt("due_date", tomorrow).order("due_date").limit(5),
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("opportunities").select("id, title, value, probability, stage, customer:customers(company_name)").not("stage", "in", "(won,lost)").order("value", { ascending: false }).limit(5),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("customer_status", "active"),
  ]);

  if (activitiesResult.error || leadsResult.error || opportunitiesResult.error || customersResult.error) throw new Error("Dashboarddata kunne ikke hentes.");

  const opportunities = (opportunitiesResult.data ?? []).map((item) => ({
    ...item,
    customer: Array.isArray(item.customer) ? item.customer[0] ?? null : item.customer,
  })) as DashboardOpportunity[];

  return {
    displayName: profileResult.profile?.full_name?.split(" ")[0] ?? profileResult.user?.email?.split("@")[0] ?? "der",
    activities: (activitiesResult.data ?? []).map((item) => ({ ...item, customer: Array.isArray(item.customer) ? item.customer[0] ?? null : item.customer })) as DashboardActivity[],
    newLeads: leadsResult.count ?? 0,
    activeCustomers: customersResult.count ?? 0,
    opportunities,
    pipelineValue: opportunities.reduce((total, item) => total + Number(item.value), 0),
    weightedPipeline: opportunities.reduce((total, item) => total + Number(item.value) * item.probability / 100, 0),
  };
}
