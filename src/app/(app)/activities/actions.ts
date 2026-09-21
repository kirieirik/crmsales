"use server";

import { revalidatePath } from "next/cache";
import { completeActivity, createActivity, type ActivityFormState } from "@/lib/data-access/activities";

export async function createActivityAction(_state: ActivityFormState, formData: FormData) { const result = await createActivity(Object.fromEntries(formData)); if (result.success) revalidatePath("/activities"); return result; }
export async function completeActivityAction(activityId: string, _state: ActivityFormState, _formData: FormData) { void _state; void _formData; const result = await completeActivity(activityId); if (result.success) revalidatePath("/activities"); return result; }
