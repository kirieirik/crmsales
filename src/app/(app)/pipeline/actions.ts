"use server";

import { revalidatePath } from "next/cache";
import { createOpportunity, updateOpportunityStage, type OpportunityFormState } from "@/lib/data-access/opportunities";

export async function createOpportunityAction(_state: OpportunityFormState, formData: FormData) { const result = await createOpportunity(Object.fromEntries(formData)); if (result.success) revalidatePath("/pipeline"); return result; }
export async function updateOpportunityStageAction(opportunityId: string, _state: OpportunityFormState, formData: FormData) { const result = await updateOpportunityStage(opportunityId, String(formData.get("stage"))); if (result.success) revalidatePath("/pipeline"); return result; }
