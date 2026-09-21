import { createSupabaseServerClient } from "@/lib/supabase/server";

export const reportStageLabels: Record<string, string> = { new_lead: "Ny lead", contacted: "Kontaktet", qualified: "Kvalifisert", meeting: "Møte", needs_mapped: "Behov kartlagt", proposal: "Tilbud", negotiation: "Forhandling", won: "Vunnet", lost: "Tapt" };

export async function getReportsData() {
  const supabase = await createSupabaseServerClient();
  const [opportunitiesResult, activitiesResult, leadsResult] = await Promise.all([
    supabase.from("opportunities").select("stage, value, probability, created_at, won_at"),
    supabase.from("activities").select("status, completed_at, created_at"),
    supabase.from("leads").select("status, created_at"),
  ]);
  if (opportunitiesResult.error || activitiesResult.error || leadsResult.error) throw new Error("Rapportdata kunne ikke hentes.");

  const opportunities = opportunitiesResult.data ?? [];
  const activities = activitiesResult.data ?? [];
  const leads = leadsResult.data ?? [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const won = opportunities.filter((item) => item.stage === "won");
  const decided = opportunities.filter((item) => item.stage === "won" || item.stage === "lost");
  const open = opportunities.filter((item) => item.stage !== "won" && item.stage !== "lost");
  const stageRows = Object.entries(reportStageLabels).map(([stage, label]) => {
    const rows = opportunities.filter((item) => item.stage === stage);
    return { stage, label, count: rows.length, value: rows.reduce((total, item) => total + Number(item.value), 0) };
  }).filter((row) => row.count > 0);

  return {
    stageRows,
    pipelineValue: open.reduce((total, item) => total + Number(item.value), 0),
    weightedPipeline: open.reduce((total, item) => total + Number(item.value) * Number(item.probability) / 100, 0),
    wonThisMonth: won.filter((item) => item.won_at && new Date(item.won_at) >= monthStart).reduce((total, item) => total + Number(item.value), 0),
    wonThisYear: won.filter((item) => item.won_at && new Date(item.won_at) >= yearStart).reduce((total, item) => total + Number(item.value), 0),
    winRate: decided.length ? Math.round((won.length / decided.length) * 100) : 0,
    averageDeal: won.length ? won.reduce((total, item) => total + Number(item.value), 0) / won.length : 0,
    completedActivities: activities.filter((item) => item.status === "completed").length,
    newLeads: leads.filter((item) => new Date(item.created_at) >= monthStart).length,
    convertedLeads: leads.filter((item) => item.status === "converted").length,
  };
}
