import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    redirect(user ? "/dashboard" : "/login");
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] px-6 py-10 text-[#19332d] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[#d6dfda] pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#54766a]">Arbeidsflate</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Nordlys CRM</h1>
          </div>
          <span className="rounded-full border border-[#b9ccc4] bg-white px-3 py-1 text-xs font-medium text-[#54766a]">Fase 0</span>
        </header>
        <section className="grid gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-5 text-sm font-medium text-[#c45c3d]">Grunnmuren er klar</p>
            <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Et roligere sted å drive salg fremover.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#54766a]">Nordlys CRM bygges for norske arbeidstøy- og B2B-salgsteam. Datamodell, RLS-strategi og utviklingsflyt er på plass; arbeidsflatene kommer i neste fase.</p>
          </div>
          <div className="border-l-2 border-[#c45c3d] pl-6">
            <p className="text-sm font-semibold text-[#19332d]">På plass nå</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#54766a]">
              <li>Next.js App Router og TypeScript</li>
              <li>Supabase-migrasjon med organisasjonsskille</li>
              <li>Dokumentert domene og arkitektur</li>
              <li>CI med lint, typecheck, test og build</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
