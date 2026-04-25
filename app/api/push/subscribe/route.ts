import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

type PushSubscriptionPayload = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

type SubscribeRequestBody = {
  subscription?: PushSubscriptionPayload;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubscribeRequestBody;
    const subscription = body.subscription;
    const endpoint = subscription?.endpoint;
    const p256dh = subscription?.keys?.p256dh;
    const auth = subscription?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Subscription non valida." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Configurazione server Supabase mancante." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint,
        p256dh,
        auth,
        user_agent: request.headers.get("user-agent"),
      },
      {
        onConflict: "endpoint",
      },
    );

    if (error) {
      console.error("Push subscription save error:", error);
      return NextResponse.json({ error: "Errore nel salvataggio della subscription." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }
}
