import { Plus, Search, UserRoundPlus } from "lucide-react";

import { LeadForm } from "@/components/leads/lead-form";
import { listLeads, type LeadListItem } from "@/lib/data-access/leads";
import { createLeadAction } from "./actions";

const sourceLabels: Record<string, string> = { website: "Nettside", referral: "Anbefaling", cold_outreach: "Kaldt salg", existing_customer: "Eksisterende kunde", trade_show: "Messe", linkedin: "LinkedIn", other: "Annet" };
const statusLabels: Record<string, string> = { new: "Ny", contacted: "Kontaktet", qualified: "Kvalifisert", converted: "Konvertert", lost: "Tapt" };

export default async function LeadsPage() {
  let leads: LeadListItem[] = [];
  let loadError = false;
  try { leads = await listLeads(); } catch { loadError = true; }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-[#d6dfda] pb-6 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#c45c3d]">Salg</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Leads</h1><p className="mt-2 text-sm text-[#54766a]">Fang opp nye muligheter før de forsvinner.</p></div><a className="flex h-10 items-center justify-center gap-2 bg-[#c45c3d] px-4 text-sm font-semibold text-white transition hover:bg-[#a94730]" href="#nytt-lead"><Plus size={16} />Nytt lead</a></div>
      <section className="mt-7 border border-[#d6dfda] bg-white"><div className="flex flex-col gap-4 border-b border-[#e8eeeb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Alle leads</h2><p className="mt-1 text-sm text-[#7b968b]">{leads.length} {leads.length === 1 ? "lead" : "leads"}</p></div><label className="flex h-10 items-center gap-2 border border-[#c8d5cf] px-3 text-sm text-[#7b968b]"><Search size={16} /><span className="sr-only">Søk etter lead</span><input className="w-full min-w-48 bg-transparent outline-none" placeholder="Søk etter lead" type="search" /></label></div>{loadError ? <div className="p-8 text-sm text-[#a63e2a]" role="alert">Leads kunne ikke hentes. Kontroller Supabase-tilkoblingen og prøv igjen.</div> : leads.length === 0 ? <div className="flex min-h-64 items-center justify-center px-6 text-center"><div><UserRoundPlus className="mx-auto text-[#b9ccc4]" size={30} strokeWidth={1.5} /><p className="mt-4 text-sm font-medium">Du har ingen leads ennå.</p><p className="mt-1 text-sm text-[#7b968b]">Opprett et lead for å begynne å bygge pipeline.</p></div></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#e8eeeb] text-xs uppercase tracking-wide text-[#7b968b]"><tr><th className="px-6 py-3 font-medium">Firma</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3 font-medium">Kilde</th><th className="px-6 py-3 text-right font-medium">Estimert verdi</th></tr></thead><tbody className="divide-y divide-[#eef3f0]">{leads.map((lead) => <tr className="hover:bg-[#fbfcfb]" key={lead.id}><td className="px-6 py-4"><p className="font-medium">{lead.company_name}</p><p className="mt-1 text-xs text-[#7b968b]">{lead.contact_name || lead.email || "Ingen kontakt registrert"}</p></td><td className="px-6 py-4"><span className="bg-[#e3ece8] px-2 py-1 text-xs font-medium text-[#31554a]">{statusLabels[lead.status] ?? lead.status}</span></td><td className="px-6 py-4 text-[#54766a]">{sourceLabels[lead.source] ?? lead.source}</td><td className="px-6 py-4 text-right font-medium">{new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(Number(lead.estimated_value))}</td></tr>)}</tbody></table></div>}</section>
      <section className="mt-7 border border-[#d6dfda] bg-white p-6" id="nytt-lead"><div className="mb-6 border-b border-[#e8eeeb] pb-5"><h2 className="font-semibold">Opprett lead</h2><p className="mt-1 text-sm text-[#54766a]">Registrer et nytt salgssignal med det du vet nå.</p></div><LeadForm action={createLeadAction} /></section>
    </div>
  );
}
