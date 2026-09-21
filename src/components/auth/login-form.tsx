"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Kunne ikke logge inn. Kontroller e-post og passord.");
      setIsSubmitting(false);
      return;
    }

    router.push(searchParams.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-[#19332d]" htmlFor="email">E-post</label>
        <input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 text-sm outline-none transition focus:border-[#c45c3d]" id="email" name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </div>
      <div>
        <label className="text-sm font-medium text-[#19332d]" htmlFor="password">Passord</label>
        <input className="mt-2 h-11 w-full border border-[#c8d5cf] bg-white px-3 text-sm outline-none transition focus:border-[#c45c3d]" id="password" name="password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </div>
      {error ? <p className="text-sm text-[#a63e2a]" role="alert">{error}</p> : null}
      <button className="h-11 w-full bg-[#19332d] px-4 text-sm font-semibold text-white transition hover:bg-[#31554a] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Logger inn..." : "Logg inn"}
      </button>
    </form>
  );
}
