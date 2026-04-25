import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

type SendPushBody = {
  title?: string;
  body?: string;
  url?: string;
};

async function sendPushNotifications(payload?: SendPushBody) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

    if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }

    webpush.setVapidDetails(
      "mailto:test@example.com",
      vapidPublicKey,
      vapidPrivateKey
    );

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) {
      console.error("Fetch subscriptions error:", error);
      return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
    }

    const notificationPayload = JSON.stringify({
      title: "💃 Dance With Me",
      body: payload?.body || payload?.title || "Nuova comunicazione disponibile",
      url: payload?.url || "/news",
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationPayload
        );
      } catch (err: any) {
        console.error("Push error:", err?.statusCode);

        // subscription scaduta → pulizia
        if (err?.statusCode === 410) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Global push error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as SendPushBody;
  return sendPushNotifications(body);
}

export async function GET() {
  return sendPushNotifications();
}