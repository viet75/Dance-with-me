import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AboutContentPayload = {
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  quote: string | null;
  updated_at?: string;
};

type PatchBody = AboutContentPayload & {
  id?: string | null;
};

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isValidPayload(body: unknown): body is PatchBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const data = body as Record<string, unknown>;
  return (
    (typeof data.id === "string" || data.id === undefined || data.id === null) &&
    typeof data.title === "string" &&
    isStringOrNull(data.subtitle) &&
    isStringOrNull(data.description) &&
    isStringOrNull(data.image_url) &&
    isStringOrNull(data.quote)
  );
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Payload non valido" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Configurazione Supabase mancante" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload: AboutContentPayload = {
      title: body.title.trim(),
      subtitle: body.subtitle,
      description: body.description,
      image_url: body.image_url,
      quote: body.quote,
      updated_at: body.updated_at ?? new Date().toISOString(),
    };

    let targetId = body.id ?? null;

    if (!targetId) {
      const { data: firstRow, error: findError } = await supabase
        .from("about_content")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findError) {
        return NextResponse.json({ error: findError.message }, { status: 500 });
      }

      targetId = firstRow?.id ?? null;
    }

    if (!targetId) {
      const { data: inserted, error: insertError } = await supabase.from("about_content").insert(payload).select("*").maybeSingle();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      if (!inserted) {
        return NextResponse.json({ error: "Nessuna riga inserita" }, { status: 404 });
      }

      return NextResponse.json(inserted);
    }

    const { data, error } = await supabase
      .from("about_content")
      .update(payload)
      .eq("id", targetId)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Nessuna riga aggiornata" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
