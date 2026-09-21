"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { archiveCustomer, createCustomer, type CustomerFormState } from "@/lib/data-access/customers";

export async function createCustomerAction(_state: CustomerFormState, formData: FormData): Promise<CustomerFormState> {
  const result = await createCustomer(Object.fromEntries(formData));

  if (result.success) {
    revalidatePath("/customers");
  }

  return result;
}

export async function archiveCustomerAction(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "");
  const result = await archiveCustomer(customerId);

  if (result.success) {
    revalidatePath("/customers");
    revalidatePath(`/customers/${customerId}`);
    redirect("/customers");
  }

  return result;
}
