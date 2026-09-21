import { Users } from "lucide-react";

import { InviteForm } from "@/components/team/invite-form";
import { listTeamMembers } from "@/lib/data-access/team";
import { inviteTeamMemberAction } from "./actions";

const roleLabels: Record<string, string> = { admin: "Administrator", sales: "Selger" };

export default async function SettingsPage() {
  let members = [] as Awaited<ReturnType<typeof listTeamMembers>>;
  let loadError = false;
  try { members = await listTeamMembers(); } catch { loadError = true; }
  return <div className="mx-auto max-w-5xl"><div className="border-b border-[#d6dfda] pb-6"><p className="text-sm font-medium text-[#c45c3d]">Administrasjon</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Team</h1><p className="mt-2 text-sm text-[#54766a]">Inviter kolleger til samme organisasjon. Teamet deler kunder, leads, pipeline og aktiviteter.</p></div><div className="grid gap-6 py-7 lg:grid-cols-[1.2fr_0.8fr]"><section className="border border-[#d6dfda] bg-white"><div className="border-b border-[#e8eeeb] px-6 py-5"><h2 className="font-semibold">Teammedlemmer</h2><p className="mt-1 text-sm text-[#7b968b]">{members.length} medlemmer</p></div>{loadError ? <p className="p-6 text-sm text-[#a63e2a]">Teamet kunne ikke hentes.</p> : <div className="divide-y divide-[#eef3f0]">{members.map((member) => <div className="flex items-center gap-4 px-6 py-5" key={member.id}><span className="flex h-9 w-9 items-center justify-center bg-[#e3ece8] text-xs font-semibold text-[#31554a]">{member.full_name.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="font-medium">{member.full_name}</p><p className="mt-1 truncate text-sm text-[#7b968b]">{member.email}</p></div><span className="text-xs text-[#54766a]">{roleLabels[member.role] ?? member.role}</span></div>)}</div>}</section><section className="border border-[#d6dfda] bg-white p-6"><div className="mb-6 flex items-center gap-3 border-b border-[#e8eeeb] pb-5"><Users className="text-[#c45c3d]" size={20} /><div><h2 className="font-semibold">Inviter kollega</h2><p className="mt-1 text-sm text-[#54766a]">Invitasjonen kobler brukeren til dette teamet.</p></div></div><InviteForm action={inviteTeamMemberAction} /></section></div></div>;
}
