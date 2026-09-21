"use client";

import { useActionState, useEffect, useRef } from "react";

import type { CustomerFormState } from "@/lib/data-access/customers";

const initialState: CustomerFormState = {};

type CustomerFormAction = (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;

export function CustomerForm({ action }: Readonly<{ action: CustomerFormAction }>) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-5" ref={formRef}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#19332d] sm:col-span-2">Firmanavn<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="companyName" required type="text" />{state.fieldErrors?.companyName ? <span className="mt-1 block text-xs font-normal text-[#a63e2a]">{state.fieldErrors.companyName[0]}</span> : null}</label>
        <label className="text-sm font-medium text-[#19332d]">Organisasjonsnummer<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="organizationNumber" type="text" /></label>
        <label className="text-sm font-medium text-[#19332d]">Bransje<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="industry" type="text" /></label>
        <label className="text-sm font-medium text-[#19332d]">E-post<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="email" type="email" />{state.fieldErrors?.email ? <span className="mt-1 block text-xs font-normal text-[#a63e2a]">{state.fieldErrors.email[0]}</span> : null}</label>
        <label className="text-sm font-medium text-[#19332d]">Telefon<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="phone" type="tel" /></label>
        <label className="text-sm font-medium text-[#19332d]">Poststed<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="city" type="text" /></label>
        <label className="text-sm font-medium text-[#19332d]">Kundetype<select className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" defaultValue="small_business" name="customerType"><option value="small_business">Liten bedrift</option><option value="medium_business">Mellomstor bedrift</option><option value="enterprise">Enterprise</option><option value="public_sector">Offentlig sektor</option><option value="partner">Partner</option></select></label>
        <label className="text-sm font-medium text-[#19332d]">Potensial (NOK)<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" defaultValue="0" min="0" name="potentialValue" step="1000" type="number" />{state.fieldErrors?.potentialValue ? <span className="mt-1 block text-xs font-normal text-[#a63e2a]">{state.fieldErrors.potentialValue[0]}</span> : null}</label>
      </div>
      <label className="block text-sm font-medium text-[#19332d]">Notater<textarea className="mt-2 min-h-24 w-full border border-[#c8d5cf] bg-white px-3 py-2 font-normal outline-none focus:border-[#c45c3d]" name="notes" /></label>
      {state.error ? <p className="text-sm text-[#a63e2a]" role="alert">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#31554a]" role="status">Kunden er opprettet.</p> : null}
      <button className="h-11 bg-[#19332d] px-5 text-sm font-semibold text-white transition hover:bg-[#31554a] disabled:cursor-not-allowed disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "Oppretter..." : "Opprett kunde"}</button>
    </form>
  );
}
