"use server";

import { revalidatePath } from "next/cache";

import { createContact, type ContactFormState } from "@/lib/data-access/customers";

export async function createContactAction(customerId: string, _state: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const result = await createContact(customerId, Object.fromEntries(formData));

  if (result.success) {
    revalidatePath(`/customers/${customerId}`);
  }

  return result;
}
