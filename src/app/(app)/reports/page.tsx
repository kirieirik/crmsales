import { BarChart3, CircleDollarSign, Target, TrendingUp } from "lucide-react";

import { getReportsData } from "@/lib/data-access/reports";

const money = (value: number) => new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(value);

export default async function ReportsPage() {
  let data;
  let loadError = false;
  try { data = await getReportsData(); } catch { loadError = true; data = { stageRows: [], pipelineValue: 0, weightedPipeline: 0, wonThisMonth: 0, wonThisYear: 0, winRate: 0, averageDeal: 0, completedActivities: 0, newLeads: 0, convertedLeads: 0 }; }
  const metrics = [
    ["Pipeline", money(data.pipelineValue), "Åpne muligheter", CircleDollarSign],
    ["Vektet pipeline", money(data.weightedPipeline), "Verdi × sannsynlighet", Target],
    ["Vunnet denne måneden", money(data.wonThisMonth), "Registrert som vunnet", TrendingUp],
    ["Win rate", `${data.winRate}%`, `${data.averageDeal ? `Snitt ${money(data.averageDeal)}` : "Ingen vunne avtaler ennå"}`, BarChart3],
  ] as const;

  return <div className="mx-auto max-w-7xl"><div className="border-b border-[#d6dfda] pb-6"><p className="text-sm font-medium text-[#c45c3d]">Salg</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Rapporter</h1><p className="mt-2 text-sm text-[#54766a]">Tall som hjelper deg å prioritere neste salgssteg.</p></div>{loadError ? <p className="mt-5 text-sm text-[#a63e2a]" role="alert">Rapportdata kunne ikke hentes akkurat nå.</p> : null}<section className="grid gap-4 py-7 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, detail, Icon]) => <article className="border border-[#d6dfda] bg-white p-5" key={label}><div className="flex items-center justify-between"><p className="text-sm text-[#54766a]">{label}</p><Icon className="text-[#c45c3d]" size={18} /></div><p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-[#7b968b]">{detail}</p></article>)}</section><div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"><section className="border border-[#d6dfda] bg-white"><div className="border-b border-[#e8eeeb] px-6 py-5"><h2 className="font-semibold">Pipeline per fase</h2><p className="mt-1 text-sm text-[#54766a]">Antall og verdi i hver del av salgsløpet.</p></div>{data.stageRows.length === 0 ? <p className="p-8 text-sm text-[#7b968b]">Ingen opportunity-data ennå.</p> : <div className="divide-y divide-[#eef3f0]">{data.stageRows.map((row) => <div className="flex items-center justify-between gap-5 px-6 py-4" key={row.stage}><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-sm"><span className="font-medium">{row.label}</span><span className="text-[#54766a]">{row.count} {row.count === 1 ? "mulighet" : "muligheter"}</span></div><div className="mt-2 h-2 bg-[#e8eeeb]"><div className="h-full bg-[#c45c3d]" style={{ width: `${Math.max(8, Math.min(100, row.value / Math.max(data.pipelineValue, row.value) * 100))}%` }} /></div></div><span className="shrink-0 text-sm font-semibold">{money(row.value)}</span></div>)}</div>}</section><section className="border border-[#d6dfda] bg-white"><div className="border-b border-[#e8eeeb] px-6 py-5"><h2 className="font-semibold">Aktivitet og leads</h2><p className="mt-1 text-sm text-[#54766a]">Denne måneden.</p></div><dl className="divide-y divide-[#eef3f0]">{[["Fullførte aktiviteter", data.completedActivities], ["Nye leads", data.newLeads], ["Konverterte leads", data.convertedLeads], ["Vunnet i år", money(data.wonThisYear)]] .map(([label, value]) => <div className="flex items-center justify-between px-6 py-5" key={String(label)}><dt className="text-sm text-[#54766a]">{label}</dt><dd className="font-semibold">{value}</dd></div>)}</dl></section></div></div>;
}
