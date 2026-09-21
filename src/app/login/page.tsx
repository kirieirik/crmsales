import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const isConfigured = isSupabaseConfigured();

  return (
    <main className="min-h-screen bg-[#f5f7f6] px-6 py-10 text-[#19332d] sm:px-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center">
        <Link className="mb-10 inline-flex" href="/"><Image alt="Jarlsberg" height={38} src="/JarlsbergBlack.svg" width={180} /></Link>
        <section className="border border-[#d6dfda] bg-white p-7 shadow-[0_18px_50px_rgba(25,51,45,0.06)] sm:p-9">
          <p className="text-sm font-medium text-[#c45c3d]">Salgsteamets arbeidsflate</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Velkommen tilbake</h1>
          <p className="mt-3 text-sm leading-6 text-[#54766a]">Logg inn for å se dagens aktiviteter, kunder og muligheter.</p>
          <div className="mt-8">
            {isConfigured ? <Suspense fallback={<p className="text-sm text-[#54766a]">Laster innlogging...</p>}><LoginForm /></Suspense> : <p className="border border-[#ead8d0] bg-[#fff8f5] p-4 text-sm leading-6 text-[#a63e2a]">Supabase er ikke konfigurert ennå. Kopier `.env.example` til `.env.local` og legg inn prosjektverdiene før innlogging.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
