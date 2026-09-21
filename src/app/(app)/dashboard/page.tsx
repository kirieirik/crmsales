import { Activity, ArrowUpRight, CircleDollarSign, Users, UserRoundPlus } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const metrics = [
  { label: "Dagens aktiviteter", value: "0", detail: "Ingen planlagt ennå", icon: Activity },
  { label: "Nye leads", value: "0", detail: "Siste 7 dager", icon: UserRoundPlus },
  { label: "Pipeline", value: "0 kr", detail: "Åpne muligheter", icon: CircleDollarSign },
  { label: "Aktive kunder", value: "0", detail: "Ingen data koblet", icon: Users },
];

export default async function DashboardPage() {
  let displayName = "Anders";

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      displayName = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? displayName;
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-[#d6dfda] pb-6 sm:flex-row sm:items-end">
        <div><p className="text-sm font-medium text-[#c45c3d]">Oversikt</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">God morgen, {displayName}</h1><p className="mt-2 text-sm text-[#54766a]">Her er det viktigste for salgsdagen din.</p></div>
        <button className="flex h-10 items-center justify-center gap-2 bg-[#c45c3d] px-4 text-sm font-semibold text-white transition hover:bg-[#a94730]" type="button"><ArrowUpRight size={16} />Ny aktivitet</button>
      </div>
      <section className="grid gap-4 py-7 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => <article className="border border-[#d6dfda] bg-white p-5" key={label}><div className="flex items-center justify-between"><p className="text-sm text-[#54766a]">{label}</p><Icon className="text-[#c45c3d]" size={18} strokeWidth={1.8} /></div><p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-[#7b968b]">{detail}</p></article>)}
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <article className="border border-[#d6dfda] bg-white"><div className="border-b border-[#e8eeeb] px-6 py-5"><h2 className="font-semibold">Dagens aktiviteter</h2><p className="mt-1 text-sm text-[#54766a]">Oppgaver og oppfølginger som krever oppmerksomhet.</p></div><div className="flex min-h-64 items-center justify-center px-6 text-center"><div><Activity className="mx-auto text-[#b9ccc4]" size={28} strokeWidth={1.5} /><p className="mt-4 text-sm font-medium">Ingen aktiviteter i dag</p><p className="mt-1 text-sm text-[#7b968b]">Opprett en aktivitet for å holde neste steg synlig.</p></div></div></article>
        <article className="border border-[#d6dfda] bg-white"><div className="border-b border-[#e8eeeb] px-6 py-5"><h2 className="font-semibold">Pipeline</h2><p className="mt-1 text-sm text-[#54766a]">Fordeling etter salgsfase.</p></div><div className="flex min-h-64 items-center justify-center px-6 text-center"><div><CircleDollarSign className="mx-auto text-[#b9ccc4]" size={28} strokeWidth={1.5} /><p className="mt-4 text-sm font-medium">Pipeline er tom</p><p className="mt-1 text-sm text-[#7b968b]">Muligheter vises her når de er opprettet.</p></div></div></article>
      </section>
    </div>
  );
}
