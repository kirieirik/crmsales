"use client";

export function ArchiveCustomerButton({ action, customerId }: Readonly<{ action: (formData: FormData) => unknown; customerId: string }>) {
  const submit = async (formData: FormData) => { await action(formData); };
  return <form action={submit} onSubmit={(event) => { if (!window.confirm("Avslutte kunden og flytte åpne muligheter til Tapt? Historikken beholdes.")) event.preventDefault(); }}><input name="customerId" type="hidden" value={customerId} /><button className="border border-[#d8a99d] px-3 py-1.5 text-xs font-semibold text-[#a94730] hover:bg-[#fff8f5]" type="submit">Avslutt kunde</button></form>;
}
