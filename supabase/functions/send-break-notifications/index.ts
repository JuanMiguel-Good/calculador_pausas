import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "BNxx-vzPooERleLp7DPREp4Pbkd5NtYUnKKu-1Vw3yyy8_CrJ0LL0IOPP52ErOcBt0OgXywpc0_hN_Hd0X6y2E0";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "LuoGmexiuliEPMe4SsM7cfuDY2ue2rpBWfm_j5l0C7Q";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@pausaslab.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Current time in Peru (UTC-5, no DST)
    const nowUtc = new Date();
    const nowLima = new Date(nowUtc.getTime() - 5 * 60 * 60 * 1000);
    const currentMin = nowLima.getUTCHours() * 60 + nowLima.getUTCMinutes();

    const { data: workers, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        push_subscription,
        worker_assignments!worker_id (
          job_positions ( result )
        )
      `)
      .eq("alerts_enabled", true)
      .not("push_subscription", "is", null);

    if (error) throw error;
    if (!workers?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    for (const worker of workers) {
      const position = (worker.worker_assignments as any)?.[0]?.job_positions;
      if (!position?.result) continue;

      const { pausas = [], config = {} } = position.result;
      const horaIni: number = config.horaIni ?? 7;

      for (let i = 0; i < pausas.length; i++) {
        const p = pausas[i];
        const breakMin = horaIni * 60 + p.at;
        if (breakMin !== currentMin) continue;

        try {
          const payload = JSON.stringify({
            title: "Pausa laboral",
            body: `Pausa #${i + 1} — ${p.dur} minutos de descanso activo`,
            tag: `break-${worker.id}-${i}`,
            url: "/#/worker",
          });
          await webpush.sendNotification(worker.push_subscription, payload);
          sent++;
        } catch (pushErr: any) {
          // Subscription expired or unregistered — clean it up
          if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
            await supabase
              .from("profiles")
              .update({ push_subscription: null, alerts_enabled: false })
              .eq("id", worker.id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ sent, checked: workers.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
