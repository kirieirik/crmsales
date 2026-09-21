"use server";

import { revalidatePath } from "next/cache";

import { createLead, type LeadFormState } from "@/lib/data-access/leads";

export async function createLeadAction(_state: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const result = await createLead(Object.fromEntries(formData));
  if (result.success) revalidatePath("/leads");
  return result;
}
