"use client";

import { useActionState, useEffect, useRef } from "react";

import type { ContactFormState } from "@/lib/data-access/customers";

const initialState: ContactFormState = {};

type ContactFormAction = (state: ContactFormState, formData: FormData) => Promise<ContactFormState>;

export function ContactForm({ action }: Readonly<{ action: ContactFormAction }>) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4" ref={formRef}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Fornavn<input className="mt-2 h-10 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="firstName" required /></label>
        <label className="text-sm font-medium">Etternavn<input className="mt-2 h-10 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="lastName" required /></label>
        <label className="text-sm font-medium">Stilling<input className="mt-2 h-10 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="jobTitle" /></label>
        <label className="text-sm font-medium">E-post<input className="mt-2 h-10 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="email" type="email" /></label>
        <label className="text-sm font-medium">Telefon<input className="mt-2 h-10 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="phone" type="tel" /></label>
        <label className="text-sm font-medium">Mobil<input className="mt-2 h-10 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="mobile" type="tel" /></label>
      </div>
      <label className="flex items-center gap-2 text-sm"><input className="h-4 w-4 accent-[#c45c3d]" name="isPrimary" type="checkbox" />Primærkontakt</label>
      {state.error ? <p className="text-sm text-[#a63e2a]" role="alert">{state.error}</p> : null}
      {state.fieldErrors?.firstName ? <p className="text-sm text-[#a63e2a]">{state.fieldErrors.firstName[0]}</p> : null}
      {state.success ? <p className="text-sm text-[#31554a]" role="status">Kontakten er opprettet.</p> : null}
      <button className="h-10 bg-[#19332d] px-4 text-sm font-semibold text-white transition hover:bg-[#31554a] disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "Lagrer..." : "Legg til kontakt"}</button>
    </form>
  );
}
