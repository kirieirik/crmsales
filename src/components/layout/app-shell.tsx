"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CheckSquare, ChevronRight, CircleDollarSign, LayoutDashboard, LogOut, Settings, Users, UserRoundPlus } from "lucide-react";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Kunder", icon: Users },
  { href: "/leads", label: "Leads", icon: UserRoundPlus },
  { href: "/pipeline", label: "Pipeline", icon: CircleDollarSign },
  { href: "/activities", label: "Aktiviteter", icon: CheckSquare },
  { href: "/reports", label: "Rapporter", icon: BarChart3 },
];

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#f5f7f6] text-[#19332d]">
      <aside className="hidden w-64 shrink-0 border-r border-[#d6dfda] bg-[#19332d] text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9ccc4]">Arbeidsflate</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">Nordlys</p>
        </div>
        <nav aria-label="Hovednavigasjon" className="flex-1 px-3 py-5">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8eada1]">Salg</p>
          <div className="space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return <Link className={`flex items-center gap-3 px-3 py-2.5 text-sm transition ${isActive ? "bg-white/12 font-semibold text-white" : "text-[#b9ccc4] hover:bg-white/8 hover:text-white"}`} href={href} key={href}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{isActive ? <ChevronRight className="ml-auto" size={15} /> : null}</Link>;
            })}
          </div>
        </nav>
        <div className="border-t border-white/10 p-3">
          <Link className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#b9ccc4] hover:text-white" href="/settings"><Settings size={17} strokeWidth={1.8} /><span>Innstillinger</span></Link>
          <button className="mt-1 flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[#b9ccc4] hover:text-white disabled:opacity-50" disabled={isSigningOut} onClick={signOut} type="button"><LogOut size={17} strokeWidth={1.8} /><span>{isSigningOut ? "Logger ut..." : "Logg ut"}</span></button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#d6dfda] bg-white px-6 lg:px-10">
          <Link className="text-lg font-semibold tracking-tight lg:hidden" href="/dashboard">Nordlys</Link>
          <p className="hidden text-sm text-[#54766a] lg:block">Mandag, 21. september 2026</p>
          <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center bg-[#e3ece8] text-xs font-semibold text-[#31554a]">AE</span><span className="hidden text-sm font-medium sm:block">Anders Ek</span></div>
        </header>
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
