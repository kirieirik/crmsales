"use client";

import { useActionState } from "react";
import type { OpportunityFormState } from "@/lib/data-access/opportunities";

const initialState: OpportunityFormState = {};
type StageAction = (state: OpportunityFormState, formData: FormData) => Promise<OpportunityFormState>;
export function StageSelect({ stage, action, stages }: Readonly<{ stage: string; action: StageAction; stages: ReadonlyArray<readonly [string, string]> }>) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  return <form action={formAction} className="mt-4"><label className="sr-only" htmlFor={`stage-${stage}`}>Salgsfase</label><select className="w-full border border-[#c8d5cf] bg-white px-2 py-2 text-xs outline-none focus:border-[#c45c3d]" defaultValue={stage} disabled={isPending} id={`stage-${stage}`} name="stage" onChange={(event) => event.currentTarget.form?.requestSubmit()}>{stages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{state.error ? <span className="mt-1 block text-xs text-[#a63e2a]">{state.error}</span> : null}</form>;
}
