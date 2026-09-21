"use client";

import { useActionState } from "react";

import type { LeadFormState } from "@/lib/data-access/leads";

const initialState: LeadFormState = {};
type ConvertAction = (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;

export function ConvertLeadButton({ action }: Readonly<{ action: ConvertAction }>) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="flex flex-col items-end gap-1">
      {state.error ? <span className="text-xs text-[#a63e2a]" role="alert">{state.error}</span> : null}
      <form action={formAction}>
        <button className="border border-[#c45c3d] px-3 py-1.5 text-xs font-semibold text-[#a94730] transition hover:bg-[#fff8f5] disabled:opacity-50" disabled={isPending} type="submit">{isPending ? "Konverterer..." : "Konverter"}</button>
      </form>
    </div>
  );
}
