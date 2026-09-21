"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export type RegistryCompany = {
  organizationNumber: string;
  companyName: string;
  website: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  industry: string;
};

export function CompanySearchField({ name = "companyName", onSelect }: Readonly<{ name?: string; onSelect: (company: RegistryCompany) => void }>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RegistryCompany[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    if (query.trim().length < 2) return;
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`/api/brreg/search?q=${encodeURIComponent(query.trim())}`);
      const payload = await response.json() as { results?: RegistryCompany[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Søket kunne ikke gjennomføres.");
      setResults(payload.results ?? []);
    } catch (searchError) {
      setResults([]);
      setError(searchError instanceof Error ? searchError.message : "Søket kunne ikke gjennomføres.");
    } finally {
      setIsSearching(false);
    }
  }

  function select(company: RegistryCompany) {
    onSelect(company);
    setQuery(company.companyName);
    setResults([]);
  }

  return <div className="relative mt-2"><div className="flex"><input className="h-11 min-w-0 flex-1 border border-[#c8d5cf] bg-white px-3 font-normal outline-none focus:border-[#c45c3d]" name={name} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void search(); } }} required value={query} /><button aria-label="Søk i Enhetsregisteret" className="flex h-11 w-11 shrink-0 items-center justify-center border border-l-0 border-[#c8d5cf] text-[#19332d] hover:bg-[#e3ece8] disabled:opacity-50" disabled={isSearching} onClick={() => void search()} title="Søk i Enhetsregisteret" type="button"><Search size={17} /></button></div>{error ? <p className="mt-1 text-xs font-normal text-[#a63e2a]" role="alert">{error}</p> : null}{results.length > 0 ? <div className="absolute z-10 mt-1 w-full divide-y divide-[#e8eeeb] border border-[#d6dfda] bg-white shadow-lg">{results.map((company) => <button className="block w-full px-3 py-3 text-left hover:bg-[#f5f7f6]" key={company.organizationNumber} onClick={() => select(company)} type="button"><span className="block text-sm font-medium">{company.companyName}</span><span className="mt-1 block text-xs text-[#7b968b]">{company.organizationNumber} · {[company.postalCode, company.city].filter(Boolean).join(" ")}</span></button>)}</div> : null}</div>;
}
