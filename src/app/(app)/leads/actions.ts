"use server";

import { revalidatePath } from "next/cache";

import { convertLead, createLead, type LeadConversionState, type LeadFormState } from "@/lib/data-access/leads";

export async function createLeadAction(_state: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const result = await createLead(Object.fromEntries(formData));
  if (result.success) revalidatePath("/leads");
  return result;
}

export async function convertLeadAction(leadId: string, _state: LeadConversionState, _formData: FormData): Promise<LeadConversionState> {
  void _state;
  void _formData;
  const result = await convertLead(leadId);
  if (result.success) revalidatePath("/leads");
  return result;
}
