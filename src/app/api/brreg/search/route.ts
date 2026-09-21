import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const brregBaseUrl = "https://data.brreg.no/enhetsregisteret/api/enheter";

type BrregEntity = {
  organisasjonsnummer?: string;
  navn?: string;
  hjemmeside?: string;
  postadresse?: {
    adresse?: string[];
    postnummer?: string;
    poststed?: string;
    land?: string;
  };
  forretningsadresse?: {
    adresse?: string[];
    postnummer?: string;
    poststed?: string;
    land?: string;
  };
  naeringskode1?: { beskrivelse?: string };
};

type BrregSearchPayload = {
  _embedded?: { enheter?: BrregEntity[] };
};

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 2) return NextResponse.json({ results: [] });

  const isOrganizationNumber = /^\d{9}$/.test(query.replace(/\s/g, ""));
  const url = isOrganizationNumber
    ? `${brregBaseUrl}/${query.replace(/\s/g, "")}`
    : `${brregBaseUrl}?navn=${encodeURIComponent(query)}&size=8`;

  const response = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 300 } });
  if (response.status === 404) return NextResponse.json({ results: [] });
  if (!response.ok) return NextResponse.json({ error: "Enhetsregisteret er ikke tilgjengelig akkurat nå." }, { status: 502 });

  const payload = await response.json() as BrregSearchPayload | BrregEntity;
  const isSingleEntity = typeof payload === "object" && payload !== null && "organisasjonsnummer" in payload && typeof payload.organisasjonsnummer === "string";
  const entities: BrregEntity[] = isSingleEntity ? [payload as BrregEntity] : (payload as BrregSearchPayload)._embedded?.enheter ?? [];

  return NextResponse.json({
    results: entities.map((entity) => {
      const address = entity.forretningsadresse ?? entity.postadresse;
      return {
        organizationNumber: entity.organisasjonsnummer ?? "",
        companyName: entity.navn ?? "",
        website: entity.hjemmeside ? (entity.hjemmeside.startsWith("http") ? entity.hjemmeside : `https://${entity.hjemmeside}`) : "",
        address: address?.adresse?.join(", ") ?? "",
        postalCode: address?.postnummer ?? "",
        city: address?.poststed ?? "",
        country: address?.land ?? "Norge",
        industry: entity.naeringskode1?.beskrivelse ?? "",
      };
    }),
  });
}
