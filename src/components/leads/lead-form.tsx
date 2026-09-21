"use client";

import { useActionState, useEffect, useRef } from "react";

import type { LeadFormState } from "@/lib/data-access/leads";

const initialState: LeadFormState = {};
type LeadFormAction = (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;

export function LeadForm({ action }: Readonly<{ action: LeadFormAction }>) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-5" ref={formRef}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">Firmanavn<input className="mt-2 h-11 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="companyName" required />{state.fieldErrors?.companyName ? <span className="mt-1 block text-xs font-normal text-[#a63e2a]">{state.fieldErrors.companyName[0]}</span> : null}</label>
        <label className="text-sm font-medium">Kontaktperson<input className="mt-2 h-11 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="contactName" /></label>
        <label className="text-sm font-medium">Kilde<select className="mt-2 h-11 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" defaultValue="website" name="source"><option value="website">Nettside</option><option value="referral">Anbefaling</option><option value="cold_outreach">Kaldt salg</option><option value="existing_customer">Eksisterende kunde</option><option value="trade_show">Messe</option><option value="linkedin">LinkedIn</option><option value="other">Annet</option></select></label>
        <label className="text-sm font-medium">E-post<input className="mt-2 h-11 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="email" type="email" />{state.fieldErrors?.email ? <span className="mt-1 block text-xs font-normal text-[#a63e2a]">{state.fieldErrors.email[0]}</span> : null}</label>
        <label className="text-sm font-medium">Telefon<input className="mt-2 h-11 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="phone" type="tel" /></label>
        <label className="text-sm font-medium">Estimert verdi (NOK)<input className="mt-2 h-11 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" defaultValue="0" min="0" name="estimatedValue" step="1000" type="number" /></label>
      </div>
      <label className="block text-sm font-medium">Notater<textarea className="mt-2 min-h-24 w-full border border-[#c8d5cf] px-3 py-2 font-normal outline-none focus:border-[#c45c3d]" name="notes" /></label>
      {state.error ? <p className="text-sm text-[#a63e2a]" role="alert">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#31554a]" role="status">Leadet er opprettet.</p> : null}
      <button className="h-11 bg-[#19332d] px-5 text-sm font-semibold text-white transition hover:bg-[#31554a] disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "Oppretter..." : "Opprett lead"}</button>
    </form>
  );
}
