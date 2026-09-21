"use server";

import { revalidatePath } from "next/cache";
import { inviteTeamMember, type InviteFormState } from "@/lib/data-access/team";

export async function inviteTeamMemberAction(_state: InviteFormState, formData: FormData) { const result = await inviteTeamMember(Object.fromEntries(formData)); if (result.success) revalidatePath("/settings"); return result; }
