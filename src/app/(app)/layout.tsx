import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let displayName = "Bruker";
  let email = "";

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    email = user.email ?? "";
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    displayName = profile?.full_name ?? user.email?.split("@")[0] ?? displayName;
  }

  return <AppShell displayName={displayName} email={email}>{children}</AppShell>;
}
