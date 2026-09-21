"use client";

import { useActionState, useEffect, useRef } from "react";
import type { InviteFormState } from "@/lib/data-access/team";

const initialState: InviteFormState = {};
type InviteAction = (state: InviteFormState, formData: FormData) => Promise<InviteFormState>;

export function InviteForm({ action }: Readonly<{ action: InviteAction }>) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) formRef.current?.reset(); }, [state.success]);
  return <form action={formAction} className="space-y-4" ref={formRef}><label className="block text-sm font-medium">Navn<input className="mt-2 h-11 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="fullName" required />{state.fieldErrors?.fullName ? <span className="mt-1 block text-xs text-[#a63e2a]">{state.fieldErrors.fullName[0]}</span> : null}</label><label className="block text-sm font-medium">E-post<input className="mt-2 h-11 w-full border border-[#c8d5cf] px-3 font-normal outline-none focus:border-[#c45c3d]" name="email" required type="email" />{state.fieldErrors?.email ? <span className="mt-1 block text-xs text-[#a63e2a]">{state.fieldErrors.email[0]}</span> : null}</label>{state.error ? <p className="text-sm text-[#a63e2a]" role="alert">{state.error}</p> : null}{state.success ? <p className="text-sm text-[#31554a]" role="status">Invitasjonen er sendt.</p> : null}<button className="h-11 bg-[#19332d] px-5 text-sm font-semibold text-white disabled:opacity-60" disabled={isPending} type="submit">{isPending ? "Sender..." : "Inviter bruker"}</button></form>;
}
