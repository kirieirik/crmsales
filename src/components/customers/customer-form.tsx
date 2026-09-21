"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type { CustomerFormState } from "@/lib/data-access/customers";

const initialState: CustomerFormState = {};

type CustomerFormAction = (state: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;

export function CustomerForm({ action }: Readonly<{ action: CustomerFormAction }>) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Array<Record<string, string>>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function searchRegistry() {
    if (searchTerm.trim().length < 2) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const response = await fetch(`/api/brreg/search?q=${encodeURIComponent(searchTerm.trim())}`);
      const payload = await response.json() as { results?: Array<Record<string, string>>; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Søket kunne ikke gjennomføres.");
      setSearchResults(payload.results ?? []);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Søket kunne ikke gjennomføres.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function selectResult(result: Record<string, string>) {
    const form = formRef.current;
    if (!form) return;
    for (const [name, value] of Object.entries(result)) {
      const field = form.elements.namedItem(name) as HTMLInputElement | null;
      if (field) field.value = value;
    }
    setSearchResults([]);
    setSearchTerm(result.companyName ?? "");
  }

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-5" ref={formRef}>
      <div className="border border-[#e8eeeb] bg-[#fbfcfb] p-4"><p className="text-sm font-semibold">Finn firma i Enhetsregisteret</p><p className="mt-1 text-xs text-[#7b968b]">Søk på navn eller organisasjonsnummer for å fylle ut feltene automatisk.</p><div className="mt-3 flex gap-2"><input className="h-10 min-w-0 flex-1 border border-[#c8d5cf] bg-white px-3 text-sm outline-none focus:border-[#c45c3d]" onChange={(event) => setSearchTerm(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchRegistry(); } }} placeholder="F.eks. Equinor eller 923609016" value={searchTerm} /><button className="h-10 shrink-0 border border-[#19332d] px-4 text-sm font-semibold text-[#19332d] disabled:opacity-50" disabled={isSearching} onClick={() => void searchRegistry()} type="button">{isSearching ? "Søker..." : "Søk"}</button></div>{searchError ? <p className="mt-2 text-xs text-[#a63e2a]" role="alert">{searchError}</p> : null}{searchResults.length > 0 ? <div className="mt-3 divide-y divide-[#e8eeeb] border border-[#d6dfda] bg-white">{searchResults.map((result) => <button className="block w-full px-3 py-3 text-left hover:bg-[#f5f7f6]" key={result.organizationNumber} onClick={() => selectResult(result)} type="button"><span className="block text-sm font-medium">{result.companyName}</span><span className="mt-1 block text-xs text-[#7b968b]">{result.organizationNumber} · {[result.address, result.postalCode, result.city].filter(Boolean).join(", ")}</span></button>)}</div> : null}</div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#19332d] sm:col-span-2">Firmanavn<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="companyName" required type="text" />{state.fieldErrors?.companyName ? <span className="mt-1 block text-xs font-normal text-[#a63e2a]">{state.fieldErrors.companyName[0]}</span> : null}</label>
        <label className="text-sm font-medium text-[#19332d]">Organisasjonsnummer<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="organizationNumber" type="text" /></label>
        <label className="text-sm font-medium text-[#19332d]">Bransje<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="industry" type="text" /></label>
        <label className="text-sm font-medium text-[#19332d]">E-post<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="email" type="email" />{state.fieldErrors?.email ? <span className="mt-1 block text-xs font-normal text-[#a63e2a]">{state.fieldErrors.email[0]}</span> : null}</label>
        <label className="text-sm font-medium text-[#19332d]">Telefon<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="phone" type="tel" /></label>
        <label className="text-sm font-medium text-[#19332d]">Nettside<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="website" type="url" /></label>
        <label className="text-sm font-medium text-[#19332d] sm:col-span-2">Adresse<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="address" type="text" /></label>
        <label className="text-sm font-medium text-[#19332d]">Postnummer<input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name="postalCode" type="text" /></label>
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
