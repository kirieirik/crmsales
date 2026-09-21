"use server";

import { revalidatePath } from "next/cache";

import { createCustomer, type CustomerFormState } from "@/lib/data-access/customers";

export async function createCustomerAction(_state: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const result = await createCustomer(Object.fromEntries(formData));

  if (result.success) {
    revalidatePath("/customers");
  }

  return result;
}
