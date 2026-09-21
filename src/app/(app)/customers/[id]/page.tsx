import Link from "next/link";
import { ArrowLeft, Building2, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/customers/contact-form";
import { ArchiveCustomerButton } from "@/components/customers/archive-customer-button";
import { getCustomerDetail } from "@/lib/data-access/customers";
import { archiveCustomerAction } from "../actions";
import { createContactAction } from "./actions";

const statusLabels: Record<string, string> = { prospect: "Prospekt", active: "Aktiv", inactive: "Inaktiv", lost: "Tapt" };
const typeLabels: Record<string, string> = { small_business: "Liten bedrift", medium_business: "Mellomstor bedrift", enterprise: "Enterprise", public_sector: "Offentlig sektor", partner: "Partner" };

export default async function CustomerDetailPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);

  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-7xl">
      <Link className="inline-flex items-center gap-2 text-sm text-[#54766a] hover:text-[#19332d]" href="/customers"><ArrowLeft size={16} />Tilbake til kunder</Link>
      <header className="mt-6 flex flex-col justify-between gap-5 border-b border-[#d6dfda] pb-7 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-[#c45c3d]">Kundedetalj</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{customer.company_name}</h1><p className="mt-2 text-sm text-[#54766a]">{[customer.industry, customer.city].filter(Boolean).join(" · ") || "Ingen tilleggsinformasjon"}</p></div><div className="flex items-center gap-3"><span className="w-fit bg-[#e3ece8] px-3 py-1 text-xs font-medium text-[#31554a]">{statusLabels[customer.customer_status] ?? customer.customer_status}</span>{customer.customer_status !== "lost" ? <ArchiveCustomerButton action={archiveCustomerAction} customerId={customer.id} /> : null}</div></header>
      <div className="grid gap-6 py-7 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <section className="border border-[#d6dfda] bg-white p-6"><h2 className="font-semibold">Firmaopplysninger</h2><dl className="mt-5 space-y-4 text-sm"><div className="flex gap-3"><Building2 className="shrink-0 text-[#c45c3d]" size={17} /><div><dt className="text-xs text-[#7b968b]">Kundetype</dt><dd className="mt-1">{typeLabels[customer.customer_type] ?? customer.customer_type}</dd></div></div><div className="flex gap-3"><MapPin className="shrink-0 text-[#c45c3d]" size={17} /><div><dt className="text-xs text-[#7b968b]">Poststed</dt><dd className="mt-1">{customer.city || "Ikke registrert"}</dd></div></div><div className="flex gap-3"><Phone className="shrink-0 text-[#c45c3d]" size={17} /><div><dt className="text-xs text-[#7b968b]">Telefon</dt><dd className="mt-1">{customer.phone || "Ikke registrert"}</dd></div></div><div className="flex gap-3"><Mail className="shrink-0 text-[#c45c3d]" size={17} /><div><dt className="text-xs text-[#7b968b]">E-post</dt><dd className="mt-1">{customer.email || "Ikke registrert"}</dd></div></div></dl></section>
          <section className="border border-[#d6dfda] bg-white p-6"><p className="text-xs text-[#7b968b]">Potensielt salg</p><p className="mt-2 text-3xl font-semibold">{new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(Number(customer.potential_value))}</p><p className="mt-2 text-sm text-[#54766a]">{customer.notes || "Ingen notater registrert."}</p></section>
        </div>
        <div className="space-y-6"><section className="border border-[#d6dfda] bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Kontakter</h2><p className="mt-1 text-sm text-[#7b968b]">Personer knyttet til kunden.</p></div><UserRound className="text-[#c45c3d]" size={20} /></div>{customer.contacts.length === 0 ? <div className="py-8 text-sm text-[#7b968b]">Ingen kontakter lagt til ennå.</div> : <div className="mt-5 divide-y divide-[#eef3f0]">{customer.contacts.map((contact) => <div className="flex items-start justify-between gap-4 py-4 first:pt-0" key={contact.id}><div><p className="font-medium">{contact.first_name} {contact.last_name}{contact.is_primary ? <span className="ml-2 text-xs font-normal text-[#c45c3d]">Primær</span> : null}</p><p className="mt-1 text-sm text-[#54766a]">{contact.job_title || "Ingen stilling"}</p></div><div className="text-right text-xs text-[#7b968b]"><p>{contact.email || ""}</p><p className="mt-1">{contact.mobile || contact.phone || ""}</p></div></div>)}</div>}</section>
          <section className="border border-[#d6dfda] bg-white p-6"><h2 className="font-semibold">Ny kontakt</h2><p className="mt-1 mb-5 text-sm text-[#54766a]">Legg til en person som følger kunden.</p><ContactForm action={createContactAction.bind(null, customer.id)} /></section></div>
      </div>
    </div>
  );
}
