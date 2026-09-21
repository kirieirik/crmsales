import { Building2, Plus, Search } from "lucide-react";

import { CustomerForm } from "@/components/customers/customer-form";
import { createCustomerAction } from "./actions";
import { listCustomers, type CustomerListItem } from "@/lib/data-access/customers";

const statusLabels: Record<string, string> = {
  prospect: "Prospekt",
  active: "Aktiv",
  inactive: "Inaktiv",
  lost: "Tapt",
};

const typeLabels: Record<string, string> = {
  small_business: "Liten bedrift",
  medium_business: "Mellomstor",
  enterprise: "Enterprise",
  public_sector: "Offentlig",
  partner: "Partner",
};

export default async function CustomersPage() {
  let customers: CustomerListItem[] = [];
  let loadError = false;

  try {
    customers = await listCustomers();
  } catch {
    customers = [];
    loadError = true;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-[#d6dfda] pb-6 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#c45c3d]">Salg</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Kunder</h1><p className="mt-2 text-sm text-[#54766a]">Hold oversikt over virksomheter, potensial og neste steg.</p></div><a className="flex h-10 items-center justify-center gap-2 bg-[#c45c3d] px-4 text-sm font-semibold text-white transition hover:bg-[#a94730]" href="#ny-kunde"><Plus size={16} />Ny kunde</a></div>
      <section className="mt-7 border border-[#d6dfda] bg-white"><div className="flex flex-col gap-4 border-b border-[#e8eeeb] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">Alle kunder</h2><p className="mt-1 text-sm text-[#7b968b]">{customers.length} {customers.length === 1 ? "kunde" : "kunder"}</p></div><label className="flex h-10 items-center gap-2 border border-[#c8d5cf] px-3 text-sm text-[#7b968b]"><Search size={16} /><span className="sr-only">Søk etter kunde</span><input className="w-full min-w-48 bg-transparent outline-none" placeholder="Søk etter kunde" type="search" /></label></div>{loadError ? <div className="p-8 text-sm text-[#a63e2a]" role="alert">Kundene kunne ikke hentes. Kontroller Supabase-tilkoblingen og prøv igjen.</div> : customers.length === 0 ? <div className="flex min-h-64 items-center justify-center px-6 text-center"><div><Building2 className="mx-auto text-[#b9ccc4]" size={30} strokeWidth={1.5} /><p className="mt-4 text-sm font-medium">Du har ingen kunder ennå.</p><p className="mt-1 text-sm text-[#7b968b]">Opprett den første kunden for å starte kundeoversikten.</p></div></div> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-[#e8eeeb] text-xs uppercase tracking-wide text-[#7b968b]"><tr><th className="px-6 py-3 font-medium">Kunde</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3 font-medium">Type</th><th className="px-6 py-3 text-right font-medium">Potensial</th></tr></thead><tbody className="divide-y divide-[#eef3f0]">{customers.map((customer) => <tr className="hover:bg-[#fbfcfb]" key={customer.id}><td className="px-6 py-4"><p className="font-medium">{customer.company_name}</p><p className="mt-1 text-xs text-[#7b968b]">{[customer.industry, customer.city].filter(Boolean).join(" · ") || "Ingen tilleggsinformasjon"}</p></td><td className="px-6 py-4"><span className="bg-[#e3ece8] px-2 py-1 text-xs font-medium text-[#31554a]">{statusLabels[customer.customer_status] ?? customer.customer_status}</span></td><td className="px-6 py-4 text-[#54766a]">{typeLabels[customer.customer_type] ?? customer.customer_type}</td><td className="px-6 py-4 text-right font-medium">{new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(Number(customer.potential_value))}</td></tr>)}</tbody></table></div>}</section>
      <section className="mt-7 border border-[#d6dfda] bg-white p-6" id="ny-kunde"><div className="mb-6 border-b border-[#e8eeeb] pb-5"><h2 className="font-semibold">Opprett kunde</h2><p className="mt-1 text-sm text-[#54766a]">Legg inn grunninformasjonen. Kontakter kan legges til fra kundedetaljen.</p></div><CustomerForm action={createCustomerAction} /></section>
    </div>
  );
}
