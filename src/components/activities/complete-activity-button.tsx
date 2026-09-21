"use client";

import { useActionState } from "react";
import type { ActivityFormState } from "@/lib/data-access/activities";

const initialState: ActivityFormState = {};
type CompleteAction = (state: ActivityFormState, formData: FormData) => Promise<ActivityFormState>;
export function CompleteActivityButton({ action }: Readonly<{ action: CompleteAction }>) { const [state, formAction, isPending] = useActionState(action, initialState); return <div className="text-right"><form action={formAction}><button className="border border-[#b9ccc4] px-3 py-1.5 text-xs font-semibold text-[#31554a] hover:bg-[#e3ece8] disabled:opacity-50" disabled={isPending} type="submit">{isPending ? "..." : "Fullfør"}</button></form>{state.error ? <p className="mt-1 text-xs text-[#a63e2a]">{state.error}</p> : null}</div>; }
